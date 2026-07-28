import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import {
  DollarSign,
  CheckCircle2,
  XCircle,
  Building2,
  User,
  FileText,
  Shield,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { User as UserType } from '../../utils/auth';
import { formatDisplayDateTime } from '../../utils/dateFormat';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

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
  bankAccountNumber?: string;
  bankName?: string;
  reviewHistory?: any[];
  initiatedBy?: string;
  initiatedAt?: string;
  initiationDetails?: {
    id: string;
    initiatorName: string;
    initiatorEmail: string;
    initiatedAt: string;
    amount: string;
    notes: string;
    signature: string;
  };
}

interface FinanceApproverViewProps {
  user: UserType;
}

export function FinanceApproverView({ user }: FinanceApproverViewProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingApproval();
      setApplications(data);
    } catch (error: any) {
      toast.error('Failed to load applications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;

    // Check if user is trying to approve their own initiation
    if (selectedApp.initiatedBy === user.id) {
      toast.error('Security Violation: You cannot approve a disbursement that you initiated');
      return;
    }

    setProcessing(true);
    try {
      await api.approveDisbursement(selectedApp.id, notes);
      toast.success('Disbursement approved successfully');
      setShowApproveDialog(false);
      setNotes('');
      setSelectedApp(null);
      loadApplications();
    } catch (error: any) {
      if (error.message.includes('Security Violation')) {
        toast.error(error.message, { duration: 5000 });
      } else {
        toast.error(error.message || 'Failed to approve disbursement');
      }
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;

    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      await api.rejectDisbursement(selectedApp.id, rejectionReason);
      toast.success('Disbursement rejected');
      setShowRejectDialog(false);
      setRejectionReason('');
      setSelectedApp(null);
      loadApplications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject disbursement');
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

  const filteredApps = applications.filter(app => {
    const searchLower = searchTerm.toLowerCase();
    return (
      app.companyName?.toLowerCase().includes(searchLower) ||
      app.riderName?.toLowerCase().includes(searchLower) ||
      app.registrationNumber?.toLowerCase().includes(searchLower) ||
      app.initiationDetails?.initiatorName?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const canApprove = (app: Application) => {
    return app.initiatedBy !== user.id;
  };

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
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#6DB27F]/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#6DB27F]" />
            </div>
            <div>
              <CardTitle>Final Approval Queue</CardTitle>
              <CardDescription>
                Applications initiated and awaiting second signature
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                {applications.length} application{applications.length !== 1 ? 's' : ''} awaiting final approval
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Search by company, rider, or initiator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Applications List */}
          {paginatedApps.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No applications pending approval</p>
              <p className="text-sm text-gray-500 mt-2">
                Initiated disbursements will appear here for final approval
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedApps.map((app) => {
                  const isOwnInitiation = app.initiatedBy === user.id;
                  return (
                    <div
                      key={app.id}
                      className={`border rounded-lg p-6 ${
                        isOwnInitiation
                          ? 'bg-red-50 border-red-200'
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          {/* Application Info */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {app.registrationNumber || app.id.slice(-8)}
                              </h3>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  <span>{app.companyName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  <span>{app.riderName || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Rebate Amount</p>
                              <p className="text-2xl font-bold text-[#023F40]">
                                {formatCurrency(app.rebateAmount)}
                              </p>
                            </div>
                          </div>

                          {/* Initiation Details */}
                          {app.initiationDetails && (
                            <div className="bg-[#6DB27F]/10 border border-[#6DB27F]/30 rounded-lg p-4 mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-[#6DB27F]" />
                                <span className="font-medium text-sm text-gray-900">
                                  Initiation Details (First Signature)
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-600">Initiated By</p>
                                  <p className="font-medium">{app.initiationDetails.initiatorName}</p>
                                  <p className="text-xs text-gray-500">
                                    {app.initiationDetails.initiatorEmail}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Initiated At</p>
                                  <p className="font-medium">{formatDisplayDateTime(app.initiationDetails.initiatedAt)}</p>
                                </div>
                                {app.initiationDetails.notes && (
                                  <div className="md:col-span-2">
                                    <p className="text-gray-600">Notes</p>
                                    <p className="font-medium">{app.initiationDetails.notes}</p>
                                  </div>
                                )}
                                <div className="md:col-span-2">
                                  <p className="text-gray-600">Digital Signature</p>
                                  <p className="font-mono text-xs text-gray-700 bg-gray-100 p-2 rounded">
                                    {app.initiationDetails.signature}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Warning for own initiation */}
                          {isOwnInitiation && (
                            <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4 flex items-start gap-2">
                              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                              <div className="text-sm text-red-800">
                                <p className="font-semibold">Security Policy Violation</p>
                                <p>
                                  You initiated this disbursement and cannot provide the second signature.
                                  Another authorized approver must review this application.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Verification Checkmarks */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Analyst Approved
                            </Badge>
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              QA Approved
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Finance Initiated
                            </Badge>
                          </div>

                          {/* Banking Details */}
                          <div className="text-sm">
                            <p className="text-gray-600">Banking Details</p>
                            <p className="font-medium">
                              {app.bankName} - {app.bankAccountNumber}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 md:w-48">
                          <Button
                            onClick={() => {
                              setSelectedApp(app);
                              setShowApproveDialog(true);
                            }}
                            disabled={isOwnInitiation}
                            className="bg-[#6DB27F] hover:bg-[#5da26f] text-white"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedApp(app);
                              setShowRejectDialog(true);
                            }}
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredApps.length)} of{' '}
                    {filteredApps.length} applications
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

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Final Approval - Second Signature</DialogTitle>
            <DialogDescription>
              You are providing the second signature to authorize this disbursement
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Application</p>
                    <p className="font-semibold">{selectedApp.registrationNumber || selectedApp.id.slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Amount</p>
                    <p className="font-semibold text-[#023F40]">
                      {formatCurrency(selectedApp.rebateAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Asset Financier</p>
                    <p className="font-semibold">{selectedApp.companyName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Rider</p>
                    <p className="font-semibold">{selectedApp.riderName || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {selectedApp.initiationDetails && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-2">First Signature</p>
                  <p className="text-sm text-blue-800">
                    Initiated by: <strong>{selectedApp.initiationDetails.initiatorName}</strong>
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {formatDisplayDateTime(selectedApp.initiationDetails.initiatedAt)}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="approval-notes">Approval Notes (Optional)</Label>
                <Textarea
                  id="approval-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes or comments about this approval..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-900">
                  <strong>Digital Signature:</strong> By approving, you digitally sign as the second
                  authorized user. The payment will be released for processing.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={processing}
              className="bg-[#6DB27F] hover:bg-[#5da26f] text-white"
            >
              {processing ? 'Processing...' : 'Approve & Release Payment'}
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Reject Disbursement</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this disbursement
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Application</p>
                <p className="font-semibold">{selectedApp.registrationNumber || selectedApp.id.slice(-8)}</p>
                <p className="text-sm text-gray-600 mt-2">Amount</p>
                <p className="font-semibold text-[#023F40]">
                  {formatCurrency(selectedApp.rebateAmount)}
                </p>
              </div>

              <div>
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this disbursement is being rejected..."
                  rows={4}
                  className="mt-1"
                  required
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {processing ? 'Processing...' : 'Reject Disbursement'}
              <XCircle className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
