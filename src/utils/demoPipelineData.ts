/** Presentation mock data when API returns no seeded applications */
export const DEMO_PIPELINE_APPLICATIONS = [
  {
    id: 'application:demo-reb-010',
    companyName: 'Equity Bank',
    applicantName: 'Patrick Ndagijimana',
    registrationNumber: 'REB-010',
    ticketNumber: 'REB-010',
    rebateAmount: '150000',
    status: 'assigned',
    createdAt: '2026-04-10T09:00:00Z',
    assignedAt: '2026-04-10T09:00:00Z',
    assignedTo: 'demo-analyst',
    nationalId: '1198780077777777',
    isRetrofit: false,
    motorcycleBrand: 'Ampersand',
    motorcycleModel: 'CXS',
    phoneNumber: '+250-4567',
    email: 'patrick.ndagijimana@example.rw',
    motoLicense: 'DL-445566',
    purchasePrice: '3500000',
    loanAmount: '2800000',
    loanTerm: '24',
    monthlyRepayment: '116667',
    repaymentFrequency: 'monthly',
    submittedBy: 'Pamela Mugabe',
    submittedByEmail: 'pamela.mugabe@equity.rw',
    submittedByPhone: '+250-3256',
    demoDaysAfterReceipt: 3,
    eligibilityCheck: { nationalIdCheck: { gender: 'Male', dateOfBirth: '3/1/2004' } },
  },
  {
    id: 'application:demo-reb-003',
    companyName: 'Bboxx',
    applicantName: 'Alice Mutoni',
    registrationNumber: 'REB-003',
    ticketNumber: 'REB-003',
    rebateAmount: '180000',
    status: 'under-review',
    createdAt: '2026-05-20T09:00:00Z',
    assignedAt: '2026-05-28T09:00:00Z',
    assignedTo: 'demo-analyst',
    nationalId: '1198780033333333',
    isRetrofit: false,
    motorcycleBrand: 'Spiro',
    motorcycleModel: 'CXS',
    phoneNumber: '+250-4567',
    email: 'alice.mutoni@example.rw',
    motoLicense: 'DL-778899',
    purchasePrice: '3600000',
    loanAmount: '2900000',
    loanTerm: '24',
    monthlyRepayment: '120833',
    repaymentFrequency: 'monthly',
    submittedBy: 'Pamela Mugabe',
    submittedByEmail: 'pamela.mugabe@bboxx.rw',
    submittedByPhone: '+250-3256',
    demoDaysAfterReceipt: 1,
    lastReviewedAt: '2026-05-29T14:00:00Z',
    eligibilityCheck: { nationalIdCheck: { gender: 'Female', dateOfBirth: '3/1/2004' } },
  },
  {
    id: 'application:demo-reb-001',
    companyName: 'Bank of Kigali',
    applicantName: 'Jean Claude Ndayisaba',
    registrationNumber: 'REB-001',
    ticketNumber: 'REB-001',
    rebateAmount: '150000',
    status: 'assigned',
    createdAt: '2026-05-28T08:00:00Z',
    assignedAt: '2026-05-28T08:00:00Z',
    assignedTo: 'demo-analyst',
    nationalId: '1198780012345678',
    isRetrofit: false,
    motorcycleBrand: 'Rem',
    motorcycleModel: 'E5',
    phoneNumber: '+250-7890',
    motoLicense: 'DL-112233',
    purchasePrice: '3400000',
    loanAmount: '2700000',
    loanTerm: '18',
    monthlyRepayment: '150000',
    repaymentFrequency: 'monthly',
    submittedBy: 'James Uwizeye',
    submittedByEmail: 'james.uwizeye@bk.rw',
    submittedByPhone: '+250-1122',
    demoDaysAfterReceipt: 1,
    eligibilityCheck: { nationalIdCheck: { gender: 'Male', dateOfBirth: '5/12/1998' } },
  },
  {
    id: 'application:demo-reb-002',
    companyName: 'REM',
    applicantName: 'Grace UWASE',
    registrationNumber: 'REB-002',
    ticketNumber: 'REB-002',
    rebateAmount: '200000',
    status: 'assigned',
    createdAt: '2026-05-27T10:00:00Z',
    assignedAt: '2026-05-27T10:00:00Z',
    assignedTo: 'demo-analyst',
    nationalId: '1198780098765432',
    isRetrofit: true,
    motorcycleBrand: 'Rem',
    motorcycleModel: 'Retrofit Kit',
    retrofitAssembler: 'REM Assemblers',
    phoneNumber: '+250-3344',
    motoLicense: 'DL-998877',
    purchasePrice: '1800000',
    loanAmount: '1500000',
    loanTerm: '12',
    monthlyRepayment: '125000',
    repaymentFrequency: 'monthly',
    submittedBy: 'Claire Mukamana',
    submittedByEmail: 'claire.mukamana@rem.rw',
    submittedByPhone: '+250-5566',
    demoDaysAfterReceipt: 2,
    eligibilityCheck: { nationalIdCheck: { gender: 'Female', dateOfBirth: '8/22/1995' } },
  },
  {
    id: 'application:demo-reb-005',
    companyName: 'Bboxx',
    applicantName: 'Alice Mutoni',
    registrationNumber: 'REB-005',
    ticketNumber: 'REB-005',
    rebateAmount: '175000',
    status: 'under-review',
    createdAt: '2026-05-26T09:00:00Z',
    assignedAt: '2026-05-26T09:00:00Z',
    assignedTo: 'demo-analyst',
    nationalId: '1198780055555555',
    isRetrofit: false,
    motorcycleBrand: 'Safi',
    motorcycleModel: 'Urban',
    phoneNumber: '+250-7788',
    motoLicense: 'DL-554433',
    purchasePrice: '3500000',
    loanAmount: '2800000',
    loanTerm: '24',
    monthlyRepayment: '116667',
    repaymentFrequency: 'monthly',
    submittedBy: 'Pamela Mugabe',
    submittedByEmail: 'pamela.mugabe@bboxx.rw',
    submittedByPhone: '+250-3256',
    demoDaysAfterReceipt: 3,
    lastReviewedAt: '2026-05-30T11:00:00Z',
    eligibilityCheck: { nationalIdCheck: { gender: 'Female', dateOfBirth: '1/15/2000' } },
  },
  {
    id: 'application:demo-reb-004',
    companyName: 'Bboxx',
    applicantName: 'Jean HABIMANA',
    registrationNumber: 'REB-004',
    ticketNumber: 'REB-004',
    rebateAmount: '150000',
    status: 'qa-review',
    createdAt: '2026-05-26T09:00:00Z',
    lastReviewedAt: '2026-05-30T11:00:00Z',
    nationalId: '1198780055555555',
    isRetrofit: false,
    motorcycleBrand: 'Spiro',
    motorcycleModel: 'CXS',
    purchasePrice: '3500000',
    assignedTo: 'demo-analyst',
  },
  {
    id: 'application:demo-reb-006',
    companyName: 'Equity Bank',
    applicantName: 'Eric Nshimiyimana',
    registrationNumber: 'REB-006',
    ticketNumber: 'REB-006',
    rebateAmount: '160000',
    status: 'approved-pending-lease',
    createdAt: '2026-04-01T09:00:00Z',
    lastReviewedAt: '2026-05-15T11:00:00Z',
    nationalId: '1198780011111111',
    isRetrofit: false,
    assignedTo: 'demo-analyst',
  },
];

export const QA_DASHBOARD_STATS = {
  verifiedForQaReview: 25,
  verifiedAmountRwf: 4125000,
  noEmotoPossession: 3,
};

export const QA_AWAITING_REVIEW_APPLICATIONS = [
  {
    id: 'application:demo-af-bok-1',
    companyName: 'Bank of Kigali',
    applicantName: 'Patrick N',
    registrationNumber: 'AF-BOK-1',
    ticketNumber: 'AF-BOK-1',
    rebateAmount: '630000',
    status: 'qa-review',
    createdAt: '2026-06-10T09:00:00Z',
    lastReviewedAt: '2026-06-12T11:00:00Z',
    verifiedAt: '2026-06-12T11:00:00Z',
    nationalId: '1198780070707070',
    isRetrofit: false,
    motorcycleBrand: 'Ampersand',
    motorcycleModel: 'Pro',
    purchasePrice: '3500000',
    eligibilityCheck: { nationalIdCheck: { gender: 'Male' } },
  },
  {
    id: 'application:demo-reb-004',
    companyName: 'Bboxx',
    applicantName: 'Jean HABIMANA',
    registrationNumber: 'AF-BBX-4',
    ticketNumber: 'AF-BBX-4',
    rebateAmount: '630000',
    status: 'qa-review',
    createdAt: '2026-05-26T09:00:00Z',
    lastReviewedAt: '2026-05-30T11:00:00Z',
    verifiedAt: '2026-05-30T11:00:00Z',
    nationalId: '1198780055555555',
    isRetrofit: false,
    motorcycleBrand: 'Spiro',
    motorcycleModel: 'CXS',
    purchasePrice: '3500000',
    eligibilityCheck: { nationalIdCheck: { gender: 'Male' } },
  },
  {
    id: 'application:demo-reb-007',
    companyName: 'Equity Bank',
    applicantName: 'Claudine Uwase',
    registrationNumber: 'AF-EQB-7',
    ticketNumber: 'AF-EQB-7',
    rebateAmount: '900000',
    status: 'qa-review',
    createdAt: '2026-05-22T09:00:00Z',
    lastReviewedAt: '2026-06-01T11:00:00Z',
    verifiedAt: '2026-06-01T11:00:00Z',
    nationalId: '1198780022222222',
    isRetrofit: false,
    motorcycleBrand: 'Ampersand',
    motorcycleModel: 'Pro',
    purchasePrice: '3600000',
    eligibilityCheck: { nationalIdCheck: { gender: 'Female' } },
  },
  {
    id: 'application:demo-reb-008',
    companyName: 'REM',
    applicantName: 'Eric Habimana',
    registrationNumber: 'AF-REM-8',
    ticketNumber: 'AF-REM-8',
    rebateAmount: '560000',
    status: 'program-manager-review',
    createdAt: '2026-05-18T09:00:00Z',
    lastReviewedAt: '2026-05-29T11:00:00Z',
    verifiedAt: '2026-05-29T11:00:00Z',
    nationalId: '1198780044444444',
    isRetrofit: true,
    motorcycleBrand: 'Rem',
    motorcycleModel: 'Retrofit Kit',
    retrofitAssembler: 'Rem',
    purchasePrice: '2800000',
    eligibilityCheck: { nationalIdCheck: { gender: 'Male' } },
  },
  {
    id: 'application:demo-reb-009',
    companyName: 'Bank of Kigali',
    applicantName: 'Marie Claire Uwimana',
    registrationNumber: 'AF-BOK-9',
    ticketNumber: 'AF-BOK-9',
    rebateAmount: '850000',
    status: 'qa-review',
    createdAt: '2026-05-24T09:00:00Z',
    lastReviewedAt: '2026-06-02T10:00:00Z',
    verifiedAt: '2026-06-02T10:00:00Z',
    nationalId: '1198780066666666',
    isRetrofit: false,
    motorcycleBrand: 'Safi',
    motorcycleModel: 'City',
    purchasePrice: '3400000',
    eligibilityCheck: { nationalIdCheck: { gender: 'Female' } },
  },
  {
    id: 'application:demo-reb-011',
    companyName: 'Bboxx',
    applicantName: 'Samuel Niyonsaba',
    registrationNumber: 'AF-BBX-11',
    ticketNumber: 'AF-BBX-11',
    rebateAmount: '639000',
    status: 'manager-review',
    createdAt: '2026-05-21T09:00:00Z',
    lastReviewedAt: '2026-05-31T09:00:00Z',
    verifiedAt: '2026-05-31T09:00:00Z',
    nationalId: '1198780088888888',
    isRetrofit: false,
    motorcycleBrand: 'Spiro',
    motorcycleModel: 'E100',
    purchasePrice: '3550000',
    eligibilityCheck: { nationalIdCheck: { gender: 'Male' } },
  },
  {
    id: 'application:demo-reb-012',
    companyName: 'Equity Bank',
    applicantName: 'Divine Mukamana',
    registrationNumber: 'AF-EQB-12',
    ticketNumber: 'AF-EQB-12',
    rebateAmount: '725000',
    status: 'qa-review',
    createdAt: '2026-05-19T09:00:00Z',
    lastReviewedAt: '2026-06-03T09:00:00Z',
    verifiedAt: '2026-06-03T09:00:00Z',
    nationalId: '1198780099999999',
    isRetrofit: true,
    motorcycleBrand: 'Rem',
    motorcycleModel: 'Retrofit Kit',
    retrofitAssembler: 'Safi',
    purchasePrice: '2900000',
    eligibilityCheck: { nationalIdCheck: { gender: 'Female' } },
  },
];

export const QA_NO_POSSESSION_APPLICATIONS = [
  {
    id: 'application:demo-reb-013',
    companyName: 'REM',
    applicantName: 'Olivier Ndayisaba',
    registrationNumber: 'REB-013',
    ticketNumber: 'REB-013',
    rebateAmount: '170000',
    status: 'approved-pending-lease',
    createdAt: '2026-04-15T09:00:00Z',
    lastReviewedAt: '2026-05-20T11:00:00Z',
    nationalId: '1198780010101010',
    isRetrofit: false,
    motorcycleBrand: 'Ampersand',
    motorcycleModel: 'Pro',
    purchasePrice: '3650000',
  },
  {
    id: 'application:demo-reb-014',
    companyName: 'Bank of Kigali',
    applicantName: 'Chantal Uwase',
    registrationNumber: 'REB-014',
    ticketNumber: 'REB-014',
    rebateAmount: '145000',
    status: 'approved-pending-lease',
    createdAt: '2026-04-20T09:00:00Z',
    lastReviewedAt: '2026-05-22T11:00:00Z',
    nationalId: '1198780020202020',
    isRetrofit: false,
    motorcycleBrand: 'Spiro',
    motorcycleModel: 'CXS',
    purchasePrice: '3500000',
    eligibilityCheck: { nationalIdCheck: { gender: 'Female' } },
  },
];

export function getQaPresentationApplications<T extends { id: string }>(apiApps: T[] = []): T[] {
  const demoAll = [
    ...DEMO_PIPELINE_APPLICATIONS,
    ...QA_AWAITING_REVIEW_APPLICATIONS,
    ...QA_NO_POSSESSION_APPLICATIONS,
  ];
  const byId = new Map<string, T>();

  for (const demoApp of demoAll) {
    byId.set(demoApp.id, demoApp as unknown as T);
  }
  for (const apiApp of apiApps) {
    const demoApp = byId.get(apiApp.id);
    byId.set(apiApp.id, demoApp ? ({ ...apiApp, ...demoApp } as T) : apiApp);
  }

  return Array.from(byId.values());
}

export function withDemoPipelineFallback<T extends { id: string }>(
  apps: T[],
  useDemo: boolean
): T[] {
  if (!useDemo || apps.length > 0) return apps;
  return DEMO_PIPELINE_APPLICATIONS as unknown as T[];
}

type AnalystEnrichment = {
  ticketNumber?: string;
  phoneNumber?: string;
  email?: string;
  motorcycleBrand?: string;
  motorcycleModel?: string;
  motoLicense?: string;
  purchasePrice?: string;
  loanAmount?: string;
  loanTerm?: string;
  monthlyRepayment?: string;
  repaymentFrequency?: string;
  retrofitAssembler?: string;
  submittedBy?: string;
  submittedByEmail?: string;
  submittedByPhone?: string;
  demoDaysAfterReceipt?: number;
  eligibilityCheck?: {
    nationalIdCheck?: { gender?: string; dateOfBirth?: string };
  };
};

const ANALYST_ENRICHMENT: Record<string, AnalystEnrichment> = Object.fromEntries(
  DEMO_PIPELINE_APPLICATIONS.map((app) => [app.id, app])
);

export function enrichAnalystApplication<T extends { id: string }>(app: T): T & AnalystEnrichment {
  const defaults = ANALYST_ENRICHMENT[app.id] || {};
  return { ...defaults, ...app };
}

export function analystDaysAfterReceipt(app: {
  assignedAt?: string;
  createdAt: string;
  demoDaysAfterReceipt?: number;
}): number {
  if (app.demoDaysAfterReceipt != null) return app.demoDaysAfterReceipt;
  return Math.floor(
    (Date.now() - new Date(app.assignedAt || app.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
}
