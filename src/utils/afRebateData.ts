export type AfRebateStatus =
  | 'unfinished'
  | 'submitted-not-approved'
  | 'approved-lacking-possession'
  | 'approved-disbursed';

export type AfMetricCategory =
  | 'all'
  | 'unfinished'
  | 'submitted-not-approved'
  | 'lacking-possession'
  | 'disbursements-to-date';

export interface AfRebateRecord {
  ticketNumber: string;
  submittedBy: string;
  submittedByEmail?: string;
  submittedByPhone?: string;
  submittedAt: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  dateOfBirth: string;
  motoLicense: string;
  gender: 'Male' | 'Female';
  isWoman: boolean;
  vehicleType: 'New E-Moto' | 'Retrofit';
  isRetrofit: boolean;
  supplier: string;
  model: string;
  retrofitAssembler?: string;
  retailCost: number;
  rebateAmount: number;
  status: AfRebateStatus;
  supportingDocuments: string[];
  affidavitUploaded: boolean;
  afFinancialNeedUploaded: boolean;
  iceAgreementUploaded: boolean;
  phoneNumber?: string;
  email?: string;
  loanAmount?: number;
  loanTerm?: string;
  repaymentFrequency?: string;
  monthlyRepayment?: number;
  tin?: string;
  missingFields?: string[];
}

export const AF_STATUS_DISPLAY: Record<AfRebateStatus, string> = {
  unfinished: 'In your Pipeline – Not yet submitted to RGF',
  'submitted-not-approved': 'Submitted to RGF but not Approved',
  'approved-lacking-possession': 'Approved but lacking E-Moto Possession',
  'approved-disbursed': 'Disbursement Authorized',
};

export const AF_SUBMITTER_CONTACTS: Record<string, { email: string; phone: string }> = {
  'BoK Admin': { email: 'admin@bankofkigali.rw', phone: '+250 788 100 001' },
  'Grace Mukandori': { email: 'grace.mukandori@bankofkigali.rw', phone: '+250 788 200 002' },
  'Kevin Agent': { email: 'kevin.agent@bankofkigali.rw', phone: '+250 788 300 003' },
  'Patrick Nshimiyimana': { email: 'patrick.nshimiyimana@bankofkigali.rw', phone: '+250 788 400 004' },
};

export function getSubmitterContactInfo(record: AfRebateRecord): { email: string; phone: string } {
  const fallback = AF_SUBMITTER_CONTACTS[record.submittedBy];
  return {
    email: record.submittedByEmail ?? fallback?.email ?? 'Not provided',
    phone: record.submittedByPhone ?? fallback?.phone ?? 'Not provided',
  };
}

export function formDataToUnfinishedRecord(
  formData: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    isWoman: string;
    phoneNumber: string;
    email: string;
    nationalId: string;
    driversLicense: string;
    brand: string;
    model: string;
    retrofitAssembler: string;
    purchasePrice: string;
    retrofitCost: string;
    rebateAmount: string;
    isRetrofit: boolean;
    loanAmount?: string;
    loanTerm?: string;
    repaymentFrequency?: string;
    monthlyRepayment?: string;
    tin?: string;
    documents?: Record<string, { uploaded?: boolean }>;
    additionalDocuments?: Array<{ label: string }>;
  },
  ticketNumber: string,
  submittedBy: string,
  missingFields: string[],
  submitterContact?: { email?: string; phone?: string }
): AfRebateRecord {
  const retailCost = formData.isRetrofit
    ? parseFloat(formData.retrofitCost) || 0
    : parseFloat(formData.purchasePrice) || 0;
  const rebateAmount = parseFloat(formData.rebateAmount) || 0;
  const isWoman = formData.isWoman === 'yes';
  return {
    ticketNumber,
    submittedBy,
    submittedByEmail: submitterContact?.email ?? AF_SUBMITTER_CONTACTS[submittedBy]?.email,
    submittedByPhone: submitterContact?.phone ?? AF_SUBMITTER_CONTACTS[submittedBy]?.phone,
    submittedAt: new Date().toISOString().slice(0, 10),
    firstName: formData.firstName,
    lastName: formData.lastName,
    nationalId: formData.nationalId,
    dateOfBirth: formData.dateOfBirth,
    motoLicense: formData.driversLicense,
    gender: isWoman ? 'Female' : 'Male',
    isWoman,
    vehicleType: formData.isRetrofit ? 'Retrofit' : 'New E-Moto',
    isRetrofit: formData.isRetrofit,
    supplier: formData.brand,
    model: formData.model,
    retrofitAssembler: formData.retrofitAssembler || undefined,
    retailCost,
    rebateAmount,
    status: 'unfinished',
    phoneNumber: formData.phoneNumber,
    email: formData.email,
    tin: formData.tin || undefined,
    loanAmount: formData.loanAmount ? parseFloat(formData.loanAmount) : undefined,
    loanTerm: formData.loanTerm,
    repaymentFrequency: formData.repaymentFrequency,
    monthlyRepayment: formData.monthlyRepayment ? parseFloat(formData.monthlyRepayment) : undefined,
    supportingDocuments: [
      ...Object.entries(formData.documents || {})
        .filter(([, v]) => v?.uploaded)
        .map(([k]) => k),
      ...(formData.additionalDocuments || []).map((d) => d.label),
    ],
    affidavitUploaded: Boolean(formData.documents?.affidavit?.uploaded),
    afFinancialNeedUploaded: Boolean(formData.documents?.afFinancialNeed?.uploaded),
    iceAgreementUploaded: Boolean(formData.documents?.iceDisposalAgreement?.uploaded),
    missingFields,
  };
}

export function afRecordToFormDraft(record: AfRebateRecord) {
  return {
    firstName: record.firstName,
    lastName: record.lastName,
    dateOfBirth: record.dateOfBirth,
    isWoman: record.isWoman ? 'yes' : 'no',
    phoneNumber: record.phoneNumber || '',
    email: record.email || '',
    nationalId: record.nationalId,
    driversLicense: record.motoLicense,
    brand: record.supplier,
    model: record.model,
    purchasePrice: record.retailCost ? String(record.retailCost) : '',
    rebateAmount: record.rebateAmount ? String(record.rebateAmount) : '',
    isRetrofit: record.isRetrofit,
    retrofitAssembler: record.retrofitAssembler || '',
    loanAmount: record.loanAmount ? String(record.loanAmount) : '',
    loanTerm: record.loanTerm || '',
    repaymentFrequency: record.repaymentFrequency || 'daily',
    monthlyRepayment: record.monthlyRepayment ? String(record.monthlyRepayment) : '',
    tin: record.tin || '',
  };
}

export function isAfFieldMissing(record: AfRebateRecord, label: string, value?: string | number) {
  if (record.missingFields?.includes(label)) return true;
  if (record.status !== 'unfinished') return false;
  if (value === undefined || value === null || value === '') return true;
  if (typeof value === 'number' && value === 0) return true;
  return false;
}

export const AF_DASHBOARD_STATS = {
  totalInPipelineAndDisbursed: 45,
  pipelineBeingDeveloped: 7,
  submittedNotApproved: 3,
  lackingPossession: 3,
  disbursementsToDate: 32,
};

export const AF_METRIC_LABELS: Record<AfMetricCategory, string> = {
  all: 'Your Total Rebates in Pipeline and Disbursed',
  unfinished: 'Your Pipeline being Developed for Submission to RGF',
  'submitted-not-approved': 'Submitted to RGF but not yet Approved',
  'lacking-possession': 'Approved Rebates Lacking AF Confirmation of E-Moto Possession',
  'disbursements-to-date': 'Approved Rebates Disbursements to date',
};

export function getPipelineRecords(records: AfRebateRecord[]): AfRebateRecord[] {
  return records.filter((r) => r.status === 'unfinished');
}

export function getPipelineSummary(records: AfRebateRecord[]) {
  const pipeline = getPipelineRecords(records);
  return {
    count: pipeline.length,
    totalRebate: pipeline.reduce((s, r) => s + r.rebateAmount, 0),
    totalRetail: pipeline.reduce((s, r) => s + r.retailCost, 0),
  };
}

export function recordMatchesMetric(record: AfRebateRecord, category: AfMetricCategory): boolean {
  switch (category) {
    case 'all':
      return true;
    case 'unfinished':
      return record.status === 'unfinished';
    case 'submitted-not-approved':
      return record.status === 'submitted-not-approved';
    case 'lacking-possession':
      return record.status === 'approved-lacking-possession';
    case 'disbursements-to-date':
      return record.status === 'approved-disbursed';
    default:
      return true;
  }
}

export const AF_MOCK_REBATE_RECORDS: AfRebateRecord[] = [
  {
    ticketNumber: 'AF-BOK-DRAFT-1',
    submittedBy: 'BoK Admin',
    submittedAt: '2026-07-18',
    firstName: 'Prosper',
    lastName: 'Manzi',
    nationalId: '',
    dateOfBirth: '',
    motoLicense: '',
    gender: 'Male',
    isWoman: false,
    vehicleType: 'New E-Moto',
    isRetrofit: false,
    supplier: '',
    model: '',
    retailCost: 1400000,
    rebateAmount: 180000,
    status: 'unfinished',
    phoneNumber: '0788001122',
    email: '',
    supportingDocuments: [],
    affidavitUploaded: false,
    afFinancialNeedUploaded: false,
    iceAgreementUploaded: false,
    missingFields: [
      'National ID',
      'Motorcycle License',
      'Date of Birth',
      'E-Moto Provider',
      'E-Moto Model',
      'Retail E-Moto Price',
      'Signed Financing Agreement',
    ],
  },
  {
    ticketNumber: 'AF-BOK-101',
    submittedBy: 'Grace Mukandori',
    submittedAt: '2026-05-02',
    firstName: 'Jean Claude',
    lastName: 'Ndayisaba',
    nationalId: '1198780012345678',
    dateOfBirth: '1992-03-14',
    motoLicense: 'DL-2024-1022',
    gender: 'Male',
    isWoman: false,
    vehicleType: 'New E-Moto',
    isRetrofit: false,
    supplier: 'Ampersand',
    model: 'AMP-E2',
    retailCost: 3500000,
    rebateAmount: 630000,
    status: 'submitted-not-approved',
    supportingDocuments: ['Signed lease', 'National ID'],
    affidavitUploaded: true,
    afFinancialNeedUploaded: true,
    iceAgreementUploaded: false,
  },
  {
    ticketNumber: 'AF-BOK-102',
    submittedBy: 'Kevin Agent',
    submittedAt: '2026-05-08',
    firstName: 'Grace',
    lastName: 'Uwase',
    nationalId: '1198780098765432',
    dateOfBirth: '1998-11-22',
    motoLicense: 'DL-2023-8831',
    gender: 'Female',
    isWoman: true,
    vehicleType: 'Retrofit',
    isRetrofit: true,
    supplier: 'Spiro',
    model: 'SP-Retrofit',
    retrofitAssembler: 'REM',
    retailCost: 1450000,
    rebateAmount: 185000,
    status: 'unfinished',
    supportingDocuments: ['Client support letter'],
    affidavitUploaded: true,
    afFinancialNeedUploaded: true,
    iceAgreementUploaded: true,
    missingFields: [],
  },
  {
    ticketNumber: 'AF-BOK-103',
    submittedBy: 'Grace Mukandori',
    submittedAt: '2026-05-12',
    firstName: 'Marie Claire',
    lastName: 'Uwimana',
    nationalId: '1198780033333333',
    dateOfBirth: '1995-07-08',
    motoLicense: 'DL-2025-4201',
    gender: 'Female',
    isWoman: true,
    vehicleType: 'New E-Moto',
    isRetrofit: false,
    supplier: 'Bboxx',
    model: 'BBX-Prime',
    retailCost: 3600000,
    rebateAmount: 900000,
    status: 'approved-lacking-possession',
    supportingDocuments: ['Supporting statement', 'Driver training completion'],
    affidavitUploaded: true,
    afFinancialNeedUploaded: true,
    iceAgreementUploaded: false,
  },
  {
    ticketNumber: 'AF-BOK-104',
    submittedBy: 'Patrick Nshimiyimana',
    submittedAt: '2026-04-18',
    firstName: 'Eric',
    lastName: 'Habimana',
    nationalId: '1198780044444444',
    dateOfBirth: '1990-01-30',
    motoLicense: 'DL-2022-7710',
    gender: 'Male',
    isWoman: false,
    vehicleType: 'Retrofit',
    isRetrofit: true,
    supplier: 'Rem',
    model: 'REM-R1',
    retrofitAssembler: 'Rem',
    retailCost: 2800000,
    rebateAmount: 560000,
    status: 'approved-disbursed',
    supportingDocuments: ['Signed lease', 'Possession confirmation'],
    affidavitUploaded: true,
    afFinancialNeedUploaded: true,
    iceAgreementUploaded: true,
  },
  {
    ticketNumber: 'AF-BOK-105',
    submittedBy: 'Kevin Agent',
    submittedAt: '2026-06-01',
    firstName: 'Alice',
    lastName: 'Mutoni',
    nationalId: '1198780055555555',
    dateOfBirth: '1997-09-12',
    motoLicense: 'DL-2024-3301',
    gender: 'Female',
    isWoman: true,
    vehicleType: 'New E-Moto',
    isRetrofit: false,
    supplier: 'Ampersand',
    model: 'AMP-Pro',
    retailCost: 3400000,
    rebateAmount: 850000,
    status: 'submitted-not-approved',
    supportingDocuments: ['Signed lease'],
    affidavitUploaded: true,
    afFinancialNeedUploaded: true,
    iceAgreementUploaded: false,
  },
  {
    ticketNumber: 'AF-BOK-106',
    submittedBy: 'Grace Mukandori',
    submittedAt: '2026-06-10',
    firstName: 'Jean',
    lastName: 'Habimana',
    nationalId: '1198780066666666',
    dateOfBirth: '1993-12-05',
    motoLicense: 'DL-2023-1190',
    gender: 'Male',
    isWoman: false,
    vehicleType: 'New E-Moto',
    isRetrofit: false,
    supplier: 'Spiro',
    model: 'SP-Max',
    retailCost: 1500000,
    rebateAmount: 190000,
    status: 'unfinished',
    supportingDocuments: ['Draft lease'],
    affidavitUploaded: false,
    afFinancialNeedUploaded: true,
    iceAgreementUploaded: false,
    missingFields: ['Individual Affidavit (Financial Need)', 'Signed Financing Agreement'],
  },
  {
    ticketNumber: 'AF-BOK-MKT-201',
    submittedBy: 'Kevin Agent',
    submittedAt: '2026-06-15',
    firstName: 'Solange',
    lastName: 'Mukamurera',
    nationalId: '1198780099999999',
    dateOfBirth: '1994-02-18',
    motoLicense: 'DL-2024-5501',
    gender: 'Female',
    isWoman: true,
    vehicleType: 'New E-Moto',
    isRetrofit: false,
    supplier: 'Ampersand',
    model: 'AMP-E1',
    retailCost: 1420000,
    rebateAmount: 182000,
    status: 'unfinished',
    supportingDocuments: ['Marketing lead form'],
    affidavitUploaded: false,
    afFinancialNeedUploaded: false,
    iceAgreementUploaded: false,
    missingFields: ['Signed Financing Agreement', 'Individual Affidavit (Financial Need)'],
  },
  {
    ticketNumber: 'AF-BOK-MKT-202',
    submittedBy: 'Kevin Agent',
    submittedAt: '2026-06-20',
    firstName: 'Fabrice',
    lastName: 'Niyonzima',
    nationalId: '1198780011111111',
    dateOfBirth: '1989-11-03',
    motoLicense: 'DL-2023-4402',
    gender: 'Male',
    isWoman: false,
    vehicleType: 'Retrofit',
    isRetrofit: true,
    supplier: 'Spiro',
    model: 'SP-Retrofit',
    retrofitAssembler: 'REM',
    retailCost: 1480000,
    rebateAmount: 188000,
    status: 'unfinished',
    supportingDocuments: ['Client intake form'],
    affidavitUploaded: true,
    afFinancialNeedUploaded: false,
    iceAgreementUploaded: false,
    missingFields: ['AF Confirmation of Financial Need', 'Signed Retrofit Suitability Statement'],
  },
  {
    ticketNumber: 'AF-BOK-MKT-203',
    submittedBy: 'Grace Mukandori',
    submittedAt: '2026-06-25',
    firstName: 'Chantal',
    lastName: 'Ingabire',
    nationalId: '1198780022222222',
    dateOfBirth: '1996-08-27',
    motoLicense: 'DL-2025-1108',
    gender: 'Female',
    isWoman: true,
    vehicleType: 'New E-Moto',
    isRetrofit: false,
    supplier: 'Bboxx',
    model: 'BBX-Prime',
    retailCost: 1350459,
    rebateAmount: 187500,
    status: 'unfinished',
    supportingDocuments: ['Employment letter'],
    affidavitUploaded: true,
    afFinancialNeedUploaded: true,
    iceAgreementUploaded: false,
    missingFields: ['Signed Financing Agreement'],
  },
  {
    ticketNumber: 'AF-BOK-MKT-204',
    submittedBy: 'Patrick Nshimiyimana',
    submittedAt: '2026-07-01',
    firstName: 'Olivier',
    lastName: 'Twagirumukiza',
    nationalId: '1198780033333334',
    dateOfBirth: '1991-05-14',
    motoLicense: 'DL-2024-7788',
    gender: 'Male',
    isWoman: false,
    vehicleType: 'New E-Moto',
    isRetrofit: false,
    supplier: 'Ampersand',
    model: 'AMP-Pro',
    retailCost: 1400000,
    rebateAmount: 188000,
    status: 'unfinished',
    supportingDocuments: ['Mobile money statement'],
    affidavitUploaded: false,
    afFinancialNeedUploaded: true,
    iceAgreementUploaded: false,
    missingFields: ['Individual Affidavit (Financial Need)', 'Signed Financing Agreement'],
  },
  {
    ticketNumber: 'AF-BOK-107',
    submittedBy: 'Patrick Nshimiyimana',
    submittedAt: '2026-03-22',
    firstName: 'Claudine',
    lastName: 'Mukamana',
    nationalId: '1198780077777777',
    dateOfBirth: '1996-04-17',
    motoLicense: 'DL-2021-5522',
    gender: 'Female',
    isWoman: true,
    vehicleType: 'Retrofit',
    isRetrofit: true,
    supplier: 'Ampersand',
    model: 'AMP-Retro',
    retrofitAssembler: 'Green Volt Retrofit Ltd',
    retailCost: 2900000,
    rebateAmount: 725000,
    status: 'approved-disbursed',
    supportingDocuments: ['Signed lease', 'Possession confirmation'],
    affidavitUploaded: true,
    afFinancialNeedUploaded: true,
    iceAgreementUploaded: true,
  },
  {
    ticketNumber: 'AF-BOK-108',
    submittedBy: 'Kevin Agent',
    submittedAt: '2026-05-28',
    firstName: 'Emmanuel',
    lastName: 'Niyonsaba',
    nationalId: '1198780088888888',
    dateOfBirth: '1991-08-03',
    motoLicense: 'DL-2024-9012',
    gender: 'Male',
    isWoman: false,
    vehicleType: 'New E-Moto',
    isRetrofit: false,
    supplier: 'Bboxx',
    model: 'BBX-Lite',
    retailCost: 3300000,
    rebateAmount: 594000,
    status: 'approved-lacking-possession',
    supportingDocuments: ['Signed lease'],
    affidavitUploaded: true,
    afFinancialNeedUploaded: true,
    iceAgreementUploaded: false,
  },
];

export const AF_DOCUMENT_TEMPLATES = [
  {
    label: 'Individual Affidavit of Financial Need',
    file: 'Individual_Affidavit_of_Financial_Need_Template.pdf',
  },
  {
    label: 'Your Confirmation of Financial Need',
    file: 'AF_Confirmation_of_Financial_Need_Template.pdf',
  },
  {
    label: 'ICE-Moto Engine Disposal Agreement (for retrofits)',
    file: 'ICE_Moto_Engine_Disposal_Agreement_Template.pdf',
  },
  {
    label: 'AF/Client Confirmation of E-Moto Possession',
    file: 'AF_Client_Confirmation_of_EMoto_Possession_Template.pdf',
  },
];
