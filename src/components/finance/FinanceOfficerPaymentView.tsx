import { useState, useEffect } from 'react';
import { User } from '../../utils/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DollarSign, Building2, CheckCircle2, Loader2, Receipt, AlertCircle, ArrowLeft, ChevronRight, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../utils/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface FinanceOfficerPaymentViewProps {
  user: User;
}

export function FinanceOfficerPaymentView({ user }: FinanceOfficerPaymentViewProps) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await api.getAllApplications();
      
      // Filter applications that are pending payment
      const pendingPayment = data.filter((app: any) => 
        app.status === 'pending-payment'
      );
      
      setApplications(pendingPayment);
    } catch (error: any) {
      console.error('Failed to load applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentReference = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `PAY-${year}-${randomNum}`;
  };

  const handleInitiatePayment = (app: any) => {
    setSelectedApp(app);
    setPaymentReference(generatePaymentReference());
    setShowPaymentDialog(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedApp || !paymentReference.trim()) {
      toast.error('Payment reference is required');
      return;
    }

    try {
      setProcessing(true);
      
      // Strip the 'application:' prefix if present since the API will add it
      const idWithoutPrefix = selectedApp.id.replace('application:', '');
      
      await api.updateApplication(idWithoutPrefix, {
        status: 'payment-complete',
        paymentReferenceNumber: paymentReference,
        paymentNotes: paymentNotes || 'Payment processed via bank transfer',
        paymentProcessedBy: user.id,
        paymentProcessedAt: new Date().toISOString()
      });
      
      toast.success('Payment processed successfully!', {
        description: `Reference: ${paymentReference}`
      });
      
      // Close dialog and reload
      setShowPaymentDialog(false);
      setSelectedApp(null);
      setPaymentReference('');
      setPaymentNotes('');
      await loadApplications();
    } catch (error: any) {
      console.error('Failed to process payment:', error);
      toast.error('Failed to process payment', {
        description: error.message || 'Please try again'
      });
    } finally {
      setProcessing(false);
    }
  };

  // If viewing specific application payment details
  if (selectedApp && showPaymentDialog) {
    // Show the payment dialog (handled below in the Dialog component)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#023F40]" />
      </div>
    );
  }

  // Level 3: Individual Payment Detail View
  if (selectedApp && !showPaymentDialog) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => {
            setSelectedApp(null);
          }}
          className="text-[#023F40] hover:bg-[#023F40]/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Applications
        </Button>

        <div>
          <h2 className="text-2xl font-semibold text-[#023F40]">Payment Details</h2>
          <p className="text-gray-600 mt-1">
            {selectedApp.companyName} • {selectedApp.applicantName}
          </p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{selectedApp.companyName}</CardTitle>
                <CardDescription className="mt-1">
                  Application ID: {selectedApp.id?.split(':')[1] || 'N/A'}
                </CardDescription>
              </div>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                Payment Authorized
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Application Summary */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Application Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Rider Name</p>
                  <p className="font-medium">{selectedApp.applicantName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Motorcycle</p>
                  <p className="font-medium">{selectedApp.motorcycleBrand} {selectedApp.motorcycleModel}</p>
                </div>
                <div>
                  <p className="text-gray-500">Loan Amount</p>
                  <p className="font-medium">RWF {parseInt(selectedApp.loanAmount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Rebate Amount</p>
                  <p className="font-semibold text-[#023F40] text-lg">
                    RWF {parseInt(selectedApp.rebateAmount).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Payment Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Beneficiary</p>
                  <p className="font-medium">{selectedApp.companyName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Bank Name</p>
                  <p className="font-medium">Bank of Kigali</p>
                </div>
                <div>
                  <p className="text-gray-500">Account Number</p>
                  <p className="font-mono font-medium">**** **** 1234</p>
                </div>
                <div>
                  <p className="text-gray-500">Account Name</p>
                  <p className="font-medium">{selectedApp.companyName}</p>
                </div>
              </div>
            </div>

            {/* Approval Timeline */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3">Approval History</h4>
              <div className="text-sm text-green-800 space-y-2">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Final Approval: {new Date(selectedApp.updatedAt).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Lease Approved: {selectedApp.leaseApprovedAt ? new Date(selectedApp.leaseApprovedAt).toLocaleDateString() : 'Recently'}
                </p>
                <p className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Signed Lease: {selectedApp.signedLeaseDocument?.name || 'Uploaded'}
                </p>
              </div>
            </div>

            {/* Lease Review Notes */}
            {selectedApp.leaseReviewNotes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Rebate Manager Notes</h4>
                <p className="text-sm text-blue-800">{selectedApp.leaseReviewNotes}</p>
              </div>
            )}

            {/* Payment Action */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                <p className="font-medium">Ready for Payment Processing</p>
                <p>Days pending: {Math.floor((Date.now() - new Date(selectedApp.updatedAt).getTime()) / (1000 * 60 * 60 * 24))} days</p>
              </div>
              <Button
                onClick={() => setShowPaymentDialog(true)}
                disabled={processing}
                className="bg-[#023F40] hover:bg-[#035f60]"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Process Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Level 1: Show grouped by Asset Financier
  if (!selectedOrganization) {
    // Group applications by organization
    const groupedByOrg = applications.reduce((acc, app) => {
      const orgName = app.companyName;
      if (!acc[orgName]) {
        acc[orgName] = {
          apps: [],
          totalAmount: 0
        };
      }
      acc[orgName].apps.push(app);
      acc[orgName].totalAmount += parseInt(app.rebateAmount);
      return acc;
    }, {} as Record<string, { apps: any[], totalAmount: number }>);

    const orgGroups = Object.entries(groupedByOrg).map(([name, data]) => ({
      name,
      count: data.apps.length,
      totalAmount: data.totalAmount
    }));

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#023F40]">Pending Payments</h2>
          <p className="text-gray-600 mt-1">
            Process rebate payments to Asset Financiers for approved applications
          </p>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Payments Pending
                </h3>
                <p className="text-gray-600">
                  All approved rebates have been processed.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Payment Processing Guidelines</p>
                  <ul className="space-y-1">
                    <li>• Verify bank account details match the Asset Financier's registered information</li>
                    <li>• Confirm rebate amount matches the approved application</li>
                    <li>• Record payment reference number for audit trail</li>
                    <li>• Payments should be processed within 5 business days of lease approval</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orgGroups.map((group) => (
                <Card
                  key={group.name}
                  className="cursor-pointer hover:shadow-lg transition-all hover:border-[#023F40]/30"
                  onClick={() => setSelectedOrganization(group.name)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-full bg-[#023F40]/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-[#023F40]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate mb-1">
                            {group.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {group.count} {group.count === 1 ? 'payment' : 'payments'} pending
                          </p>
                          <p className="text-lg font-semibold text-[#023F40] mt-1">
                            RWF {group.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Level 2: Show applications for selected organization
  const orgApplications = applications.filter(app => app.companyName === selectedOrganization);
  const totalOrgAmount = orgApplications.reduce((sum, app) => sum + parseInt(app.rebateAmount), 0);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => setSelectedOrganization(null)}
        className="text-[#023F40] hover:bg-[#023F40]/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Asset Financiers
      </Button>

      <div className="flex items-center gap-3">
        <Building2 className="w-6 h-6 text-[#023F40]" />
        <div>
          <h2 className="text-2xl font-semibold text-[#023F40]">{selectedOrganization}</h2>
          <p className="text-gray-600 mt-1">
            {orgApplications.length} {orgApplications.length === 1 ? 'payment' : 'payments'} • Total: RWF {totalOrgAmount.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {orgApplications.map((app) => (
          <Card 
            key={app.id} 
            className="border-2 hover:border-[#023F40]/30 transition-all cursor-pointer"
            onClick={() => setSelectedApp(app)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{app.applicantName}</h3>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      Payment Authorized
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Application ID: {app.id?.split(':')[1] || 'N/A'}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Motorcycle</p>
                      <p className="font-medium">{app.motorcycleBrand} {app.motorcycleModel}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Loan Amount</p>
                      <p className="font-medium">RWF {parseInt(app.loanAmount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Rebate Amount</p>
                      <p className="font-semibold text-[#023F40] text-lg">
                        RWF {parseInt(app.rebateAmount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Days Pending</p>
                      <p className="font-medium">
                        {Math.floor((Date.now() - new Date(app.updatedAt).getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedApp(app);
                  }}
                  className="bg-[#023F40] hover:bg-[#035f60]"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Process Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Processing Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Process Rebate Payment</DialogTitle>
            <DialogDescription>
              Confirm payment details before processing the rebate transfer
            </DialogDescription>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-4 py-4">
              {/* Payment Summary */}
              <div className="bg-gray-50 border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Payment Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Beneficiary</p>
                    <p className="font-medium">{selectedApp.companyName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Amount</p>
                    <p className="font-semibold text-[#023F40] text-lg">
                      RWF {parseInt(selectedApp.rebateAmount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Application ID</p>
                    <p className="font-mono text-xs">{selectedApp.id?.split(':')[1] || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Rider</p>
                    <p className="font-medium">{selectedApp.applicantName}</p>
                  </div>
                </div>
              </div>

              {/* Payment Reference */}
              <div>
                <Label htmlFor="paymentRef">Payment Reference Number *</Label>
                <Input
                  id="paymentRef"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="PAY-2026-12345"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be used for tracking and audit purposes
                </p>
              </div>

              {/* Payment Notes */}
              <div>
                <Label htmlFor="paymentNotes">Payment Notes (Optional)</Label>
                <Textarea
                  id="paymentNotes"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="E.g., Bank transfer reference: TRX123456789"
                  rows={3}
                  className="mt-1 resize-none"
                />
              </div>

              {/* Confirmation */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">Confirm Before Processing</p>
                    <p>Once processed, this payment cannot be reversed. Please verify all details are correct.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPaymentDialog(false);
                setPaymentReference('');
                setPaymentNotes('');
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProcessPayment}
              disabled={!paymentReference.trim() || processing}
              className="bg-[#023F40] hover:bg-[#035f60]"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4 mr-2" />
                  Confirm & Process Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
