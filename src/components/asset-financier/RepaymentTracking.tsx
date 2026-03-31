import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Download,
  Plus,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Pagination, usePagination } from '../ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface RepaymentRecord {
  id: string;
  riderName: string;
  applicationId: string;
  motorcycleBrand: string;
  loanAmount: number;
  monthlyAmount: number;
  totalPaid: number;
  remainingBalance: number;
  nextPaymentDate: string;
  status: 'on-track' | 'due-soon' | 'overdue' | 'completed';
  lastPaymentDate?: string;
  paymentsComplete: number;
  totalPayments: number;
}

interface RepaymentTrackingProps {
  organizationId: string;
}

export function RepaymentTracking({ organizationId }: RepaymentTrackingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [selectedRepayment, setSelectedRepayment] = useState<RepaymentRecord | null>(null);

  // Demo data - would come from API
  const repayments: RepaymentRecord[] = [
    {
      id: 'REP-001',
      riderName: 'John Mutesi',
      applicationId: 'APP-2024-001',
      motorcycleBrand: 'Ampersand E-Moto Gen 2',
      loanAmount: 3000000,
      monthlyAmount: 141500,
      totalPaid: 1415000,
      remainingBalance: 1585000,
      nextPaymentDate: '2024-12-25',
      status: 'on-track',
      lastPaymentDate: '2024-11-25',
      paymentsComplete: 10,
      totalPayments: 24
    },
    {
      id: 'REP-002',
      riderName: 'Sarah Uwase',
      applicationId: 'APP-2024-002',
      motorcycleBrand: 'Opibus Moto',
      loanAmount: 3300000,
      monthlyAmount: 108000,
      totalPaid: 648000,
      remainingBalance: 2652000,
      nextPaymentDate: '2024-12-20',
      status: 'due-soon',
      lastPaymentDate: '2024-10-20',
      paymentsComplete: 6,
      totalPayments: 36
    },
    {
      id: 'REP-003',
      riderName: 'Peter Kagabo',
      applicationId: 'APP-2024-003',
      motorcycleBrand: 'EV Electric Thunder E100',
      loanAmount: 2800000,
      monthlyAmount: 133000,
      totalPaid: 399000,
      remainingBalance: 2401000,
      nextPaymentDate: '2024-12-05',
      status: 'overdue',
      lastPaymentDate: '2024-09-05',
      paymentsComplete: 3,
      totalPayments: 24
    },
    {
      id: 'REP-004',
      riderName: 'Marie Uwamahoro',
      applicationId: 'APP-2023-015',
      motorcycleBrand: 'Ampersand E-Moto Gen 2',
      loanAmount: 3100000,
      monthlyAmount: 119000,
      totalPaid: 3100000,
      remainingBalance: 0,
      nextPaymentDate: '-',
      status: 'completed',
      lastPaymentDate: '2024-11-15',
      paymentsComplete: 30,
      totalPayments: 30
    },
  ];

  // Calculate summary stats
  const stats = {
    totalActive: repayments.filter(r => r.status !== 'completed').length,
    onTrack: repayments.filter(r => r.status === 'on-track').length,
    dueSoon: repayments.filter(r => r.status === 'due-soon').length,
    overdue: repayments.filter(r => r.status === 'overdue').length,
    totalOutstanding: repayments.reduce((sum, r) => sum + r.remainingBalance, 0),
    totalCollected: repayments.reduce((sum, r) => sum + r.totalPaid, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'due-soon':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'overdue':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'completed':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="w-4 h-4" />;
      case 'due-soon':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'On Track';
      case 'due-soon':
        return 'Due Soon';
      case 'overdue':
        return 'Overdue';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredRepayments = repayments.filter(repayment => {
    const matchesSearch = repayment.riderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         repayment.applicationId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || repayment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const {
    paginatedItems: paginatedRepayments,
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    totalItems
  } = usePagination(filteredRepayments, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mt-6">
        <h2 className="text-lg sm:text-xl text-[#023F40] mb-2">Repayment Tracking</h2>
        <p className="text-gray-600">
          Monitor monthly rider repayments and loan performance
        </p>
      </div>

      {/* Summary Stats - 2x2 on mobile, 4 across on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#023F40]/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-[#023F40]" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.totalActive}</p>
          <p className="text-sm text-gray-600">Active Loans</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.onTrack}</p>
          <p className="text-sm text-gray-600">On Track</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.dueSoon}</p>
          <p className="text-sm text-gray-600">Due Soon</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.overdue}</p>
          <p className="text-sm text-gray-600">Overdue</p>
        </motion.div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-[#023F40] to-[#035f60] p-6 rounded-xl shadow-md text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold">Total Collected</h3>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(stats.totalCollected)}</p>
          <p className="text-white/70 text-sm mt-1">Cumulative repayments received</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[#023F40]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Outstanding Balance</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalOutstanding)}</p>
          <p className="text-gray-600 text-sm mt-1">Remaining principal to collect</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by rider name or application ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          
          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="on-track">On Track</SelectItem>
              <SelectItem value="due-soon">Due Soon</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              <span>Export</span>
            </Button>
            <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#023F40] hover:bg-[#035f60] w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  <span>Record Payment</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Monthly Repayment</DialogTitle>
                  <DialogDescription>
                    Log a payment received from a rider for their monthly loan installment
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Application ID</Label>
                    <Input placeholder="e.g., APP-2024-001" />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Amount (RWF)</Label>
                    <Input type="number" placeholder="e.g., 141500" />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile-money">Mobile Money</SelectItem>
                        <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reference Number (Optional)</Label>
                    <Input placeholder="Transaction reference" />
                  </div>

                  {/* New Fields: Kilometres and CO2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                    <div className="space-y-2">
                      <Label>
                        Kilometres Traveled
                        <span className="text-xs text-gray-500 ml-2">(km)</span>
                      </Label>
                      <Input 
                        type="number" 
                        step="0.1" 
                        min="0"
                        placeholder="e.g., 1250.5" 
                      />
                      <p className="text-xs text-gray-500">
                        Estimated distance traveled since last payment
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        CO₂ Emissions Saved
                        <span className="text-xs text-gray-500 ml-2">(kg CO₂e)</span>
                      </Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="e.g., 45.75" 
                      />
                      <p className="text-xs text-gray-500">
                        CO₂ emissions saved vs. petrol motorcycle
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowRecordDialog(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-[#023F40] hover:bg-[#035f60]">
                    Record Payment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Repayment Records Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rider / Application
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motorcycle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedRepayments.map((repayment, index) => (
                <motion.tr
                  key={repayment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{repayment.riderName}</p>
                      <p className="text-sm text-gray-500">{repayment.applicationId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {repayment.motorcycleBrand}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{repayment.paymentsComplete} / {repayment.totalPayments}</span>
                        <span className="text-gray-900 font-medium">
                          {Math.round((repayment.paymentsComplete / repayment.totalPayments) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#023F40] h-2 rounded-full transition-all"
                          style={{ width: `${(repayment.paymentsComplete / repayment.totalPayments) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(repayment.remainingBalance)}</p>
                    <p className="text-xs text-gray-500">of {formatCurrency(repayment.loanAmount)}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(repayment.nextPaymentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(repayment.status)}`}>
                      {getStatusIcon(repayment.status)}
                      <span className="ml-1">{getStatusLabel(repayment.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRepayment(repayment)}
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRepayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No repayment records found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Start tracking repayments by recording payments'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredRepayments.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Repayment Details Dialog */}
      <Dialog open={selectedRepayment !== null} onOpenChange={(open) => !open && setSelectedRepayment(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Repayment Details</DialogTitle>
            <DialogDescription>
              Complete repayment information for {selectedRepayment?.riderName}
            </DialogDescription>
          </DialogHeader>

          {selectedRepayment && (
            <div className="space-y-6">
              {/* Rider & Motorcycle Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Rider Name</Label>
                  <p className="font-medium">{selectedRepayment.riderName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Application ID</Label>
                  <p className="font-medium">{selectedRepayment.applicationId}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Motorcycle</Label>
                  <p className="font-medium">{selectedRepayment.motorcycleBrand}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Status</Label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRepayment.status)}`}>
                    {getStatusIcon(selectedRepayment.status)}
                    <span className="ml-1">{getStatusLabel(selectedRepayment.status)}</span>
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold mb-3">Loan Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Total Loan Amount</Label>
                    <p className="font-medium">{formatCurrency(selectedRepayment.loanAmount)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Monthly Payment</Label>
                    <p className="font-medium">{formatCurrency(selectedRepayment.monthlyAmount)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Total Paid</Label>
                    <p className="font-medium text-green-600">{formatCurrency(selectedRepayment.totalPaid)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Remaining Balance</Label>
                    <p className="font-medium text-orange-600">{formatCurrency(selectedRepayment.remainingBalance)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold mb-3">Payment Progress</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Payments Completed</span>
                    <span className="font-medium">{selectedRepayment.paymentsComplete} / {selectedRepayment.totalPayments}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-[#023F40] h-3 rounded-full transition-all"
                      style={{ width: `${(selectedRepayment.paymentsComplete / selectedRepayment.totalPayments) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{Math.round((selectedRepayment.paymentsComplete / selectedRepayment.totalPayments) * 100)}%</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold mb-3">Payment Schedule</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Last Payment Date</Label>
                    <p className="font-medium">
                      {selectedRepayment.lastPaymentDate 
                        ? new Date(selectedRepayment.lastPaymentDate).toLocaleDateString()
                        : 'No payments yet'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Next Payment Due</Label>
                    <p className="font-medium">{new Date(selectedRepayment.nextPaymentDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => setShowRecordDialog(true)}
                  className="flex-1 bg-[#023F40] hover:bg-[#035f60]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download Statement
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}