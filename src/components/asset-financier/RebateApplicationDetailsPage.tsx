import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, FileText, Upload, Download, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export interface RebateApplicationDetailsData {
  ticketNumber: string;
  submittedBy: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  motoLicense: string;
  isWoman: boolean;
  isRetrofit: boolean;
  retailCost: number;
  rebateAmount: number;
  supplier: string;
  model: string;
  retrofitAssembler?: string;
  status: 'proposal' | 'awaiting-rgf' | 'approved-disbursed';
  submittedAt: string;
  supportingDocuments: string[];
  affidavitUploaded: boolean;
  afFinancialNeedUploaded: boolean;
  iceAgreementUploaded: boolean;
}

interface RebateApplicationDetailsPageProps {
  data: RebateApplicationDetailsData;
  onBack: () => void;
  /** 'proposal-review' = submitted by a marketing agent, AF can add docs + submit to RGF. */
  variant?: 'af-submitted' | 'proposal-review';
  onSubmitToRgf?: (data: RebateApplicationDetailsData) => void;
}

const statusBadgeClass: Record<RebateApplicationDetailsData['status'], string> = {
  proposal: 'bg-amber-100 text-amber-800',
  'awaiting-rgf': 'bg-blue-100 text-blue-800',
  'approved-disbursed': 'bg-green-100 text-green-800',
};

const statusLabel: Record<RebateApplicationDetailsData['status'], string> = {
  proposal: 'AF proposal',
  'awaiting-rgf': 'Awaiting RGF authorization',
  'approved-disbursed': 'Approved disbursed',
};

interface DocRow {
  key: string;
  label: string;
  mandatory?: boolean;
  optional?: boolean;
  hasTemplate?: boolean;
  templateName?: string;
}

export function RebateApplicationDetailsPage({
  data,
  onBack,
  variant = 'af-submitted',
  onSubmitToRgf,
}: RebateApplicationDetailsPageProps) {
  const isProposalReview = variant === 'proposal-review';

  const [docStatus, setDocStatus] = useState<Record<string, boolean>>({
    signedFinancingAgreement: true,
    affidavit: data.affidavitUploaded,
    afFinancialNeed: data.afFinancialNeedUploaded,
    nationalId: true,
    motoLicense: true,
    iceDisposal: data.iceAgreementUploaded,
    retrofitSuitability: false,
    possession: false,
  });

  const openDocument = (name: string) => {
    const blob = new Blob([`Demo document preview for ${name}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleUpload = (key: string, label: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setDocStatus((prev) => ({ ...prev, [key]: true }));
      toast.success(`${label} uploaded`, { description: file.name });
    };
    input.click();
  };

  const mandatoryDocs: DocRow[] = [
    { key: 'signedFinancingAgreement', label: 'Signed Financing Agreement', mandatory: true },
    { key: 'affidavit', label: 'Notarized Individual Affidavit of Financial Need', mandatory: true, hasTemplate: true, templateName: 'Individual_Affidavit_of_Financial_Need_Template.pdf' },
    { key: 'afFinancialNeed', label: 'AF Confirmation of Financial Need', mandatory: true, hasTemplate: true, templateName: 'AF_Confirmation_of_Financial_Need_Template.pdf' },
    { key: 'nationalId', label: 'National ID', mandatory: true },
    { key: 'motoLicense', label: 'Motorcycle License', mandatory: true },
  ];

  const retrofitDocs: DocRow[] = [
    { key: 'iceDisposal', label: 'ICE-Engine Disposal Agreement', mandatory: true, hasTemplate: true, templateName: 'ICE_Moto_Engine_Disposal_Agreement_Template.pdf' },
    { key: 'retrofitSuitability', label: 'Retrofit Suitability Statement', mandatory: true, hasTemplate: true, templateName: 'Retrofit_Suitability_Statement_Template.pdf' },
  ];

  const optionalDocs: DocRow[] = [
    { key: 'possession', label: 'AF/Client Confirmation of E-Moto Possession', optional: true, hasTemplate: true, templateName: 'AF_Client_Confirmation_of_EMoto_Possession_Template.pdf' },
  ];

  const renderDocRow = (doc: DocRow) => {
    const uploaded = !!docStatus[doc.key];
    return (
      <div key={doc.key} className="flex items-center gap-4 p-3 rounded-lg border bg-white">
        <div className="flex-shrink-0">
          {uploaded ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <FileText className="w-5 h-5 text-gray-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm">
            {doc.label}
            {doc.mandatory ? <span className="text-red-500 ml-1">*</span> : null}
            {doc.optional ? <span className="text-xs text-gray-500 ml-2">(optional — can be submitted later)</span> : null}
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          {doc.hasTemplate && (isProposalReview || !uploaded) ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success('Template ready for download', { description: doc.templateName })}
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Template
            </Button>
          ) : null}
          {uploaded ? (
            <Button size="sm" variant="outline" onClick={() => openDocument(doc.label)}>
              <Eye className="w-3.5 h-3.5 mr-1" />
              View
            </Button>
          ) : isProposalReview ? (
            <Button
              size="sm"
              onClick={() => handleUpload(doc.key, doc.label)}
              className="bg-[#023F40] hover:bg-[#035f60]"
            >
              <Upload className="w-3.5 h-3.5 mr-1" />
              Upload
            </Button>
          ) : (
            <Badge className="bg-amber-100 text-amber-800">Missing</Badge>
          )}
        </div>
      </div>
    );
  };

  const pageTitle = isProposalReview
    ? 'Details on Rebates for Potential Submission to RGF'
    : 'Rebate Application Details';
  const pageSubtitle = isProposalReview
    ? 'This page provides details on individual rebates that your marketing staff and external designated agents have developed for your consideration. If the proposed individual meets financing and rebate eligibility requirements, please add the missing mandatory information and documents and submit to RGF.'
    : 'Review the full details and documentation for this rebate application submitted to RGF.';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Rebate Status
        </Button>
        <Badge className={statusBadgeClass[data.status]}>{statusLabel[data.status]}</Badge>
      </div>

      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">{pageTitle}</h2>
        <p className="text-gray-600 mt-1 text-sm">{pageSubtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#023F40]">Rebate Application Details — {data.ticketNumber}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div><span className="text-gray-500">Submitted by</span><p className="font-medium">{data.submittedBy}</p></div>
            <div><span className="text-gray-500">Submitted on</span><p className="font-medium">{data.submittedAt}</p></div>
            <div><span className="text-gray-500">Ticket No</span><p className="font-medium text-[#023F40]">{data.ticketNumber}</p></div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Applicant Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div><span className="text-gray-500">First Name(s)</span><p className="font-medium">{data.firstName}</p></div>
              <div><span className="text-gray-500">Last Name(s)</span><p className="font-medium">{data.lastName}</p></div>
              <div><span className="text-gray-500">National ID</span><p className="font-medium">{data.nationalId}</p></div>
              <div><span className="text-gray-500">Motorcycle Driver's License</span><p className="font-medium">{data.motoLicense}</p></div>
              <div><span className="text-gray-500">Gender</span><p className="font-medium">{data.isWoman ? 'Woman' : 'Man'}</p></div>
              <div><span className="text-gray-500">Vehicle Type</span><p className="font-medium">{data.isRetrofit ? 'Retrofit' : 'New E-Moto'}</p></div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Vehicle and financing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div><span className="text-gray-500">E-Moto Provider</span><p className="font-medium">{data.supplier}</p></div>
              <div><span className="text-gray-500">E-Moto Model</span><p className="font-medium">{data.model}</p></div>
              {data.isRetrofit && (
                <div><span className="text-gray-500">Retrofit Assembler</span><p className="font-medium">{data.retrofitAssembler || '—'}</p></div>
              )}
              <div><span className="text-gray-500">Retail E-Moto Price (RWF)</span><p className="font-medium">{data.retailCost.toLocaleString()}</p></div>
              <div><span className="text-gray-500">Rebate amount (RWF)</span><p className="font-medium text-[#023F40]">{data.rebateAmount.toLocaleString()}</p></div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-1">Mandatory Documents</h3>
            <p className="text-sm text-gray-600 mb-3">
              {isProposalReview
                ? 'Please review the provided documents and upload any missing documents before submitting to RGF.'
                : 'Documents provided with this rebate submission.'}
            </p>
            <div className="space-y-2">
              {mandatoryDocs.map(renderDocRow)}
            </div>

            {data.isRetrofit && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">If Retrofit</p>
                <div className="space-y-2">
                  {retrofitDocs.map(renderDocRow)}
                </div>
              </div>
            )}

            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Optional (can be submitted later)</p>
              <div className="space-y-2">
                {optionalDocs.map(renderDocRow)}
              </div>
            </div>
          </div>

          {isProposalReview && (
            <div className="border-t pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Review eligibility and mandatory documents, then submit this rebate to RGF.
              </p>
              <Button
                className="bg-[#0a7d4b] hover:bg-[#0c6b42]"
                onClick={() => onSubmitToRgf?.(data)}
              >
                Submit to RGF
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
