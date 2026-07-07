/** Presentation mock data when API returns no seeded applications */
export const DEMO_PIPELINE_APPLICATIONS = [
  {
    id: 'application:demo-reb-001',
    companyName: 'Bank of Kigali',
    applicantName: 'Jean Claude Ndayisaba',
    registrationNumber: 'REB-001',
    rebateAmount: '150000',
    status: 'assigned',
    createdAt: '2026-05-28T08:00:00Z',
    assignedAt: '2026-05-28T08:00:00Z',
    assignedTo: 'demo-analyst',
    nationalId: '1198780012345678',
    isRetrofit: false,
  },
  {
    id: 'application:demo-reb-002',
    companyName: 'REM',
    applicantName: 'Grace UWASE',
    registrationNumber: 'REB-002',
    rebateAmount: '200000',
    status: 'under-review',
    createdAt: '2026-05-27T10:00:00Z',
    assignedAt: '2026-05-27T10:00:00Z',
    assignedTo: 'demo-analyst',
    nationalId: '1198780098765432',
    isRetrofit: true,
    lastReviewedAt: '2026-05-29T14:00:00Z',
  },
  {
    id: 'application:demo-reb-004',
    companyName: 'Bboxx',
    applicantName: 'Jean HABIMANA',
    registrationNumber: 'REB-004',
    rebateAmount: '150000',
    status: 'manager-review',
    createdAt: '2026-05-26T09:00:00Z',
    lastReviewedAt: '2026-05-30T11:00:00Z',
    nationalId: '1198780055555555',
    isRetrofit: false,
  },
  {
    id: 'application:demo-reb-003',
    companyName: 'Bboxx',
    applicantName: 'Alice Mutoni',
    registrationNumber: 'REB-003',
    rebateAmount: '175000',
    status: 'qa-review',
    createdAt: '2026-05-20T09:00:00Z',
    lastReviewedAt: '2026-05-31T09:00:00Z',
    nationalId: '1198780033333333',
    isRetrofit: false,
  },
  {
    id: 'application:demo-reb-010',
    companyName: 'Equity Bank',
    applicantName: 'Patrick Ndagijimana',
    registrationNumber: 'REB-010',
    rebateAmount: '150000',
    status: 'approved',
    createdAt: '2026-04-10T09:00:00Z',
    lastReviewedAt: '2026-06-01T09:00:00Z',
    nationalId: '1198780077777777',
    isRetrofit: false,
  },
];

export function withDemoPipelineFallback<T extends { id: string }>(
  apps: T[],
  useDemo: boolean
): T[] {
  if (!useDemo || apps.length > 0) return apps;
  return DEMO_PIPELINE_APPLICATIONS as unknown as T[];
}
