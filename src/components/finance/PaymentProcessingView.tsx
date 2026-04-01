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
  Upload,
  Building2,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck
} from 'lucide-react';
import { User as UserType } from '../../utils/auth';
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
  rebateAmount: string;
  status: string;
  riderName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  paymentId?: string;
  paymentDetails?: any;
  paymentReferenceNumber?: string;
  paymentStatus?: string;
}

interface PaymentProcessingViewProps {
  user: UserType;
}

export function PaymentProcessingView({ user }: PaymentProcessingViewProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Payment processing fields
  const [paymentStatus, setPaymentStatus] = useState<string>('initiated');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [bankTransactionId, setBankTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  
  // Proof of payment fields
  const [proofOfPaymentUrl, setProofOfPaymentUrl] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingPayment();
      setApplications(data);
    } catch (error: any) {
      toast.error('Failed to load applications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedApp) return;

    if (paymentStatus !== 'failed' && !referenceNumber.trim()) {
      toast.error('Please enter a payment reference number');
      return;
    }

    setProcessing(true);
    try {
      await api.processPayment({
        applicationId: selectedApp.id,
        paymentStatus,
        referenceNumber,
        bankTransactionId,
        notes
      });

      toast.success('Payment status updated successfully');
      setShowProcessDialog(false);
      resetProcessForm();
      loadApplications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to process payment');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleUploadProof = async () => {
    if (!selectedApp) return;

    if (!proofOfPaymentUrl.trim()) {
      toast.error('Please enter proof of payment URL');
      return;
    }

    setProcessing(true);
    try {
      await api.uploadProofOfPayment(selectedApp.id, proofOfPaymentUrl, transactionId);
      toast.success('Proof of payment uploaded. Application funded!');
      setShowProofDialog(false);
      resetProofForm();
      loadApplications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload proof of payment');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const resetProcessForm = () => {
    setPaymentStatus('initiated');
    setReferenceNumber('');
    setBankTransactionId('');
    setNotes('');
    setSelectedApp(null);
  };

  const resetProofForm = () => {
    setProofOfPaymentUrl('');
    setTransactionId('');
    setSelectedApp(null);
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
    const config: Record<string, { label: string; className: string; icon: any }> = {
      'approved-for-payment': { 
        label: 'Ready for Payment', 
        className: 'bg-blue-100 text-blue-800',
        icon: Clock
      },
      'payment-initiated': { 
        label: 'Payment Initiated', 
        className: 'bg-yellow-100 text-yellow-800',
        icon: Clock
      },
      'payment-processed': { 
        label: 'Payment Processed', 
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle2
      },
      'payment-failed': { 
        label: 'Payment Failed', 
        className: 'bg-red-100 text-red-800',
        icon: XCircle
      },
    };

    const statusInfo = config[status] || config['approved-for-payment'];
    const Icon = statusInfo.icon;

    return (
      <Badge className={statusInfo.className}>
        <Icon className="w-3 h-3 mr-1" />
        {statusInfo.label}
      </Badge>
    );
  };

  const filteredApps = applications.filter(app => {
    const searchLower = searchTerm.toLowerCase();
    return (
      app.companyName?.toLowerCase().includes(searchLower) ||
      app.riderName?.toLowerCase().includes(searchLower) ||
      app.registrationNumber?.toLowerCase().includes(searchLower) ||
      app.paymentReferenceNumber?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#023F40] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
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
            <div className="w-12 h-12 rounded-full bg-[#023F40]/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#023F40]" />
            </div>
            <div>
              <CardTitle>Payment Processing</CardTitle>
              <CardDescription>
                Process approved payments and upload proof of transfer
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
              <CardTitle>Payment Queue</CardTitle>
              <CardDescription>
                {applications.length} payment{applications.length !== 1 ? 's' : ''} ready for processing
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Search by company, rider, or reference number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Payments Table */}
          {paginatedApps.length === 0 ? (
            <div className="text-center py-12">
              <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payments pending processing</p>
              <p className="text-sm text-gray-500 mt-2">
                Approved payments will appear here
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Application
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Asset Financier
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Bank Details
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Amount
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
                          <p className="font-medium text-gray-900">
                            {app.registrationNumber || app.id.slice(-8)}
                          </p>
                          {app.paymentReferenceNumber && (
                            <p className="text-xs text-gray-500">Ref: {app.paymentReferenceNumber}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">{app.companyName}</p>
                              {app.riderName && (
                                <p className="text-xs text-gray-500">{app.riderName}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm">{app.bankName}</p>
                          <p className="text-xs text-gray-500">{app.bankAccountNumber}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#023F40]">
                            {formatCurrency(app.rebateAmount)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(app.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {(app.status === 'approved-for-payment' || app.status === 'payment-initiated') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedApp(app);
                                  setShowProcessDialog(true);
                                }}
                              >
                                Process
                              </Button>
                            )}
                            {app.status === 'payment-processed' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedApp(app);
                                  setShowProofDialog(true);
                                }}
                                className="bg-[#023F40] hover:bg-[#035f60]"
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                Upload Proof
                              </Button>
                            )}
                          </div>
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
                    {Math.min(currentPage * itemsPerPage, filteredApps.length)} of{' '}
                    {filteredApps.length} payments
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

      {/* Process Payment Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Update the payment transaction status
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
                    <p className="text-gray-600">Bank</p>
                    <p className="font-semibold">{selectedApp.bankName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Account Number</p>
                    <p className="font-semibold">{selectedApp.bankAccountNumber}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="payment-status">Payment Status *</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initiated">Initiated / Pending</SelectItem>
                    <SelectItem value="processed">Processed / Cleared</SelectItem>
                    <SelectItem value="failed">Failed / Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentStatus !== 'failed' && (
                <>
                  <div>
                    <Label htmlFor="reference-number">Payment Reference Number *</Label>
                    <Input
                      id="reference-number"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="Enter bank reference number..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bank-transaction-id">Bank Transaction ID (Optional)</Label>
                    <Input
                      id="bank-transaction-id"
                      value={bankTransactionId}
                      onChange={(e) => setBankTransactionId(e.target.value)}
                      placeholder="Enter transaction ID if available..."
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any relevant notes..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  {paymentStatus === 'failed' 
                    ? 'The payment will be marked as failed. You may need to retry after correcting the details.'
                    : paymentStatus === 'processed'
                    ? 'After processing, you will need to upload proof of payment to mark the application as FUNDED.'
                    : 'The payment will be marked as initiated and can be updated later.'
                  }
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleProcessPayment}
              disabled={processing}
              className="bg-[#023F40] hover:bg-[#035f60]"
            >
              {processing ? 'Processing...' : 'Update Payment Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Proof of Payment Dialog */}
      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Upload Proof of Payment</DialogTitle>
            <DialogDescription>
              Upload the bank receipt or transaction confirmation
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
                </div>
              </div>

              <div>
                <Label htmlFor="proof-url">Proof of Payment URL *</Label>
                <Input
                  id="proof-url"
                  value={proofOfPaymentUrl}
                  onChange={(e) => setProofOfPaymentUrl(e.target.value)}
                  placeholder="https://... (Upload document and paste URL)"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload the bank receipt to storage and paste the URL here
                </p>
              </div>

              <div>
                <Label htmlFor="transaction-id">Transaction ID (Optional)</Label>
                <Input
                  id="transaction-id"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Transaction confirmation ID..."
                  className="mt-1"
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-900">
                  <strong>Status Update:</strong> Once proof of payment is uploaded, the application
                  status will be updated to <strong>FUNDED</strong>. The Asset Financier will be notified
                  to proceed with delivery within 48 hours.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProofDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUploadProof}
              disabled={processing || !proofOfPaymentUrl.trim()}
              className="bg-[#6DB27F] hover:bg-[#5da26f]"
            >
              {processing ? 'Uploading...' : 'Upload Proof'}
              <Upload className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
