import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ArrowLeft, CheckCircle, FileCheck, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '../../utils/auth';

interface Application {
  id: string;
  companyName?: string;
  applicantName?: string;
  nationalId?: string;
  rebateAmount?: string;
  status: string;
  createdAt: string;
  [key: string]: any;
}

interface RebateVerificationViewProps {
  application: Application;
  user: User;
  onBack: () => void;
}

type DocStatus = 'verified' | 'rejected' | 'pending';

const DOCUMENTS = [
  { id: 'lease', label: 'Signed lease agreement', required: true },
  { id: 'national-id', label: 'National ID copy', required: true },
  { id: 'license', label: "Driver's license", required: true },
  { id: 'invoice', label: 'E-moto purchase invoice', required: true },
  { id: 'loan', label: 'Loan agreement', required: true },
  { id: 'women-proof', label: 'Women beneficiary proof (if applicable)', required: false },
];

export function RebateVerificationView({ application, onBack }: RebateVerificationViewProps) {
  const [docStatus, setDocStatus] = useState<Record<string, DocStatus>>(
    Object.fromEntries(DOCUMENTS.map((d) => [d.id, 'pending']))
  );
  const [verificationNotes, setVerificationNotes] = useState('');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const applicantName = application.applicantName || application.companyName || 'Applicant';
  const nationalId = application.nationalId || '—';
  const rebateAmount = application.rebateAmount
    ? `RWF ${parseFloat(application.rebateAmount).toLocaleString()}`
    : '—';

  const requiredDocs = DOCUMENTS.filter((d) => d.required);
  const allRequiredVerified = requiredDocs.every((d) => docStatus[d.id] === 'verified');
  const anyRejected = Object.values(docStatus).some((s) => s === 'rejected');
  const allEvaluated = DOCUMENTS.every((d) => docStatus[d.id] !== 'pending');

  const setDoc = (id: string, status: DocStatus) => {
    setDocStatus((prev) => ({ ...prev, [id]: status }));
  };

  const handleSubmitToQA = async () => {
    if (!allRequiredVerified) {
      toast.error('All required documents must be marked Verified before submitting to QA Team');
      return;
    }
    if (!verificationNotes.trim() || verificationNotes.trim().length < 20) {
      toast.error('Verification notes are required (minimum 20 characters)');
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    toast.success('Submitted to QA Team for weekly disbursement review', {
      description: 'Case will appear on the QA Team Review page for inclusion in the next weekly batch.',
    });
    setSaving(false);
    setShowSubmitDialog(false);
    onBack();
  };

  const handleReturnToAnalyst = async () => {
    if (!verificationNotes.trim()) {
      toast.error('Please explain why the case is being returned');
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    toast.success('Returned to Rebate Analyst for correction');
    setSaving(false);
    setShowReturnDialog(false);
    onBack();
  };

  const canSubmit = application.status === 'manager-review' && allRequiredVerified && !anyRejected;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-gradient-to-r from-[#023F40] to-[#035f60] text-white px-4 sm:px-6 py-4 shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20 flex-shrink-0">
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Back to Pipeline</span>
            </Button>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold truncate">Rebate Verification</h2>
              <p className="text-xs sm:text-sm text-white/80 truncate">{applicantName} · {nationalId}</p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 self-start sm:self-center">
            Rebate Team · 1 business day SLA
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-5xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#023F40] text-base">Case summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Applicant</p>
              <p className="font-medium">{applicantName}</p>
            </div>
            <div>
              <p className="text-gray-600">Rebate amount</p>
              <p className="font-medium">{rebateAmount}</p>
            </div>
            <div>
              <p className="text-gray-600">Asset financier</p>
              <p className="font-medium">{application.companyName || 'Bank of Kigali'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-base text-blue-900">Analyst recommendation (read-only)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-100 text-green-800">Recommend approval</Badge>
              <Badge variant="outline">Eligibility score: 85%</Badge>
            </div>
            <p className="text-gray-700">
              All mandatory eligibility criteria met. Lease documentation complete. Applicant qualifies for new e-moto rebate at 18%.
            </p>
            <p className="text-xs text-gray-500">Submitted by Rebate Analyst · {new Date(application.createdAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#023F40] flex items-center gap-2 text-base">
              <FileCheck className="w-5 h-5" />
              Document verification
            </CardTitle>
            <p className="text-sm text-gray-600 font-normal">
              Mark each document Verified or Rejected. Required documents must all be verified to forward to QA Team.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {DOCUMENTS.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-lg p-4"
              >
                <div>
                  <p className="font-medium text-sm">{doc.label}</p>
                  {!doc.required && <p className="text-xs text-gray-500">Optional</p>}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={docStatus[doc.id] === 'verified' ? 'default' : 'outline'}
                    className={docStatus[doc.id] === 'verified' ? 'bg-green-600 hover:bg-green-700' : ''}
                    onClick={() => setDoc(doc.id, 'verified')}
                    disabled={application.status !== 'manager-review'}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified
                  </Button>
                  <Button
                    size="sm"
                    variant={docStatus[doc.id] === 'rejected' ? 'destructive' : 'outline'}
                    onClick={() => setDoc(doc.id, 'rejected')}
                    disabled={application.status !== 'manager-review'}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Rejected
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verification notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Record verification outcome, document issues, and rationale for QA Team..."
              rows={4}
              disabled={application.status !== 'manager-review'}
            />
          </CardContent>
        </Card>

        {application.status === 'manager-review' && (
          <div className="flex flex-col sm:flex-row gap-3 pb-8">
            <Button
              variant="outline"
              onClick={() => setShowReturnDialog(true)}
              disabled={saving}
            >
              Return to Analyst
            </Button>
            <Button
              className="bg-[#6DB27F] hover:bg-[#5da170] sm:ml-auto"
              onClick={() => setShowSubmitDialog(true)}
              disabled={saving || !canSubmit || !allEvaluated}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit to QA Team
            </Button>
          </div>
        )}

        {application.status !== 'manager-review' && (
          <p className="text-sm text-gray-600 pb-8">
            This case has already been forwarded to the QA Team. View-only mode.
          </p>
        )}
      </div>

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogHeader className="sr-only">
          <DialogTitle>Submit to QA Team</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit to QA Team</DialogTitle>
            <DialogDescription>
              Forward verified case to QA Team for weekly disbursement review. QA Team is accountable for final check before CFO authorization.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
            <Button className="bg-[#023F40]" onClick={handleSubmitToQA} disabled={saving}>
              {saving ? 'Submitting...' : 'Confirm submit to QA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return to Analyst</DialogTitle>
            <DialogDescription>
              Send back for additional review or documentation correction.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReturnToAnalyst} disabled={saving}>
              {saving ? 'Returning...' : 'Confirm return'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
