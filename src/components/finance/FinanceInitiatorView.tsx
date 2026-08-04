import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import {
  DollarSign,
  CheckCircle2,
  Building2,
  Calendar,
  AlertCircle,
  FileCheck,
  ArrowRight,
  User,
  X
} from 'lucide-react';
import { User as UserType } from '../../utils/auth';
import { formatDisplayDate } from '../../utils/dateFormat';
import { getRebatePercent, rebateOptionsFromRecord } from '../../utils/rebateCalculation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface Application {
  id: string;
  companyName: string;
  registrationNumber: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  rebateAmount: string;
  status: string;
  createdAt: string;
  riderName?: string;
  riderNationalId?: string;
  eMotoModel?: string;
  eMotoPrice?: string;
  organizationName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  reviewHistory?: any[];
  qaApprovedAt?: string;
  cfoApprovedAt?: string;
}

interface FinanceInitiatorViewProps {
  user: UserType;
}

export function FinanceInitiatorView({ user }: FinanceInitiatorViewProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [showInitiateDialog, setShowInitiateDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'amount' | 'date' | 'financier'>('date');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const FUND_TOTAL = 1400000; // EUR 1.4M in currency
  const WEEKLY_LIMIT = 10000; // EUR 10K

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingInitiation();
      setApplications(data);
    } catch (error: any) {
      toast.error('Failed to load applications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectApp = (appId: string) => {
    const newSelected = new Set(selectedApps);
    if (newSelected.has(appId)) {
      newSelected.delete(appId);
    } else {
      newSelected.add(appId);
    }
    setSelectedApps(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedApps.size === filteredAndSortedApps.length) {
      setSelectedApps(new Set());
    } else {
      setSelectedApps(new Set(filteredAndSortedApps.map(app => app.id)));
    }
  };

  const calculateSelectedTotal = () => {
    return applications
      .filter(app => selectedApps.has(app.id))
      .reduce((sum, app) => sum + (parseFloat(app.rebateAmount) || 0), 0);
  };

  const handleInitiate = async () => {
    if (selectedApps.size === 0) {
      toast.error('Please select at least one application');
      return;
    }

    const totalAmount = calculateSelectedTotal();
    const exceedsWeeklyLimit = totalAmount > WEEKLY_LIMIT;

    if (exceedsWeeklyLimit) {
      toast.warning(`Total amount (${formatCurrency(totalAmount)}) exceeds weekly limit of ${formatCurrency(WEEKLY_LIMIT)}`);
    }

    setProcessing(true);
    try {
      const result = await api.initiateDisbursement(Array.from(selectedApps), notes);
      
      if (result.requiresExceptionApproval) {
        toast.warning(result.message, { duration: 5000 });
      } else {
        toast.success(result.message);
      }

      setShowInitiateDialog(false);
      setSelectedApps(new Set());
      setNotes('');
      loadApplications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate disbursement');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      'qa-approved': { label: 'QA Approved', className: 'bg-blue-100 text-blue-800' },
      'cfo-approved': { label: 'CFO Approved', className: 'bg-green-100 text-green-800' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredAndSortedApps = applications
    .filter(app => {
      const searchLower = searchTerm.toLowerCase();
      return (
        app.companyName?.toLowerCase().includes(searchLower) ||
        app.riderName?.toLowerCase().includes(searchLower) ||
        app.registrationNumber?.toLowerCase().includes(searchLower) ||
        app.contactPerson?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'amount') {
        return parseFloat(b.rebateAmount) - parseFloat(a.rebateAmount);
      } else if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'financier') {
        return (a.companyName || '').localeCompare(b.companyName || '');
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredAndSortedApps.length / itemsPerPage);
  const paginatedApps = filteredAndSortedApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalDisbursed = 0; // Calculate from historical data
  const remainingBudget = FUND_TOTAL - totalDisbursed;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#023F40] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Budget Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Fund</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-[#023F40]">
              {formatCurrency(FUND_TOTAL)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Remaining Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              {formatCurrency(remainingBudget)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Weekly Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-orange-600">
              {formatCurrency(WEEKLY_LIMIT)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Exception approval if exceeded</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Disbursement Queue</CardTitle>
              <CardDescription>
                QA-approved applications ready for payment initiation
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowInitiateDialog(true)}
              disabled={selectedApps.size === 0}
              className="bg-[#023F40] hover:bg-[#035f60]"
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Initiate Disbursement ({selectedApps.size})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by company, rider, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Submission Date</SelectItem>
                  <SelectItem value="amount">Rebate Amount</SelectItem>
                  <SelectItem value="financier">Asset Financier</SelectItem>
                </SelectContent>
              </Select>
              {searchTerm !== '' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {/* Selected Applications Summary */}
          {selectedApps.size > 0 && (
            <div className="mb-4 p-4 bg-[#6DB27F]/10 border border-[#6DB27F]/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#023F40]">
                    {selectedApps.size} application{selectedApps.size !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-sm text-gray-600">
                    Total amount: {formatCurrency(calculateSelectedTotal())}
                  </p>
                </div>
                {calculateSelectedTotal() > WEEKLY_LIMIT && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Exceeds weekly limit</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Applications Table */}
          {paginatedApps.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No applications pending initiation</p>
              <p className="text-sm text-gray-500 mt-2">
                Applications approved by QA will appear here
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">
                        <Checkbox
                          checked={selectedApps.size === filteredAndSortedApps.length && filteredAndSortedApps.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Application
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Asset Financier
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Rider
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Rebate Amount
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedApps.map((app) => (
                      <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Checkbox
                            checked={selectedApps.has(app.id)}
                            onCheckedChange={() => handleSelectApp(app.id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {app.registrationNumber || app.id.slice(-8)}
                            </p>
                            <p className="text-sm text-gray-500">{formatDisplayDate(app.createdAt)}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{app.companyName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{app.riderName || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#023F40]">
                            {formatCurrency(app.rebateAmount)} ({getRebatePercent(rebateOptionsFromRecord(app))})
                          </span>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(app.status)}</td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedApp(app);
                              setShowDetailsDialog(true);
                            }}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredAndSortedApps.length)} of{' '}
                    {filteredAndSortedApps.length} applications
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Initiate Disbursement Dialog */}
      <Dialog open={showInitiateDialog} onOpenChange={setShowInitiateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Initiate Disbursement</DialogTitle>
            <DialogDescription>
              You are about to initiate payment for {selectedApps.size} application
              {selectedApps.size !== 1 ? 's' : ''}. This will require approval from a second authorized user.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Applications Selected</p>
                  <p className="font-semibold text-lg">{selectedApps.size}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Amount</p>
                  <p className="font-semibold text-lg text-[#023F40]">
                    {formatCurrency(calculateSelectedTotal())}
                  </p>
                </div>
              </div>

              {calculateSelectedTotal() > WEEKLY_LIMIT && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-orange-800">
                    <p className="font-medium">Weekly Limit Exceeded</p>
                    <p>
                      This disbursement exceeds the weekly limit of {formatCurrency(WEEKLY_LIMIT)}.
                      Exception approval will be required.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or comments about this disbursement batch..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Digital Signature:</strong> By initiating this disbursement, you digitally
                sign as the first authorized user. A second signature will be required for final
                approval.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInitiateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInitiate}
              disabled={processing}
              className="bg-[#023F40] hover:bg-[#035f60]"
            >
              {processing ? 'Processing...' : 'Initiate Disbursement'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review all verification checkmarks and banking details
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6">
              {/* Rider Information */}
              <div>
                <h3 className="font-semibold text-[#023F40] mb-3">Rider Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-medium">{selectedApp.riderName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">National ID</p>
                    <p className="font-medium">{selectedApp.riderNationalId || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* E-Moto Details */}
              <div>
                <h3 className="font-semibold text-[#023F40] mb-3">E-Moto Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Model</p>
                    <p className="font-medium">{selectedApp.eMotoModel || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Price</p>
                    <p className="font-medium">
                      {selectedApp.eMotoPrice ? formatCurrency(selectedApp.eMotoPrice) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Banking Details */}
              <div>
                <h3 className="font-semibold text-[#023F40] mb-3">Banking Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Bank Name</p>
                    <p className="font-medium">{selectedApp.bankName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Account Number</p>
                    <p className="font-medium">{selectedApp.bankAccountNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Verification Checkmarks */}
              <div>
                <h3 className="font-semibold text-[#023F40] mb-3">Verification Status</h3>
                <div className="space-y-2">
                  {selectedApp.reviewHistory && selectedApp.reviewHistory.length > 0 ? (
                    selectedApp.reviewHistory.map((review: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{review.reviewerRole}</p>
                          <p className="text-xs text-gray-600">{review.decision} - {review.notes}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">All Verifications Completed</p>
                        <p className="text-xs text-gray-600">
                          Analyst and QA checks completed successfully
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-[#023F40] text-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Rebate Amount</p>
                    <p className="text-2xl font-bold">{formatCurrency(selectedApp.rebateAmount)} ({getRebatePercent(rebateOptionsFromRecord(selectedApp))})</p>
                  </div>
                  <DollarSign className="w-8 h-8 opacity-75" />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
