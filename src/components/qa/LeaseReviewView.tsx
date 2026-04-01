import { useState, useEffect } from 'react';
import { User } from '../../utils/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FileCheck, Download, CheckCircle2, XCircle, Loader2, AlertTriangle, FileText, Eye, ArrowLeft, Building2, ChevronRight } from 'lucide-react';
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
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

interface LeaseReviewViewProps {
  user: User;
}

export function LeaseReviewView({ user }: LeaseReviewViewProps) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await api.getAllApplications();
      
      // Filter applications that have lease uploaded and pending review
      const pendingReview = data.filter((app: any) => 
        app.status === 'lease-review'
      );
      
      setApplications(pendingReview);
    } catch (error: any) {
      console.error('Failed to load applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (app: any) => {
    const documentName = app.signedLeaseDocument?.name || 'signed_lease.pdf';
    
    // Create a simulated PDF viewer in a new window
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
      pdfWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${documentName}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f3f4f6;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            h1 {
              color: #023F40;
              border-bottom: 3px solid #023F40;
              padding-bottom: 10px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin: 20px 0;
            }
            .info-item {
              padding: 10px;
              background: #f9fafb;
              border-radius: 4px;
            }
            .info-label {
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
              font-weight: 600;
            }
            .info-value {
              font-size: 16px;
              color: #111827;
              margin-top: 4px;
            }
            .document-placeholder {
              margin: 30px 0;
              padding: 60px 20px;
              text-align: center;
              background: #f3f4f6;
              border: 2px dashed #d1d5db;
              border-radius: 8px;
            }
            .watermark {
              color: #9ca3af;
              font-size: 14px;
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📄 Signed Lease Agreement</h1>
            
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Document Name</div>
                <div class="info-value">${documentName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Application ID</div>
                <div class="info-value">${app.id?.split(':')[1] || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Applicant</div>
                <div class="info-value">${app.applicantName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Asset Financier</div>
                <div class="info-value">${app.companyName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Motorcycle</div>
                <div class="info-value">${app.motorcycleBrand} ${app.motorcycleModel}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Loan Amount</div>
                <div class="info-value">RWF ${parseInt(app.loanAmount).toLocaleString()}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Loan Term</div>
                <div class="info-value">${app.loanTerm} months</div>
              </div>
              <div class="info-item">
                <div class="info-label">Monthly Payment</div>
                <div class="info-value">RWF ${parseInt(app.monthlyRepayment).toLocaleString()}</div>
              </div>
            </div>

            <div class="document-placeholder">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" style="margin: 0 auto 20px;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <h3 style="color: #374151; margin-bottom: 10px;">UI-Only Simulation</h3>
              <p style="color: #6b7280; max-width: 500px; margin: 0 auto;">
                This is a simulated document viewer. In production, the actual PDF lease agreement would be displayed here.
                The document contains the signed lease agreement between ${app.companyName} and ${app.applicantName}.
              </p>
            </div>

            <div class="watermark">
              <p>RGF Rebate Scheme System • Document Uploaded: ${new Date(app.signedLeaseDocument?.uploadedAt || app.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `);
      pdfWindow.document.close();
    }
    
    toast.success('Document opened in new tab');
  };

  const handleApproveLease = async () => {
    if (!selectedApp || !approvalNotes.trim()) {
      toast.error('Please provide approval notes');
      return;
    }

    try {
      setProcessing(true);
      
      // Strip the 'application:' prefix if present since the API will add it
      const idWithoutPrefix = selectedApp.id.replace('application:', '');
      
      await api.updateApplication(idWithoutPrefix, {
        status: 'pending-payment',
        leaseApprovedBy: user.id,
        leaseApprovedAt: new Date().toISOString(),
        leaseReviewNotes: approvalNotes
      });
      
      toast.success('Lease approved successfully!', {
        description: 'The application has been forwarded to the Finance Officer for payment processing'
      });
      
      // Close dialog and reload
      setShowApproveDialog(false);
      setSelectedApp(null);
      setApprovalNotes('');
      await loadApplications();
    } catch (error: any) {
      console.error('Failed to approve lease:', error);
      toast.error('Failed to approve lease', {
        description: error.message || 'Please try again'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectLease = async () => {
    if (!selectedApp || !rejectionNotes.trim()) {
      toast.error('Please provide rejection notes');
      return;
    }

    try {
      setProcessing(true);
      
      // Strip the 'application:' prefix if present since the API will add it
      const idWithoutPrefix = selectedApp.id.replace('application:', '');
      
      await api.updateApplication(idWithoutPrefix, {
        status: 'approved-pending-lease',
        leaseRejectedBy: user.id,
        leaseRejectedAt: new Date().toISOString(),
        leaseRejectionNotes: rejectionNotes,
        signedLeaseDocument: null // Clear the rejected lease
      });
      
      toast.success('Lease rejected', {
        description: 'The Asset Financier has been notified to upload a corrected lease'
      });
      
      // Close dialog and reload
      setShowRejectDialog(false);
      setSelectedApp(null);
      setRejectionNotes('');
      await loadApplications();
    } catch (error: any) {
      console.error('Failed to reject lease:', error);
      toast.error('Failed to reject lease', {
        description: error.message || 'Please try again'
      });
    } finally {
      setProcessing(false);
    }
  };

  // If viewing specific application details
  if (selectedApp) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => {
            setSelectedApp(null);
            setSelectedOrganization(null);
          }}
          className="text-[#023F40] hover:bg-[#023F40]/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Applications
        </Button>

        <div>
          <h2 className="text-2xl font-semibold text-[#023F40]">Review Signed Lease</h2>
          <p className="text-gray-600 mt-1">
            {selectedApp.applicantName} • {selectedApp.companyName}
          </p>
        </div>

        <Card className="border-2">
          <CardContent className="p-6 space-y-6">
            {/* Application Summary */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Application Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Application ID</p>
                  <p className="font-medium">{selectedApp.id?.split(':')[1] || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Motorcycle</p>
                  <p className="font-medium">{selectedApp.motorcycleBrand} {selectedApp.motorcycleModel}</p>
                </div>
                <div>
                  <p className="text-gray-500">Chassis Number</p>
                  <p className="font-medium">{selectedApp.chassisNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">Rebate Amount</p>
                  <p className="font-medium text-[#023F40]">
                    RWF {parseInt(selectedApp.rebateAmount).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Lease Document Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Uploaded Lease Document
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">File: {selectedApp.signedLeaseDocument?.name || 'signed_lease.pdf'}</p>
                    <p className="text-xs mt-1">Uploaded: {new Date(selectedApp.signedLeaseDocument?.uploadedAt || selectedApp.updatedAt).toLocaleString()}</p>
                  </div>
                  <Button
                    onClick={() => handleViewDocument(selectedApp)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Document
                  </Button>
                </div>
              </div>
            </div>

            {/* Loan Terms Verification */}
            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Verify Lease Terms Match Application</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <span className="text-gray-600">Loan Amount:</span>
                  <span className="font-medium">RWF {parseInt(selectedApp.loanAmount).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <span className="text-gray-600">Loan Term:</span>
                  <span className="font-medium">{selectedApp.loanTerm} months</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <span className="text-gray-600">Interest Rate:</span>
                  <span className="font-medium">{selectedApp.interestRate}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <span className="text-gray-600">Monthly Payment:</span>
                  <span className="font-medium">RWF {parseInt(selectedApp.monthlyRepayment).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Review Checklist */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Review Checklist
              </h4>
              <ul className="text-sm text-amber-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">✓</span>
                  <span>Lease is signed by both the rider and Asset Financier</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">✓</span>
                  <span>All financial terms match the approved application</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">✓</span>
                  <span>Motorcycle details (chassis, model, brand) are correct</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">✓</span>
                  <span>Document is clear and legible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">✓</span>
                  <span>No alterations or amendments after signing</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => setShowRejectDialog(true)}
                disabled={processing}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Lease
              </Button>
              <Button
                onClick={() => setShowApproveDialog(true)}
                disabled={processing}
                className="bg-[#023F40] hover:bg-[#035f60]"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve Lease
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Approval Dialog */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Approve Signed Lease</DialogTitle>
              <DialogDescription>
                Confirm that all lease terms match the approved application and the document is properly signed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="approval-notes" className="text-sm font-medium mb-2 block">
                  Approval Notes *
                </Label>
                <Textarea
                  id="approval-notes"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="E.g., Lease agreement verified and approved. All terms match the approved application including loan amount, term, interest rate, and monthly payment. Document is properly signed by both parties."
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  These notes will be recorded in the application history and sent to the Finance Officer.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowApproveDialog(false);
                  setApprovalNotes('');
                }}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApproveLease}
                disabled={!approvalNotes.trim() || processing}
                className="bg-[#023F40] hover:bg-[#035f60]"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve & Send to Finance
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rejection Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Signed Lease</DialogTitle>
              <DialogDescription>
                Please provide detailed notes explaining why the lease is being rejected.
                The Asset Financier will need to upload a corrected version.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="rejection-notes" className="text-sm font-medium mb-2 block">
                  Rejection Notes *
                </Label>
                <Textarea
                  id="rejection-notes"
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder="E.g., Loan term on lease shows 36 months but approved application shows 24 months. Please upload corrected lease with the correct 24-month term."
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Be specific about what needs to be corrected so the Asset Financier can fix the issue.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionNotes('');
                }}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectLease}
                disabled={!rejectionNotes.trim() || processing}
                className="bg-red-600 hover:bg-red-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Lease
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#023F40]" />
      </div>
    );
  }

  // Level 1: Show grouped by Asset Financier
  if (!selectedOrganization) {
    // Group applications by organization
    const groupedByOrg = applications.reduce((acc, app) => {
      const orgName = app.companyName;
      if (!acc[orgName]) {
        acc[orgName] = [];
      }
      acc[orgName].push(app);
      return acc;
    }, {} as Record<string, any[]>);

    const orgGroups = Object.entries(groupedByOrg).map(([name, apps]) => ({
      name,
      count: apps.length
    }));

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#023F40]">Signed Lease Review</h2>
          <p className="text-gray-600 mt-1">
            Review and approve signed lease agreements from Asset Financiers
          </p>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Leases Pending Review
                </h3>
                <p className="text-gray-600">
                  All uploaded leases have been reviewed.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
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
                          {group.count} {group.count === 1 ? 'lease' : 'leases'} pending review
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Level 2: Show applications for selected organization
  const orgApplications = applications.filter(app => app.companyName === selectedOrganization);

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
            {orgApplications.length} {orgApplications.length === 1 ? 'lease' : 'leases'} pending review
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
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      Lease Pending Review
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
                      <p className="text-gray-500">Chassis Number</p>
                      <p className="font-medium">{app.chassisNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Rebate Amount</p>
                      <p className="font-medium text-[#023F40]">
                        RWF {parseInt(app.rebateAmount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Document</p>
                      <p className="font-medium text-blue-600 flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {app.signedLeaseDocument?.name || 'signed_lease.pdf'}
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
                  Review Lease
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}