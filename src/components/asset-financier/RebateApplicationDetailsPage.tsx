import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ArrowLeft, FileText, Upload, Download, Eye, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  AfRebateRecord,
  AfRebateStatus,
  AF_STATUS_DISPLAY,
  getSubmitterContactInfo,
  isAfFieldMissing,
} from '../../utils/afRebateData';

export type RebateApplicationDetailsData = AfRebateRecord;

interface RebateApplicationDetailsPageProps {
  data: RebateApplicationDetailsData;
  onBack: () => void;
  /** Marketing agent proposal — AF adds docs before submission to RGF. */
  variant?: 'af-submitted' | 'proposal-review';
  onFinishApplication?: (data: RebateApplicationDetailsData) => void;
  /** Whether the viewer is a marketing agent (affects doc layout). */
  isMarketingAgent?: boolean;
}

const statusBadgeClass: Record<AfRebateStatus, string> = {
  unfinished: 'bg-gray-100 text-gray-800',
  'submitted-not-approved': 'bg-blue-100 text-blue-800',
  'approved-lacking-possession': 'bg-orange-100 text-orange-800',
  'approved-disbursed': 'bg-green-100 text-green-800',
};

const ACCEPTED_ADDITIONAL_DOCS = [
  'Employment letter',
  'Personal reference',
  'Mobile money statement',
];

interface DocRow {
  key: string;
  label: string;
  mandatory?: boolean;
  optional?: boolean;
  hasTemplate?: boolean;
  templateName?: string;
}

function DetailField({
  label,
  value,
  record,
}: {
  label: string;
  value?: string | number;
  record: AfRebateRecord;
}) {
  const missing = isAfFieldMissing(record, label, value);
  return (
    <div>
      <span className="text-gray-500">{label}</span>
      <p className={`font-medium ${missing ? 'text-amber-700' : ''}`}>
        {missing
          ? 'Missing'
          : typeof value === 'number'
            ? value.toLocaleString()
            : value || '—'}
      </p>
    </div>
  );
}

function formatRwf(value?: number) {
  if (value === undefined || value === null || value === 0) return undefined;
  return value;
}

export function RebateApplicationDetailsPage({
  data,
  onBack,
  variant = 'af-submitted',
  onFinishApplication,
  isMarketingAgent = false,
}: RebateApplicationDetailsPageProps) {
  const isProposalReview = variant === 'proposal-review';
  const isUnfinished = data.status === 'unfinished';
  const canEditDocs = isProposalReview || isUnfinished;
  const submitterContact = getSubmitterContactInfo(data);

  const [docStatus, setDocStatus] = useState<Record<string, boolean>>({
    signedLease: !isUnfinished,
    affidavit: data.affidavitUploaded,
    afFinancialNeed: data.afFinancialNeedUploaded,
    nationalIdDoc: !isAfFieldMissing(data, 'National ID', data.nationalId),
    driversLicenseDoc: !isAfFieldMissing(data, "Motorcycle Driver's License", data.motoLicense),
    iceDisposalAgreement: data.iceAgreementUploaded,
    retrofitSuitability: false,
    possessionConfirmation: false,
  });

  const [additionalDocs, setAdditionalDocs] = useState<
    Array<{ id: string; label: string; fileName: string }>
  >(() =>
    (data.supportingDocuments || [])
      .filter((label) =>
        ACCEPTED_ADDITIONAL_DOCS.some((accepted) =>
          label.toLowerCase().includes(accepted.toLowerCase().split(' ')[0])
        )
      )
      .map((label, i) => ({
        id: `extra-${i}`,
        label,
        fileName: `${label.replace(/\s+/g, '_')}.pdf`,
      }))
  );
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [pendingLabel, setPendingLabel] = useState('');
  const [pendingFileName, setPendingFileName] = useState('');

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

  const resetAddModal = () => {
    setPendingLabel('');
    setPendingFileName('');
    setAddModalOpen(false);
  };

  const handleChooseAdditionalFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) setPendingFileName(file.name);
    };
    input.click();
  };

  const handleConfirmAdditionalDoc = () => {
    const label = pendingLabel.trim();
    if (!label) {
      toast.error('Enter a name for this supporting document first.');
      return;
    }
    if (!pendingFileName) {
      toast.error('Choose a file to upload for this document.');
      return;
    }
    if (additionalDocs.length >= 5) {
      toast.error('You can add up to 5 additional documents.');
      return;
    }
    setAdditionalDocs((prev) => [
      ...prev,
      { id: `extra-${Date.now()}`, label, fileName: pendingFileName },
    ]);
    toast.success('Supporting document added', { description: `${label} — ${pendingFileName}` });
    resetAddModal();
  };

  const identityDocs: DocRow[] = [
    { key: 'nationalIdDoc', label: 'National ID Document', mandatory: true },
    { key: 'driversLicenseDoc', label: "Motorcycle Driver's License Document", mandatory: true },
    // Date of Birth Document removed — prohibited
  ];

  const mandatoryDocs: DocRow[] = [
    {
      key: 'signedLease',
      label: 'Signed Financing Agreement with Retail Cost of E-Moto',
      mandatory: true,
    },
    {
      key: 'affidavit',
      label: 'Individual Affidavit of Financial Need',
      mandatory: true,
      hasTemplate: true,
      templateName: 'Individual_Affidavit_of_Financial_Need_Template.pdf',
    },
    {
      key: 'afFinancialNeed',
      label: 'AF Confirmation of Financial Need',
      mandatory: true,
      hasTemplate: true,
      templateName: 'AF_Confirmation_of_Financial_Need_Template.pdf',
    },
  ];

  const retrofitDocs: DocRow[] = [
    {
      key: 'retrofitSuitability',
      label: 'Signed Retrofit Suitability Statement',
      mandatory: true,
      hasTemplate: true,
      templateName: 'Retrofit_Suitability_Statement_Template.pdf',
    },
    {
      key: 'iceDisposalAgreement',
      label: 'ICE-Engine Disposal Agreement (if Retrofit)',
      mandatory: true,
      hasTemplate: true,
      templateName: 'ICE_Moto_Engine_Disposal_Agreement_Template.pdf',
    },
  ];

  const optionalDocs: DocRow[] = [
    {
      key: 'possessionConfirmation',
      label: 'AF and Client Confirmation of E-Moto Possession',
      optional: true,
      hasTemplate: true,
      templateName: 'AF_Client_Confirmation_of_EMoto_Possession_Template.pdf',
    },
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
            {doc.optional ? (
              <span className="text-xs text-gray-500 ml-2">(optional — can be submitted later)</span>
            ) : null}
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          {doc.hasTemplate && (canEditDocs || !uploaded) ? (
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
          ) : canEditDocs ? (
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
    : 'Details on Individual Rebates';
  const pageSubtitle = isProposalReview
    ? 'This page provides details on individual rebates that your marketing staff and external designated agents have developed for your consideration. If the proposed individual meets financing and rebate eligibility requirements, please add the missing mandatory information and documents and submit to RGF.'
    : 'This page provides details on individual rebates. Please add any missing mandatory information and documents for rebates in your pipeline before submitting to RGF.';

  const repaymentFrequencyLabel =
    data.repaymentFrequency === 'weekly'
      ? 'Weekly'
      : data.repaymentFrequency === 'monthly'
        ? 'Monthly'
        : data.repaymentFrequency === 'daily'
          ? 'Daily'
          : data.repaymentFrequency;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Rebate Pipeline
        </Button>
        <Badge className={statusBadgeClass[data.status]}>{AF_STATUS_DISPLAY[data.status]}</Badge>
      </div>

      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">{pageTitle}</h2>
        <p className="text-gray-600 mt-1 text-sm">{pageSubtitle}</p>
        <p className="text-sm text-red-700 mt-2">Status: {AF_STATUS_DISPLAY[data.status]}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#023F40]">
            Rebate Application Details — {data.ticketNumber}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Submitted by</span>
              <p className="font-medium">{data.submittedBy}</p>
            </div>
            <div>
              <span className="text-gray-500">Email</span>
              <p className="font-medium">{submitterContact.email}</p>
            </div>
            <div>
              <span className="text-gray-500">Phone</span>
              <p className="font-medium">{submitterContact.phone}</p>
            </div>
            <div>
              <span className="text-gray-500">Submitted on</span>
              <p className="font-medium">{data.submittedAt}</p>
            </div>
            <div>
              <span className="text-gray-500">Ticket No.</span>
              <p className="font-medium text-[#023F40]">{data.ticketNumber}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Individual Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <DetailField label="Individual first name(s)" value={data.firstName} record={data} />
              <DetailField label="Individual last name(s)" value={data.lastName} record={data} />
              <DetailField
                label="Gender?"
                value={data.isWoman ? 'Woman' : 'Man'}
                record={data}
              />
              <DetailField label="Vehicle Type?" value={data.vehicleType} record={data} />
              <DetailField label="Phone Number" value={data.phoneNumber} record={data} />
              <DetailField label="Email (Optional)" value={data.email} record={data} />
              <DetailField label="TIN (Tax Identification Number)" value={data.tin} record={data} />
              <DetailField label="National ID" value={data.nationalId} record={data} />
              <DetailField
                label="Motorcycle Driver's License"
                value={data.motoLicense}
                record={data}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Vehicle and Financing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <DetailField label="E-Moto Provider" value={data.supplier} record={data} />
              <DetailField label="E-Moto Model" value={data.model} record={data} />
              {data.isRetrofit && (
                <DetailField
                  label="Retrofit Assembler"
                  value={data.retrofitAssembler}
                  record={data}
                />
              )}
              <DetailField
                label={data.isRetrofit ? 'Retrofit Cost (RWF)' : 'Retail E-Moto Price (RWF)'}
                value={formatRwf(data.retailCost) ?? data.retailCost}
                record={data}
              />
              <DetailField
                label="Total Contract Repayment Amount (RWF)"
                value={data.loanAmount}
                record={data}
              />
              <DetailField
                label="Rebate Amount (RWF) — auto-calculated"
                value={formatRwf(data.rebateAmount) ?? data.rebateAmount}
                record={data}
              />
              <DetailField label="Contract Term (months)" value={data.loanTerm} record={data} />
              <DetailField
                label="Repayment Frequency"
                value={repaymentFrequencyLabel}
                record={data}
              />
              <DetailField
                label="Repayment Amount (RWF)"
                value={data.monthlyRepayment}
                record={data}
              />
            </div>
          </div>

          {isUnfinished && data.missingFields && data.missingFields.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Missing information — finish the application to complete these fields
              </p>
              <ul className="mt-2 text-sm text-amber-800 list-disc pl-5 space-y-0.5">
                {data.missingFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          )}

          {isMarketingAgent ? (
            /* Marketing agent view: merged Mandatory Documents section per spec */
            <div className="border-t pt-4">
              <h3 className="font-semibold text-[#0a7d4b] mb-1 uppercase tracking-wide text-sm">
                Mandatory Documents
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Please upload the documents listed below.
              </p>
              <div className="space-y-2">
                {identityDocs.map(renderDocRow)}
              </div>
              {data.isRetrofit && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">If retrofit</p>
                  <div className="space-y-2">{retrofitDocs.map(renderDocRow)}</div>
                </div>
              )}
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Optional — can be submitted later
                </p>
                <div className="space-y-2">
                  {[{ key: 'affidavit', label: 'Individual Affidavit of Financial Need', optional: true, hasTemplate: true, templateName: 'Individual_Affidavit_of_Financial_Need_Template.pdf' }].map(renderDocRow)}
                </div>
              </div>
            </div>
          ) : (
            /* AF view: separate Identification + Mandatory sections */
            <>
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-1 text-sm uppercase tracking-wide">
                  Identification Documents
                </h3>
                <p className="text-sm text-gray-600 mb-3">Upload copies of the documents listed below.</p>
                <div className="space-y-2">{identityDocs.map(renderDocRow)}</div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-[#0a7d4b] mb-1 uppercase tracking-wide text-sm">
                  Mandatory Documents
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Please review the provided documents and upload any that are missing.
                </p>
                <div className="space-y-2">{mandatoryDocs.map(renderDocRow)}</div>

                {data.isRetrofit && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">If retrofit</p>
                    <div className="space-y-2">{retrofitDocs.map(renderDocRow)}</div>
                  </div>
                )}

                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Optional (can be submitted later)
                  </p>
                  <div className="space-y-2">{optionalDocs.map(renderDocRow)}</div>
                </div>
              </div>
            </>
          )}

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-1">Additional Supporting Documents</h3>
            <p className="text-xs text-gray-600 mb-2">
              Name each document first, then upload the corresponding file. You can add up to 5 additional
              documents.
            </p>
            <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-800 mb-1.5">Accepted supporting documents:</p>
              <ul className="list-disc pl-5 space-y-0.5 text-xs text-gray-700">
                {ACCEPTED_ADDITIONAL_DOCS.map((doc) => (
                  <li key={doc}>{doc}</li>
                ))}
              </ul>
            </div>
            {additionalDocs.length > 0 && (
              <div className="space-y-2 mb-3">
                {additionalDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-900">{doc.label}</p>
                      <p className="text-xs text-green-700 truncate">{doc.fileName}</p>
                    </div>
                    {canEditDocs && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setAdditionalDocs((prev) => prev.filter((d) => d.id !== doc.id))}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {canEditDocs && additionalDocs.length < 5 && (
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#023F40] hover:underline"
              >
                <Plus className="w-4 h-4" />
                Add another document
              </button>
            )}
          </div>

          {isUnfinished && (
            <div className="border-t pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-gray-500">
                Complete all mandatory fields and documents, then use{' '}
                <span className="font-medium">SUBMIT</span> on Step 4 of the application form
                {isProposalReview ? ' to send this rebate to RGF.' : '.'}
              </p>
              <Button
                className="bg-[#023F40] hover:bg-[#035f60]"
                onClick={() => onFinishApplication?.(data)}
              >
                Finish Application
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addModalOpen} onOpenChange={(open) => !open && resetAddModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add supporting document</DialogTitle>
            <DialogDescription>
              Accepted documents: {ACCEPTED_ADDITIONAL_DOCS.join(', ')}. Enter the document name first, then
              upload the file.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="detail-additional-doc-name">Document name</Label>
              <Input
                id="detail-additional-doc-name"
                placeholder="Employment letter, Personal reference, or Mobile money statement"
                value={pendingLabel}
                onChange={(e) => setPendingLabel(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>File</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={handleChooseAdditionalFile} className="shrink-0">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose file
                </Button>
                <span className="text-sm text-gray-600 truncate">
                  {pendingFileName || 'No file selected'}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetAddModal}>
              Cancel
            </Button>
            <Button type="button" className="bg-[#0a7d4b] hover:bg-[#0c6b42]" onClick={handleConfirmAdditionalDoc}>
              Add document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
