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
import { DOC_KEYWORDS, DOC_NAMES } from '../../utils/documentNames';
import { FieldLabel } from '../asset-financier/FieldLabel';

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
  tin?: string;
  motoLicense?: string;
  driversLicense?: string;
  motorcycleBrand?: string;
  motorcycleModel?: string;
  retrofitAssembler?: string;
  loanAmount?: string;
  interestRate?: string;
  loanTerm?: string;
  repaymentFrequency?: string;
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
  const rebatePercent = getRebatePercent({ isWoman, isRetrofit });
  const nameParts = (application.applicantName || application.contactPerson || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '—';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '—';

  const DetailField = ({
    label,
    value,
    required = false,
    optional = false,
    isDate = false,
  }: {
    label: string;
    value?: string | number | null;
    required?: boolean;
    optional?: boolean;
    isDate?: boolean;
  }) => {
    const missing = required && (value === undefined || value === null || value === '' || value === '—');
    const display = missing
      ? 'Missing'
      : isDate
        ? formatDisplayDate(typeof value === 'string' ? value : undefined)
        : value || '—';
    return (
      <div>
        <FieldLabel as="span" required={required} optional={optional} className="mb-0">
          {label}
        </FieldLabel>
        <p className={`font-medium ${missing ? 'text-amber-700' : 'text-gray-900'}`}>{display}</p>
      </div>
    );
  };

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
    { label: DOC_NAMES.signedFinancingAgreement, keywords: DOC_KEYWORDS.signedFinancingAgreement },
    { label: DOC_NAMES.nationalIdCopy, keywords: DOC_KEYWORDS.nationalIdCopy },
    { label: DOC_NAMES.motorcycleDriversLicense, keywords: DOC_KEYWORDS.motorcycleDriversLicense },
    { label: DOC_NAMES.notarizedAffidavit, keywords: DOC_KEYWORDS.notarizedAffidavit },
    { label: DOC_NAMES.afConfirmationFinancialNeed, keywords: DOC_KEYWORDS.afConfirmationFinancialNeed },
  ];
  const optionalDocs = [
    {
      label: DOC_NAMES.possessionStatement,
      keywords: DOC_KEYWORDS.possessionStatement,
      note: 'Not mandatory to approve and include in the approved report; if missing, excluded from the CFO Disbursement Request.',
    },
  ];
  const retrofitDocs = [
    { label: DOC_NAMES.retrofitSuitability, keywords: DOC_KEYWORDS.retrofitSuitability },
    { label: DOC_NAMES.iceEngineDisposal, keywords: DOC_KEYWORDS.iceEngineDisposal },
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
        <CardHeader>
          <CardTitle className="text-[#023F40]">Rebate Application Details — {ticketId}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Submitted by</span>
              <p className="font-medium">{application.submittedBy || application.contactPerson || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-gray-500">Email</span>
              <p className="font-medium">
                {application.submittedByEmail || application.contactEmail || 'Not provided'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Phone</span>
              <p className="font-medium">
                {application.submittedByPhone || application.contactPhone || 'Not provided'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Date Received</span>
              <p className="font-medium">{formatDisplayDate(application.createdAt)}</p>
            </div>
            <div>
              <span className="text-gray-500">Ticket No.</span>
              <p className="font-medium text-[#023F40]">{ticketId}</p>
            </div>
            <div>
              <span className="text-gray-500">Asset Financier</span>
              <p className="font-medium">{application.companyName || '—'}</p>
            </div>
            <div>
              <span className="text-gray-500">Date of Rebate Team Verification</span>
              <p className="font-medium">
                {formatDisplayDate(
                  application.verifiedAt || application.lastReviewedAt || application.createdAt
                )}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Individual Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <DetailField label="Individual first name(s)" value={firstName} required />
              <DetailField label="Individual last name(s)" value={lastName} required />
              <DetailField
                label="Date of Birth"
                value={application.eligibilityCheck?.nationalIdCheck?.dateOfBirth}
                isDate
                required
              />
              <DetailField label="Gender?" value={genderLabel} required />
              <DetailField label="Vehicle Type?" value={isRetrofit ? 'Retrofit' : 'New E-Moto'} required />
              <DetailField
                label="Phone Number"
                value={application.phoneNumber || application.contactPhone}
                required
              />
              <DetailField label="Email" value={application.email || application.contactEmail} optional />
              <DetailField label="TIN (Tax Identification Number)" value={application.tin} optional />
              <DetailField label="National ID" value={application.nationalId} required />
              <DetailField
                label="Motorcycle Driver's License"
                value={application.motoLicense || application.driversLicense}
                required
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Vehicle and Financing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <DetailField
                label="E-Moto Provider"
                value={isRetrofit ? undefined : application.motorcycleBrand}
                required={!isRetrofit}
              />
              <DetailField label="E-Moto Model" value={application.motorcycleModel} required />
              {isRetrofit && (
                <DetailField label="Retrofit Assembler" value={application.retrofitAssembler} required />
              )}
              <DetailField
                label={isRetrofit ? 'Retrofit Cost (RWF)' : 'Retail E-Moto Price (RWF)'}
                value={
                  application.purchasePrice
                    ? formatNumber(parseFloat(String(application.purchasePrice)) || 0)
                    : undefined
                }
                required
              />
              <DetailField
                label="Total Contract Repayment Amount (RWF)"
                value={
                  application.loanAmount
                    ? formatNumber(parseFloat(String(application.loanAmount)) || 0)
                    : undefined
                }
                optional
              />
              <DetailField
                label="Rebate Amount (RWF) — auto-calculated"
                value={`${rebateAmountRwf} (${rebatePercent})`}
              />
              <DetailField label="Contract Term (months)" value={application.loanTerm} optional />
              <DetailField
                label="Repayment Frequency"
                value={
                  application.repaymentFrequency === 'weekly'
                    ? 'Weekly'
                    : application.repaymentFrequency === 'daily'
                      ? 'Daily'
                      : application.repaymentFrequency === 'monthly'
                        ? 'Monthly'
                        : application.repaymentFrequency
                }
                optional
              />
              <DetailField
                label="Repayment Amount (RWF)"
                value={
                  application.monthlyRepayment
                    ? formatNumber(parseFloat(String(application.monthlyRepayment)) || 0)
                    : undefined
                }
                optional
              />
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
