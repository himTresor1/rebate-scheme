import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ArrowLeft, CheckCircle, FileText, XCircle } from 'lucide-react';
import { User } from '../../utils/auth';
import { toast } from 'sonner';

interface Application {
  id: string;
  companyName: string;
  registrationNumber?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  rebateAmount: string;
  projectDescription?: string;
  applicantName?: string;
  nationalId?: string;
  phoneNumber?: string;
  email?: string;
  motorcycleBrand?: string;
  motorcycleModel?: string;
  chassisNumber?: string;
  loanAmount?: string;
  interestRate?: string;
  loanTerm?: string;
  monthlyRepayment?: string;
  purchasePrice?: string;
  vehicleCount?: string;
  emissionReduction?: string;
  documents?: Array<{
    name: string;
    type?: string;
    url: string;
    uploadedAt?: string;
    verified?: boolean;
  }>;
  reviewHistory?: Array<{
    reviewerName?: string;
    reviewerRole?: string;
    decision?: string;
    reviewedAt?: string;
    notes?: string;
  }>;
  status: string;
  createdAt: string;
  flaggedForCFO?: boolean;
  flagReason?: string;
  [key: string]: any;
}

interface QAReviewProps {
  application: Application;
  user: User;
  onBack: () => void;
  onDecisionCaptured?: (payload: {
    applicationId: string;
    decision: 'approve' | 'reject';
    reason: string;
    timestamp: string;
  }) => void;
}

export function QAReview({ application, onBack, onDecisionCaptured }: QAReviewProps) {
  const [open, setOpen] = useState(false);
  const [decision, setDecision] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');
  const [expandedDocuments, setExpandedDocuments] = useState(false);

  const handleSaveReview = () => {
    if (reason.trim().length < 20) {
      toast.error('Reason is required (minimum 20 characters).');
      return;
    }
    onDecisionCaptured?.({
      applicationId: application.id,
      decision,
      reason: reason.trim(),
      timestamp: new Date().toISOString(),
    });
    toast.success('QA review captured. Submit decisions from QA page when ready.');
    setOpen(false);
    onBack();
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="space-y-3">
        <Button variant="outline" onClick={onBack} className="w-fit">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to QA Page
        </Button>
        <h2 className="text-xl sm:text-2xl font-semibold text-[#023F40]">QA Review</h2>
        <p className="text-sm text-gray-600">Capture decision for this application. Final weekly forwarding happens from the QA table page.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[#023F40]">Application Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div><p className="text-xs uppercase tracking-wide text-gray-500">Ticket</p><p className="font-semibold">{application.id.replace('application:', '').slice(0, 8).toUpperCase()}</p></div>
          <div><p className="text-xs uppercase tracking-wide text-gray-500">Applicant</p><p className="font-medium">{application.applicantName || application.contactPerson || application.companyName || 'N/A'}</p></div>
          <div><p className="text-xs uppercase tracking-wide text-gray-500">Asset Financier</p><p className="font-medium">{application.companyName || 'N/A'}</p></div>
          <div><p className="text-xs uppercase tracking-wide text-gray-500">Rebate Amount</p><p className="font-medium">{application.rebateAmount ? Number(application.rebateAmount).toLocaleString() : 'N/A'}</p></div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-[#023F40]">Client & Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><p className="text-gray-500">Name</p><p className="font-medium">{application.applicantName || application.contactPerson || 'N/A'}</p></div>
            <div><p className="text-gray-500">National ID</p><p className="font-medium">{application.nationalId || 'N/A'}</p></div>
            <div><p className="text-gray-500">Phone</p><p className="font-medium">{application.phoneNumber || application.contactPhone || 'N/A'}</p></div>
            <div><p className="text-gray-500">Email</p><p className="font-medium">{application.email || application.contactEmail || 'N/A'}</p></div>
            <div><p className="text-gray-500">Submitted At</p><p className="font-medium">{new Date(application.createdAt).toLocaleString()}</p></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-[#023F40]">Vehicle & Financing Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><p className="text-gray-500">Provider / Brand</p><p className="font-medium">{application.motorcycleBrand || 'N/A'}</p></div>
            <div><p className="text-gray-500">Model</p><p className="font-medium">{application.motorcycleModel || 'N/A'}</p></div>
            <div><p className="text-gray-500">VIN / Chassis</p><p className="font-medium">{application.chassisNumber || 'N/A'}</p></div>
            <div><p className="text-gray-500">Purchase Price</p><p className="font-medium">{application.purchasePrice ? Number(application.purchasePrice).toLocaleString() : 'N/A'}</p></div>
            <div><p className="text-gray-500">Loan Amount</p><p className="font-medium">{application.loanAmount ? Number(application.loanAmount).toLocaleString() : 'N/A'}</p></div>
            <div><p className="text-gray-500">Monthly Repayment</p><p className="font-medium">{application.monthlyRepayment ? Number(application.monthlyRepayment).toLocaleString() : 'N/A'}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base text-[#023F40]">Uploaded Documents</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setExpandedDocuments((v) => !v)}>
            {expandedDocuments ? 'Collapse' : 'Expand'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {(application.documents && application.documents.length > 0 ? application.documents : []).slice(0, expandedDocuments ? undefined : 4).map((doc, idx) => (
            <div key={`${doc.url}-${idx}`} className="flex items-center justify-between border rounded-lg p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{doc.name || 'Document'}</p>
                <p className="text-xs text-gray-500">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Upload date unavailable'}</p>
              </div>
              <Button size="sm" variant="outline" asChild>
                <a href={doc.url} target="_blank" rel="noreferrer">
                  <FileText className="w-4 h-4 mr-1" />
                  View
                </a>
              </Button>
            </div>
          ))}
          {(!application.documents || application.documents.length === 0) && (
            <p className="text-sm text-gray-500">No documents available for this application.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[#023F40]">Review History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(application.reviewHistory && application.reviewHistory.length > 0 ? application.reviewHistory : []).map((item, idx) => (
            <div key={idx} className="border rounded-lg p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{item.reviewerName || 'Reviewer'}</p>
                <p className="text-xs text-gray-500">{item.reviewedAt ? new Date(item.reviewedAt).toLocaleString() : 'N/A'}</p>
              </div>
              <p className="text-xs text-gray-600 mt-1">{item.reviewerRole || 'Role unavailable'}</p>
              <p className="text-sm mt-2">{item.notes || 'No notes provided.'}</p>
            </div>
          ))}
          {(!application.reviewHistory || application.reviewHistory.length === 0) && (
            <p className="text-sm text-gray-500">No prior review entries.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} className="bg-[#023F40] hover:bg-[#035f60]">
          Review
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Capture QA Decision</DialogTitle>
            <DialogDescription>Record approve/reject with reason. This does not submit to next stage yet.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={decision === 'approve' ? 'default' : 'outline'}
                className={decision === 'approve' ? 'bg-[#6DB27F] hover:bg-[#5da170] flex-1' : 'flex-1'}
                onClick={() => setDecision('approve')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                type="button"
                variant={decision === 'reject' ? 'destructive' : 'outline'}
                className="flex-1"
                onClick={() => setDecision('reject')}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
            <div>
              <Label htmlFor="qaReason">Reason *</Label>
              <Textarea
                id="qaReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the QA decision (minimum 20 characters)..."
                rows={5}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveReview}>
              Save Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
