import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
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
import { ArrowLeft, CheckCircle, Eye, XCircle } from 'lucide-react';
import { User } from '../../utils/auth';
import { toast } from 'sonner';
import { getRebatePercent } from '../../utils/rebateCalculation';
import { formatNumber } from '../../utils/numberFormat';
import { formatDisplayDate } from '../../utils/dateFormat';

interface Application {
  id: string;
  companyName: string;
  registrationNumber?: string;
  ticketNumber?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  rebateAmount: string;
  applicantName?: string;
  nationalId?: string;
  phoneNumber?: string;
  email?: string;
  motorcycleBrand?: string;
  motorcycleModel?: string;
  loanAmount?: string;
  interestRate?: string;
  loanTerm?: string;
  monthlyRepayment?: string;
  purchasePrice?: string;
  isRetrofit?: boolean;
  submittedBy?: string;
  submittedByEmail?: string;
  submittedByPhone?: string;
  verifiedAt?: string;
  lastReviewedAt?: string;
  eligibilityCheck?: {
    nationalIdCheck?: { gender?: string; dateOfBirth?: string };
  };
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

  const ticketId =
    application.ticketNumber ||
    application.registrationNumber ||
    application.id.replace('application:', '').toUpperCase();
  const isWoman = application.eligibilityCheck?.nationalIdCheck?.gender === 'Female';
  const genderLabel = isWoman ? 'Woman' : 'Man';
  const isRetrofit = Boolean(application.isRetrofit);
  const rebateAmountRwf = formatNumber(parseFloat(application.rebateAmount || '0') || 0);
  const retailCost = formatNumber(parseFloat(application.purchasePrice || '0') || 0);
  const rebatePercent = getRebatePercent({ isWoman, isRetrofit });

  const getDocumentByKeyword = (keywords: string[]) => {
    if (!application.documents || application.documents.length === 0) return undefined;
    return application.documents.find((doc) => {
      const name = doc.name.toLowerCase();
      return keywords.some((keyword) => name.includes(keyword));
    });
  };

  const renderDocAccess = (keywords: string[]) => {
    const doc = getDocumentByKeyword(keywords);
    if (!doc?.url) return <span className="text-xs text-gray-400">No file</span>;
    return (
      <Button size="sm" variant="outline" asChild className="h-8">
        <a href={doc.url} target="_blank" rel="noreferrer">
          <Eye className="w-4 h-4 mr-1" />
          View
        </a>
      </Button>
    );
  };

  const mandatoryDocs = [
    { label: 'Signed Financing Contract', keywords: ['financing contract', 'contract', 'loan agreement'] },
    { label: 'National ID', keywords: ['national id', 'id document', 'nid'] },
    { label: 'Motorcycle License', keywords: ['license', 'moto license', 'driver'] },
    { label: 'Individual Affidavit of Financial Need', keywords: ['affidavit'] },
    { label: 'AF Confirmation of Financial Need', keywords: ['financial need', 'af confirmation'] },
  ];
  const optionalDocs = [
    {
      label: 'AF/Client Confirmation of Individual E-Moto Possession',
      keywords: ['possession'],
      note: 'Not mandatory to approve and include in the approved report; if missing, excluded from the CFO Disbursement Request.',
    },
  ];
  const retrofitDocs = [
    { label: 'Retrofit Suitability Statement', keywords: ['retrofit suitability', 'suitability'] },
    { label: 'ICE-Engine Disposal Agreement', keywords: ['ice', 'disposal', 'engine'] },
  ];
  const additionalDocs = (application.documents || []).filter((doc) => {
    const name = doc.name.toLowerCase();
    const known = [...mandatoryDocs, ...optionalDocs, ...retrofitDocs].some((item) =>
      item.keywords.some((kw) => name.includes(kw))
    );
    return !known;
  });

  const handleSaveReview = () => {
    if (decision === 'reject' && !reason.trim()) {
      toast.error('Comment is mandatory when rejecting a rebate.');
      return;
    }
    onDecisionCaptured?.({
      applicationId: application.id,
      decision,
      reason: reason.trim(),
      timestamp: new Date().toISOString(),
    });
    toast.success('QA review captured. Submit decisions from the pipeline when ready.');
    setOpen(false);
    onBack();
  };

  const openDecision = (type: 'approve' | 'reject') => {
    setDecision(type);
    setReason('');
    setOpen(true);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="space-y-3">
        <Button variant="outline" onClick={onBack} className="w-fit">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pipeline
        </Button>
        <h2 className="text-xl sm:text-2xl font-semibold text-[#023F40]">
          Quality Assurance Team — Review Rebate Submission
        </h2>
        <p className="text-sm text-gray-600 max-w-4xl">
          This page is for the QA Team to review rebate submissions verified by the Rebate Team. QA may approve
          rebates that do not yet have an E-Moto Possession Statement; those rebates are included in the approved
          report but excluded from the CFO Disbursement Request until the possession confirmation is submitted.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 border rounded-md p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Ticket ID</p>
                <p className="text-base font-semibold text-[#023F40]">{ticketId}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Applicant Name</p>
                <p className="text-base font-medium text-gray-900">
                  {application.applicantName || application.contactPerson || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Date of AF Submission</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDisplayDate(application.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Date of Rebate Team Verification</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDisplayDate(
                    application.verifiedAt || application.lastReviewedAt || application.createdAt
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Asset Financier</p>
                <p className="text-base font-medium text-gray-900">{application.companyName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">National ID</p>
                <p className="text-base font-medium text-gray-900">{application.nationalId || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">DOB</p>
                <p className="text-base font-medium text-gray-900">
                  {application.eligibilityCheck?.nationalIdCheck?.dateOfBirth || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Phone Number</p>
                <p className="text-base font-medium text-gray-900">
                  {application.phoneNumber || application.contactPhone || 'Not provided'}
                </p>
              </div>
              <div className="bg-gray-50 border rounded-md p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Gender</p>
                <p className="text-base font-medium text-gray-900">{genderLabel}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Vehicle Type</p>
                <p className="text-base font-medium text-gray-900">{isRetrofit ? 'Retrofit' : 'New E-Moto'}</p>
              </div>
              <div className="bg-gray-50 border rounded-md p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">E-Moto Provider</p>
                <p className="text-base font-medium text-gray-900">
                  {application.motorcycleBrand || 'Not provided'}
                </p>
              </div>
              <div className="bg-gray-50 border rounded-md p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">E-Moto Model</p>
                <p className="text-base font-medium text-gray-900">
                  {application.motorcycleModel || 'Not provided'}
                </p>
              </div>
              <div className="bg-gray-50 border rounded-md p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">E-Moto Retail Cost (RWF)</p>
                <p className="text-base font-medium text-gray-900">{retailCost}</p>
              </div>
              <div className="bg-gray-50 border rounded-md p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Rebate Amount (RWF)</p>
                <p className="text-base font-semibold text-[#023F40]">{rebateAmountRwf}</p>
              </div>
              <div className="bg-gray-50 border rounded-md p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Rebate Percentage (%)</p>
                <p className="text-base font-semibold text-[#023F40]">{rebatePercent}</p>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-slate-50 h-fit space-y-4">
              <div>
                <p className="text-sm font-semibold text-[#023F40] mb-3">Submitted By</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">
                      {application.submittedBy || application.contactPerson || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">
                      {application.submittedByEmail || application.email || application.contactEmail || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">
                      {application.submittedByPhone || application.phoneNumber || application.contactPhone || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-3 space-y-2 text-sm">
                <p className="text-sm font-semibold text-[#023F40]">Contract / Financing</p>
                <div>
                  <p className="text-xs text-gray-500">Loan Amount (RWF)</p>
                  <p className="font-medium">
                    {application.loanAmount
                      ? Math.round(parseFloat(application.loanAmount)).toLocaleString()
                      : 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Interest Rate</p>
                  <p className="font-medium">{application.interestRate || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Loan Term</p>
                  <p className="font-medium">{application.loanTerm || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Monthly Repayment (RWF)</p>
                  <p className="font-medium">
                    {application.monthlyRepayment
                      ? Math.round(parseFloat(application.monthlyRepayment)).toLocaleString()
                      : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#023F40]">AF Submitted Documents</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            All Asset Financier documents are available for view. QA does not approve or reject individual documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {mandatoryDocs.map((doc) => (
            <div key={doc.label} className="flex items-center justify-between gap-4 border rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900">{doc.label}</p>
              {renderDocAccess(doc.keywords)}
            </div>
          ))}
          {optionalDocs.map((doc) => (
            <div key={doc.label} className="border rounded-lg p-3 border-dashed space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{doc.note}</p>
                </div>
                {renderDocAccess(doc.keywords)}
              </div>
            </div>
          ))}
          {isRetrofit && (
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-semibold text-gray-700">Retrofit-Specific Documents</p>
              {retrofitDocs.map((doc) => (
                <div key={doc.label} className="flex items-center justify-between gap-4 border rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">{doc.label}</p>
                  {renderDocAccess(doc.keywords)}
                </div>
              ))}
            </div>
          )}
          {additionalDocs.length > 0 && (
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-semibold text-gray-700">Additional Documents</p>
              {additionalDocs.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between gap-4 border rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-500">
                      {doc.uploadedAt ? formatDisplayDate(doc.uploadedAt) : 'Upload date unavailable'}
                    </p>
                  </div>
                  {doc.url ? (
                    <Button size="sm" variant="outline" asChild className="h-8">
                      <a href={doc.url} target="_blank" rel="noreferrer">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </a>
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400">No file</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {(application.reviewHistory?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-[#023F40]">Review History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {application.reviewHistory!.map((item, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{item.reviewerName || 'Reviewer'}</p>
                  <p className="text-xs text-gray-500">
                    {item.reviewedAt ? new Date(item.reviewedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <p className="text-xs text-gray-600 mt-1">{item.reviewerRole || 'Role unavailable'}</p>
                <p className="text-sm mt-2">{item.notes || 'No notes provided.'}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="destructive" onClick={() => openDecision('reject')}>
          <XCircle className="w-4 h-4 mr-2" />
          Reject
        </Button>
        <Button
          onClick={() => openDecision('approve')}
          className="bg-[#6DB27F] hover:bg-[#5da170]"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Approve
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{decision === 'approve' ? 'Approve rebate' : 'Reject rebate'}</DialogTitle>
            <DialogDescription>
              {decision === 'reject'
                ? 'A comment is mandatory when rejecting. It will appear under Issues for follow-up.'
                : 'Confirm approval for this rebate. Comment is optional.'}
            </DialogDescription>
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
              <Label htmlFor="qaReason">
                {decision === 'reject' ? 'Comment *' : 'Comment (optional)'}
              </Label>
              <Textarea
                id="qaReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  decision === 'reject'
                    ? 'Explain why this rebate is rejected...'
                    : 'Optional notes for follow-up...'
                }
                rows={5}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveReview}
              variant={decision === 'reject' ? 'destructive' : 'default'}
              className={decision === 'approve' ? 'bg-[#6DB27F] hover:bg-[#5da170]' : ''}
            >
              Save Decision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
