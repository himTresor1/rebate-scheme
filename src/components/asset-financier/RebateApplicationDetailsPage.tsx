import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { DateInput } from '../ui/date-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  ArrowLeft,
  FileText,
  Upload,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AfRebateRecord,
  AfRebateStatus,
  AF_STATUS_DISPLAY,
  getSubmitterContactInfo,
  isAfFieldMissing,
} from '../../utils/afRebateData';
import { formatDisplayDate } from '../../utils/dateFormat';
import { formatNumber } from '../../utils/numberFormat';
import { calculateRebateAmount, getRebatePercent } from '../../utils/rebateCalculation';
import { FieldLabel } from './FieldLabel';
import { DOC_NAMES, DOC_TEMPLATE_FILES } from '../../utils/documentNames';

export type RebateApplicationDetailsData = AfRebateRecord;

interface RebateApplicationDetailsPageProps {
  data: RebateApplicationDetailsData;
  onBack: () => void;
  variant?: 'af-submitted' | 'proposal-review';
  onSubmitApplication?: (data: RebateApplicationDetailsData) => void;
  onUpdateRecord?: (data: RebateApplicationDetailsData) => void;
  isMarketingAgent?: boolean;
}

const statusBadgeClass: Record<AfRebateStatus, string> = {
  unfinished: 'bg-gray-100 text-gray-800',
  'submitted-not-approved': 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  'approved-lacking-possession': 'bg-orange-100 text-orange-800',
  'approved-disbursed': 'bg-green-100 text-green-800',
};

const ACCEPTED_ADDITIONAL_DOCS = [
  'Employment letter',
  'Personal reference',
  'Mobile money statement',
];

type FieldInputKind = 'text' | 'date' | 'number' | 'select';

type EditableFieldKey =
  | 'firstName'
  | 'lastName'
  | 'dateOfBirth'
  | 'gender'
  | 'vehicleType'
  | 'phoneNumber'
  | 'email'
  | 'tin'
  | 'nationalId'
  | 'motoLicense'
  | 'supplier'
  | 'model'
  | 'retrofitAssembler'
  | 'retailCost'
  | 'loanAmount'
  | 'loanTerm'
  | 'repaymentFrequency'
  | 'monthlyRepayment';

interface FieldDef {
  key: EditableFieldKey;
  label: string;
  required?: boolean;
  optional?: boolean;
  isDate?: boolean;
  kind: FieldInputKind;
  selectOptions?: Array<{ value: string; label: string }>;
}

interface DocRow {
  key: string;
  label: string;
  mandatory?: boolean;
  optional?: boolean;
  hasTemplate?: boolean;
  templateName?: string;
}

function fieldLabelForKey(key: EditableFieldKey, isRetrofit: boolean): string {
  const labels: Record<EditableFieldKey, string> = {
    firstName: 'Individual first name(s)',
    lastName: 'Individual last name(s)',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender?',
    vehicleType: 'Vehicle Type?',
    phoneNumber: 'Phone Number',
    email: 'Email',
    tin: 'TIN (Tax Identification Number)',
    nationalId: 'National ID',
    motoLicense: "Motorcycle Driver's License",
    supplier: 'E-Moto Provider',
    model: 'E-Moto Model',
    retrofitAssembler: 'Retrofit Assembler',
    retailCost: isRetrofit ? 'Retrofit Cost (RWF)' : 'Retail E-Moto Price (RWF)',
    loanAmount: 'Total Contract Repayment Amount (RWF)',
    loanTerm: 'Contract Term (months)',
    repaymentFrequency: 'Repayment Frequency',
    monthlyRepayment: 'Repayment Amount (RWF)',
  };
  return labels[key];
}

function formatRwf(value?: number) {
  if (value === undefined || value === null || value === 0) return undefined;
  return formatNumber(value);
}

function getFieldRawValue(record: AfRebateRecord, key: EditableFieldKey): string {
  switch (key) {
    case 'firstName':
      return record.firstName || '';
    case 'lastName':
      return record.lastName || '';
    case 'dateOfBirth':
      return record.dateOfBirth || '';
    case 'gender':
      return record.isWoman ? 'Woman' : record.gender ? 'Man' : '';
    case 'vehicleType':
      return record.vehicleType || '';
    case 'phoneNumber':
      return record.phoneNumber || '';
    case 'email':
      return record.email || '';
    case 'tin':
      return record.tin || '';
    case 'nationalId':
      return record.nationalId || '';
    case 'motoLicense':
      return record.motoLicense || '';
    case 'supplier':
      return record.supplier || '';
    case 'model':
      return record.model || '';
    case 'retrofitAssembler':
      return record.retrofitAssembler || '';
    case 'retailCost':
      return record.retailCost ? String(record.retailCost) : '';
    case 'loanAmount':
      return record.loanAmount ? String(record.loanAmount) : '';
    case 'loanTerm':
      return record.loanTerm || '';
    case 'repaymentFrequency':
      return record.repaymentFrequency || '';
    case 'monthlyRepayment':
      return record.monthlyRepayment ? String(record.monthlyRepayment) : '';
    default:
      return '';
  }
}

function applyFieldValue(
  record: AfRebateRecord,
  key: EditableFieldKey,
  raw: string
): AfRebateRecord {
  const next = { ...record };
  const trimmed = raw.trim();

  switch (key) {
    case 'firstName':
      next.firstName = trimmed;
      break;
    case 'lastName':
      next.lastName = trimmed;
      break;
    case 'dateOfBirth':
      next.dateOfBirth = trimmed;
      break;
    case 'gender': {
      const isWoman = trimmed === 'Woman';
      next.isWoman = isWoman;
      next.gender = isWoman ? 'Woman' : 'Man';
      next.rebateAmount = calculateRebateAmount(next.retailCost || 0, {
        isWoman: next.isWoman,
        isRetrofit: next.isRetrofit,
      });
      break;
    }
    case 'vehicleType': {
      const isRetrofit = trimmed === 'Retrofit';
      next.vehicleType = isRetrofit ? 'Retrofit' : 'New E-Moto';
      next.isRetrofit = isRetrofit;
      next.rebateAmount = calculateRebateAmount(next.retailCost || 0, {
        isWoman: next.isWoman,
        isRetrofit: next.isRetrofit,
      });
      break;
    }
    case 'phoneNumber':
      next.phoneNumber = trimmed;
      break;
    case 'email':
      next.email = trimmed;
      break;
    case 'tin':
      next.tin = trimmed || undefined;
      break;
    case 'nationalId':
      next.nationalId = trimmed;
      break;
    case 'motoLicense':
      next.motoLicense = trimmed;
      break;
    case 'supplier':
      next.supplier = trimmed;
      break;
    case 'model':
      next.model = trimmed;
      break;
    case 'retrofitAssembler':
      next.retrofitAssembler = trimmed || undefined;
      break;
    case 'retailCost': {
      const n = parseFloat(trimmed.replace(/,/g, '')) || 0;
      next.retailCost = n;
      next.rebateAmount = calculateRebateAmount(n, {
        isWoman: next.isWoman,
        isRetrofit: next.isRetrofit,
      });
      break;
    }
    case 'loanAmount':
      next.loanAmount = trimmed ? parseFloat(trimmed.replace(/,/g, '')) || 0 : undefined;
      break;
    case 'loanTerm':
      next.loanTerm = trimmed || undefined;
      break;
    case 'repaymentFrequency':
      next.repaymentFrequency = (trimmed as AfRebateRecord['repaymentFrequency']) || undefined;
      break;
    case 'monthlyRepayment':
      next.monthlyRepayment = trimmed ? parseFloat(trimmed.replace(/,/g, '')) || 0 : undefined;
      break;
  }

  const label = fieldLabelForKey(key, next.isRetrofit);
  if (label && next.missingFields?.length) {
    next.missingFields = next.missingFields.filter((f) => f !== label && !f.toLowerCase().includes(key.toLowerCase()));
  }
  return next;
}

export function RebateApplicationDetailsPage({
  data,
  onBack,
  variant = 'af-submitted',
  onSubmitApplication,
  onUpdateRecord,
  isMarketingAgent = false,
}: RebateApplicationDetailsPageProps) {
  const isProposalReview = variant === 'proposal-review';
  const isUnfinished = data.status === 'unfinished';
  const isRejected = data.status === 'rejected';
  const canEditDocs = isProposalReview || isUnfinished;
  const canFillMissing = canEditDocs;

  const [record, setRecord] = useState<AfRebateRecord>(data);
  const submitterContact = getSubmitterContactInfo(record);

  const [docStatus, setDocStatus] = useState<Record<string, boolean>>({
    signedLease: !isUnfinished || Boolean(data.supportingDocuments?.some((d) => /financ|lease|contract/i.test(d))),
    affidavit: data.affidavitUploaded,
    afFinancialNeed: data.afFinancialNeedUploaded,
    nationalIdDoc: !isAfFieldMissing(data, 'National ID', data.nationalId),
    driversLicenseDoc: !isAfFieldMissing(data, "Motorcycle Driver's License", data.motoLicense),
    iceDisposalAgreement: data.iceAgreementUploaded,
    retrofitSuitability: Boolean(data.supportingDocuments?.some((d) => /suitability/i.test(d))),
    possessionConfirmation: Boolean(
      data.supportingDocuments?.some((d) => /possession/i.test(d))
    ),
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

  const [fieldModal, setFieldModal] = useState<FieldDef | null>(null);
  const [fieldDraft, setFieldDraft] = useState('');
  const [docModal, setDocModal] = useState<DocRow | null>(null);
  const [docFileName, setDocFileName] = useState('');

  const persistRecord = (next: AfRebateRecord) => {
    setRecord(next);
    onUpdateRecord?.(next);
  };

  const openFieldModal = (field: FieldDef) => {
    setFieldModal(field);
    setFieldDraft(getFieldRawValue(record, field.key));
  };

  const saveFieldModal = () => {
    if (!fieldModal) return;
    if (fieldModal.required && !fieldDraft.trim()) {
      toast.error(`Please enter ${fieldModal.label}.`);
      return;
    }
    const next = applyFieldValue(record, fieldModal.key, fieldDraft);
    persistRecord(next);
    toast.success(`${fieldModal.label} saved`);
    setFieldModal(null);
    setFieldDraft('');
  };

  const openDocModal = (doc: DocRow) => {
    setDocModal(doc);
    setDocFileName('');
  };

  const chooseDocFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) setDocFileName(file.name);
    };
    input.click();
  };

  const saveDocModal = () => {
    if (!docModal) return;
    if (!docFileName) {
      toast.error('Choose a file to upload.');
      return;
    }
    const wasFlagged = !!record.rejectedDocuments?.includes(docModal.key);
    setDocStatus((prev) => ({ ...prev, [docModal.key]: true }));
    let next = { ...record };
    if (docModal.key === 'affidavit') next = { ...next, affidavitUploaded: true };
    if (docModal.key === 'afFinancialNeed') next = { ...next, afFinancialNeedUploaded: true };
    if (docModal.key === 'iceDisposalAgreement') next = { ...next, iceAgreementUploaded: true };
    if (docModal.key === 'possessionConfirmation' || docModal.key === 'retrofitSuitability' || docModal.key === 'signedLease') {
      const docs = [...(next.supportingDocuments || [])];
      if (!docs.includes(docModal.label)) docs.push(docModal.label);
      next = { ...next, supportingDocuments: docs };
    }
    if (next.missingFields?.length) {
      next = {
        ...next,
        missingFields: next.missingFields.filter(
          (f) => !f.toLowerCase().includes(docModal.label.toLowerCase().slice(0, 12).toLowerCase())
        ),
      };
    }
    if (next.rejectedDocuments?.includes(docModal.key)) {
      next = {
        ...next,
        rejectedDocuments: next.rejectedDocuments.filter((k) => k !== docModal.key),
      };
    }
    persistRecord(next);
    toast.success(wasFlagged ? `${docModal.label} replaced` : `${docModal.label} uploaded`, {
      description: docFileName,
    });
    setDocModal(null);
    setDocFileName('');
  };

  const openDocument = (name: string) => {
    const blob = new Blob([`Demo document preview for ${name}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
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
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
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
    { key: 'nationalIdDoc', label: DOC_NAMES.nationalIdCopy, mandatory: true },
    { key: 'driversLicenseDoc', label: DOC_NAMES.motorcycleDriversLicense, mandatory: true },
  ];

  const mandatoryDocs: DocRow[] = [
    { key: 'signedLease', label: DOC_NAMES.signedFinancingAgreement, mandatory: true },
    {
      key: 'afFinancialNeed',
      label: DOC_NAMES.afConfirmationFinancialNeed,
      mandatory: true,
      hasTemplate: true,
      templateName: DOC_TEMPLATE_FILES.afConfirmationFinancialNeed,
    },
  ];

  const retrofitDocs: DocRow[] = [
    {
      key: 'retrofitSuitability',
      label: DOC_NAMES.retrofitSuitability,
      mandatory: true,
      hasTemplate: true,
      templateName: DOC_TEMPLATE_FILES.retrofitSuitability,
    },
    {
      key: 'iceDisposalAgreement',
      label: DOC_NAMES.iceEngineDisposal,
      mandatory: true,
      hasTemplate: true,
      templateName: DOC_TEMPLATE_FILES.iceEngineDisposal,
    },
  ];

  const optionalDocs: DocRow[] = [
    {
      key: 'affidavit',
      label: DOC_NAMES.notarizedAffidavit,
      optional: true,
      hasTemplate: true,
      templateName: DOC_TEMPLATE_FILES.notarizedAffidavit,
    },
    {
      key: 'possessionConfirmation',
      label: DOC_NAMES.possessionStatement,
      optional: true,
      hasTemplate: true,
      templateName: DOC_TEMPLATE_FILES.possessionStatement,
    },
  ];

  const individualFields: FieldDef[] = [
    { key: 'firstName', label: 'Individual first name(s)', required: true, kind: 'text' },
    { key: 'lastName', label: 'Individual last name(s)', required: true, kind: 'text' },
    { key: 'dateOfBirth', label: 'Date of Birth', required: true, kind: 'date', isDate: true },
    {
      key: 'gender',
      label: 'Gender?',
      required: true,
      kind: 'select',
      selectOptions: [
        { value: 'Man', label: 'Man' },
        { value: 'Woman', label: 'Woman' },
      ],
    },
    {
      key: 'vehicleType',
      label: 'Vehicle Type?',
      required: true,
      kind: 'select',
      selectOptions: [
        { value: 'New E-Moto', label: 'New E-Moto' },
        { value: 'Retrofit', label: 'Retrofit' },
      ],
    },
    { key: 'phoneNumber', label: 'Phone Number', required: true, kind: 'text' },
    { key: 'email', label: 'Email', optional: true, kind: 'text' },
    { key: 'tin', label: 'TIN (Tax Identification Number)', optional: true, kind: 'text' },
    { key: 'nationalId', label: 'National ID', required: true, kind: 'text' },
    { key: 'motoLicense', label: "Motorcycle Driver's License", required: true, kind: 'text' },
  ];

  const vehicleFields: FieldDef[] = [
    { key: 'supplier', label: 'E-Moto Provider', required: true, kind: 'text' },
    { key: 'model', label: 'E-Moto Model', required: true, kind: 'text' },
    ...(record.isRetrofit
      ? [{ key: 'retrofitAssembler' as const, label: 'Retrofit Assembler', required: true, kind: 'text' as const }]
      : []),
    {
      key: 'retailCost',
      label: record.isRetrofit ? 'Retrofit Cost (RWF)' : 'Retail E-Moto Price (RWF)',
      required: true,
      kind: 'number',
    },
    {
      key: 'loanAmount',
      label: 'Total Contract Repayment Amount (RWF)',
      required: !isMarketingAgent,
      optional: isMarketingAgent,
      kind: 'number',
    },
    {
      key: 'loanTerm',
      label: 'Contract Term (months)',
      required: !isMarketingAgent,
      optional: isMarketingAgent,
      kind: 'text',
    },
    {
      key: 'repaymentFrequency',
      label: 'Repayment Frequency',
      required: !isMarketingAgent,
      optional: isMarketingAgent,
      kind: 'select',
      selectOptions: [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
      ],
    },
    {
      key: 'monthlyRepayment',
      label: 'Repayment Amount (RWF)',
      required: !isMarketingAgent,
      optional: isMarketingAgent,
      kind: 'number',
    },
  ];

  const displayValue = (field: FieldDef) => {
    const raw = getFieldRawValue(record, field.key);
    if (field.key === 'repaymentFrequency') {
      if (raw === 'weekly') return 'Weekly';
      if (raw === 'monthly') return 'Monthly';
      if (raw === 'daily') return 'Daily';
    }
    if (field.key === 'retailCost' || field.key === 'loanAmount' || field.key === 'monthlyRepayment') {
      const n = parseFloat(raw);
      return raw && !Number.isNaN(n) ? formatNumber(n) : '';
    }
    if (field.isDate) return raw ? formatDisplayDate(raw) : '';
    return raw;
  };

  const fieldIsMissing = (field: FieldDef) => {
    const raw = getFieldRawValue(record, field.key);
    const numeric =
      field.kind === 'number' ? (raw ? parseFloat(raw.replace(/,/g, '')) : 0) : undefined;
    return isAfFieldMissing(
      record,
      field.label,
      field.kind === 'number' ? numeric : raw || undefined
    );
  };

  const AddMissingButton = ({
    onClick,
    ariaLabel = 'Add missing value',
  }: {
    onClick: () => void;
    ariaLabel?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#023F40] bg-white text-[#023F40] hover:bg-[#023F40] hover:text-white transition-colors"
    >
      <Plus className="h-4 w-4" strokeWidth={2.5} />
    </button>
  );

  const DetailFieldRow = ({ field }: { field: FieldDef }) => {
    const missing = fieldIsMissing(field);
    const value = displayValue(field);

    return (
      <div className="min-h-[3.25rem]">
        <FieldLabel as="span" required={field.required} optional={field.optional} className="mb-1">
          {field.label}
        </FieldLabel>
        <div className="min-h-8 flex items-center gap-2">
          {missing && canFillMissing ? (
            <AddMissingButton
              onClick={() => openFieldModal(field)}
              ariaLabel={`Add ${field.label}`}
            />
          ) : missing ? (
            <span className="inline-flex items-center rounded-md bg-[#023F40]/10 px-2 py-1 text-xs font-medium text-[#023F40] ring-1 ring-inset ring-[#023F40]/20">
              Missing
            </span>
          ) : isRejected ? (
            <>
              <p className="font-medium text-gray-900">{value || '—'}</p>
              <button
                type="button"
                onClick={() => openFieldModal(field)}
                aria-label={`Edit ${field.label}`}
                title={`Edit ${field.label}`}
                className="inline-flex items-center justify-center h-6 w-6 rounded-md border border-gray-300 bg-white text-gray-600 hover:border-[#023F40] hover:text-[#023F40] transition-colors"
              >
                <Pencil className="h-3 w-3" strokeWidth={2.5} />
              </button>
            </>
          ) : (
            <p className="font-medium text-gray-900">{value || '—'}</p>
          )}
        </div>
      </div>
    );
  };

  const requiredDocList = (() => {
    const docs = isMarketingAgent
      ? [...identityDocs, ...(record.isRetrofit ? retrofitDocs : [])]
      : [
          ...identityDocs,
          ...mandatoryDocs,
          ...(record.isRetrofit ? retrofitDocs : []),
        ];
    return docs.filter((d) => d.mandatory);
  })();

  const hasMandatoryGaps = (() => {
    const fieldGaps = [...individualFields, ...vehicleFields].some(
      (f) => f.required && fieldIsMissing(f)
    );
    const docGaps = requiredDocList.some((d) => !docStatus[d.key]);
    return fieldGaps || docGaps;
  })();

  const renderDocRow = (doc: DocRow) => {
    const uploaded = !!docStatus[doc.key];
    const flagged = isRejected && !!record.rejectedDocuments?.includes(doc.key);
    return (
      <div
        key={doc.key}
        className={`flex items-center gap-4 p-3 rounded-lg border bg-white ${flagged ? 'border-red-300 bg-red-50/40' : ''}`}
      >
        <div className="flex-shrink-0">
          {flagged ? (
            <AlertCircle className="w-5 h-5 text-red-600" />
          ) : uploaded ? (
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
          {flagged && (
            <p className="text-xs text-red-700 mt-0.5">Flagged by RGF — replace this document.</p>
          )}
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          {doc.hasTemplate && (canEditDocs || !uploaded) ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                toast.success('Template ready for download', { description: doc.templateName })
              }
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Template
            </Button>
          ) : null}
          {uploaded && (
            <Button size="sm" variant="outline" onClick={() => openDocument(doc.label)}>
              <Eye className="w-3.5 h-3.5 mr-1" />
              View
            </Button>
          )}
          {flagged ? (
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => openDocModal(doc)}
            >
              <Upload className="w-3.5 h-3.5 mr-1" />
              Replace
            </Button>
          ) : isRejected && uploaded ? (
            <button
              type="button"
              onClick={() => openDocModal(doc)}
              aria-label={`Replace ${doc.label}`}
              title={`Replace ${doc.label}`}
              className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-300 bg-white text-gray-600 hover:border-[#023F40] hover:text-[#023F40] transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          ) : !uploaded && (canFillMissing || isRejected) ? (
            <Button size="sm" variant="outline" onClick={() => openDocModal(doc)}>
              <Upload className="w-3.5 h-3.5 mr-1" />
              Add file
            </Button>
          ) : !uploaded ? (
            <span className="inline-flex items-center rounded-md bg-[#023F40]/10 px-2 py-1 text-xs font-medium text-[#023F40] ring-1 ring-inset ring-[#023F40]/20">
              Missing
            </span>
          ) : null}
        </div>
      </div>
    );
  };

  const pageTitle = isProposalReview
    ? 'Details on Rebates for Potential Submission to RGF'
    : 'Details on Individual Rebates';
  const pageSubtitle = isProposalReview
    ? 'This page provides details on individual rebates that your marketing Rebate Team members and external designated agents have developed for your consideration. If the proposed individual meets financing and rebate eligibility requirements, please add the missing mandatory information and documents and submit to RGF.'
    : isMarketingAgent
      ? 'This page provides details on individual rebates. Please add any missing mandatory information and documents for rebates in your pipeline before submitting to your Asset Financier.'
      : 'This page provides details on individual rebates. Please add any missing mandatory information and documents for rebates in your pipeline before submitting to RGF.';

  const allDocRows: DocRow[] = [...identityDocs, ...mandatoryDocs, ...retrofitDocs, ...optionalDocs];
  const flaggedDocLabels = (record.rejectedDocuments || []).map(
    (key) => allDocRows.find((d) => d.key === key)?.label || key
  );
  const hasUnresolvedRejectionItems = (record.rejectedDocuments?.length || 0) > 0;

  const showBottomActions = isUnfinished || isProposalReview || isRejected;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Rebate Pipeline
        </Button>
        <Badge className={statusBadgeClass[record.status]}>{AF_STATUS_DISPLAY[record.status]}</Badge>
      </div>

      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">{pageTitle}</h2>
        <p className="text-gray-600 mt-1 text-sm">{pageSubtitle}</p>
        <p className="text-sm text-red-700 mt-2">Status: {AF_STATUS_DISPLAY[record.status]}</p>
      </div>

      {isRejected && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
          <p className="text-sm font-semibold text-red-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            RGF rejected this rebate
          </p>
          {record.rejectionReason && (
            <p className="text-sm text-red-800">"{record.rejectionReason}"</p>
          )}
          <p className="text-sm text-red-800">
            Use the <Pencil className="h-3 w-3 inline -mt-0.5" strokeWidth={2.5} /> icon to correct any
            field or replace any document below.
            {flaggedDocLabels.length > 0 && ' The document(s) below marked Flagged must be replaced before resubmitting.'}
          </p>
          {flaggedDocLabels.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-red-800 space-y-0.5">
              {flaggedDocLabels.map((label) => (
                <li key={`doc-${label}`}>{label} — replace this document below</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-[#023F40]">
            Rebate Application Details — {record.ticketNumber}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Submitted by</span>
              <p className="font-medium">{record.submittedBy}</p>
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
              <p className="font-medium">{formatDisplayDate(record.submittedAt)}</p>
            </div>
            <div>
              <span className="text-gray-500">Ticket No.</span>
              <p className="font-medium text-[#023F40]">{record.ticketNumber}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Individual Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {individualFields.map((field) => (
                <DetailFieldRow key={field.key} field={field} />
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Vehicle and Financing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {vehicleFields.map((field) => (
                <DetailFieldRow key={field.key} field={field} />
              ))}
              <div>
                <FieldLabel as="span" className="mb-0">
                  Rebate Amount (RWF) — auto-calculated
                </FieldLabel>
                <p className="font-medium">
                  {formatRwf(record.rebateAmount) ?? record.rebateAmount ?? '—'} (
                  {getRebatePercent({ isWoman: record.isWoman, isRetrofit: record.isRetrofit })})
                </p>
              </div>
            </div>
          </div>

          {isUnfinished && hasMandatoryGaps && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Some required information or documents are still missing. Use Add on each gap, then
                {isMarketingAgent ? ' Submit to AF.' : ' Submit to RGF.'}
              </p>
            </div>
          )}

          {isMarketingAgent ? (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-[#0a7d4b] mb-1 uppercase tracking-wide text-sm">
                Mandatory Documents
              </h3>
              <p className="text-sm text-gray-600 mb-3">Please upload the documents listed below.</p>
              <div className="space-y-2">{identityDocs.map(renderDocRow)}</div>
              {record.isRetrofit && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    If retrofit
                  </p>
                  <div className="space-y-2">{retrofitDocs.map(renderDocRow)}</div>
                </div>
              )}
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Optional — can be submitted later
                </p>
                <div className="space-y-2">
                  {[
                    {
                      key: 'affidavit',
                      label: DOC_NAMES.notarizedAffidavit,
                      optional: true,
                      hasTemplate: true,
                      templateName: DOC_TEMPLATE_FILES.notarizedAffidavit,
                    },
                  ].map(renderDocRow)}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-1 text-sm uppercase tracking-wide">
                  Identification Documents
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Upload copies of the documents listed below.
                </p>
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

                {record.isRetrofit && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      If retrofit
                    </p>
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
            <h3 className="font-semibold text-gray-900 mb-1">{DOC_NAMES.additionalSupporting}</h3>
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
                        onClick={() =>
                          setAdditionalDocs((prev) => prev.filter((d) => d.id !== doc.id))
                        }
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

          {showBottomActions && isRejected ? (
            <div className="border-t pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-gray-500">
                {hasUnresolvedRejectionItems
                  ? 'Resolve every flagged item above before resubmitting to RGF.'
                  : 'All flagged items are resolved. You can resubmit this rebate to RGF.'}
              </p>
              <Button
                className="bg-[#0a7d4b] hover:bg-[#0c6b42] disabled:opacity-50"
                disabled={hasUnresolvedRejectionItems}
                onClick={() => {
                  if (hasUnresolvedRejectionItems) {
                    toast.error('Resolve all flagged fields and documents before resubmitting.');
                    return;
                  }
                  onSubmitApplication?.(record);
                  toast.success('Rebate resubmitted to RGF');
                }}
              >
                Resubmit to RGF
              </Button>
            </div>
          ) : showBottomActions ? (
            <div className="border-t pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-gray-500">
                {hasMandatoryGaps
                  ? `Complete every required Add item above before submitting to ${isMarketingAgent ? 'AF' : 'RGF'}.`
                  : `All mandatory items are complete. You can submit this rebate to ${isMarketingAgent ? 'your Asset Financier' : 'RGF'}.`}
              </p>
              <Button
                className="bg-[#0a7d4b] hover:bg-[#0c6b42] disabled:opacity-50"
                disabled={hasMandatoryGaps}
                onClick={() => {
                  if (hasMandatoryGaps) {
                    toast.error('Complete all required fields and documents before submitting.');
                    return;
                  }
                  onSubmitApplication?.(record);
                  toast.success(isMarketingAgent ? 'Rebate submitted to AF' : 'Rebate submitted to RGF');
                }}
              >
                {isMarketingAgent ? 'Submit to AF' : 'Submit to RGF'}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={!!fieldModal} onOpenChange={(open) => !open && setFieldModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{fieldModal?.label}</DialogTitle>
            <DialogDescription>Enter the missing information for this field.</DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Label htmlFor="missing-field-input">{fieldModal?.label}</Label>
            {fieldModal?.kind === 'date' ? (
              <DateInput value={fieldDraft} onChange={setFieldDraft} />
            ) : fieldModal?.kind === 'select' ? (
              <Select value={fieldDraft} onValueChange={setFieldDraft}>
                <SelectTrigger>
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {fieldModal.selectOptions?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="missing-field-input"
                type={fieldModal?.kind === 'number' ? 'text' : 'text'}
                inputMode={fieldModal?.kind === 'number' ? 'numeric' : undefined}
                value={fieldDraft}
                onChange={(e) => setFieldDraft(e.target.value)}
                placeholder={fieldModal?.label}
              />
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFieldModal(null)}>
              Cancel
            </Button>
            <Button type="button" className="bg-[#023F40] hover:bg-[#035f60]" onClick={saveFieldModal}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!docModal} onOpenChange={(open) => !open && setDocModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{docModal?.label}</DialogTitle>
            <DialogDescription>Upload the missing document file.</DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            {docModal?.hasTemplate && (
              <button
                type="button"
                className="text-xs text-[#023F40] underline underline-offset-2"
                onClick={() =>
                  toast.success('Template ready for download', {
                    description: docModal.templateName,
                  })
                }
              >
                Get template here
              </button>
            )}
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={chooseDocFile} className="shrink-0">
                <Upload className="w-4 h-4 mr-2" />
                Choose file
              </Button>
              <span className="text-sm text-gray-600 truncate">
                {docFileName || 'No file selected'}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDocModal(null)}>
              Cancel
            </Button>
            <Button type="button" className="bg-[#0a7d4b] hover:bg-[#0c6b42]" onClick={saveDocModal}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleChooseAdditionalFile}
                  className="shrink-0"
                >
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
            <Button
              type="button"
              className="bg-[#0a7d4b] hover:bg-[#0c6b42]"
              onClick={handleConfirmAdditionalDoc}
            >
              Add document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
