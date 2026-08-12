import { formatDisplayDate } from './dateFormat';
import { getRebatePercent } from './rebateCalculation';
import { ReportColumn } from './reportExport';

export type AnalystVerificationStatus = 'In Process' | 'Verified' | 'Rejected';

export type AnalystMetricCategory =
  | 'all'
  | 'not-yet-verified'
  | 'over-two-days'
  | 'verified-not-qa'
  | 'approved-no-emoto';

export interface AnalystRebateRecord {
  id: string;
  ticketNumber: string;
  originatedAt: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  dateOfBirth: string;
  motoLicense: string;
  gender: 'Man' | 'Woman';
  isWoman: boolean;
  vehicleType: 'New E-Moto' | 'Retrofit';
  isRetrofit: boolean;
  eMotoProvider: string;
  retrofitAssembler?: string;
  retailCost: number;
  rebateAmount: number;
  verificationStatus: AnalystVerificationStatus;
  daysAfterReceipt: number;
  category: Exclude<AnalystMetricCategory, 'all'>;
  companyName?: string;
  submittedBy?: string;
}

/** Dashboard card counts — same source of truth as filtered report sizes */
export const ANALYST_DASHBOARD_STATS = {
  notYetVerified: 5,
  overTwoDays: 5,
  verifiedNotPresentedQA: 23,
  approvedNoEmotoConfirmation: 12,
};

export const ANALYST_METRIC_LABELS: Record<AnalystMetricCategory, string> = {
  all: 'All Rebates',
  'not-yet-verified': 'Rebates received but not yet verified',
  'over-two-days': 'Of which received more than 2 days ago',
  'verified-not-qa': 'Rebates Verified but not yet presented to QA Team',
  'approved-no-emoto': 'Rebates Approved but No E-Moto Confirmation',
};

export const ANALYST_METRIC_REPORT_TITLES: Record<AnalystMetricCategory, string> = {
  all: 'All Rebates',
  'not-yet-verified': 'Rebates received but not yet verified',
  'over-two-days': 'Rebates received more than 2 days ago',
  'verified-not-qa': 'Rebates Verified but not yet presented to QA Team',
  'approved-no-emoto': 'Rebates Approved but No E-Moto Confirmation',
};

export const ANALYST_STATUS_DISPLAY: Record<AnalystVerificationStatus, string> = {
  'In Process': 'In Process',
  Verified: 'Verified',
  Rejected: 'Rejected',
};

const PROVIDERS = ['Ampersand', 'Spiro', 'Rem', 'Safi', 'Bboxx'];
const ASSEMBLERS = ['Rem Retrofit Hub', 'Kigali Assembly', 'Safi Works'];
const FIRST = ['Alice', 'Jean', 'Grace', 'Patrick', 'Eric', 'Claudine', 'Diane', 'Yves'];
const LAST = ['Mugisha', 'Habimana', 'Uwase', 'Ndayisaba', 'Mutoni', 'Nshimiyimana', 'Kabera'];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]!;
}

function buildRecord(
  index: number,
  category: Exclude<AnalystMetricCategory, 'all'>,
  overrides: Partial<AnalystRebateRecord> = {}
): AnalystRebateRecord {
  const isWoman = index % 3 === 0;
  const isRetrofit = index % 4 === 0;
  const days =
    category === 'over-two-days' ? 3 + (index % 5) : category === 'not-yet-verified' ? 1 + (index % 2) : 2 + (index % 4);
  const day = String((index % 27) + 1).padStart(2, '0');
  const month = String((index % 6) + 1).padStart(2, '0');
  const retail = isRetrofit ? 1800000 + index * 12000 : 3200000 + index * 25000;
  const rebate = Math.round(retail * (isWoman ? 0.25 : 0.18));

  return {
    id: `analyst-report:${category}:${index}`,
    ticketNumber: `RT-${category.slice(0, 3).toUpperCase()}-${String(index + 1).padStart(3, '0')}`,
    originatedAt: `2026-${month}-${day}`,
    firstName: pick(FIRST, index),
    lastName: pick(LAST, index + 2),
    nationalId: `11987800${String(10000000 + index).slice(0, 8)}`,
    dateOfBirth: `199${index % 10}-0${(index % 8) + 1}-1${index % 9}`,
    motoLicense: `DL-${1000 + index}`,
    gender: isWoman ? 'Woman' : 'Man',
    isWoman,
    vehicleType: isRetrofit ? 'Retrofit' : 'New E-Moto',
    isRetrofit,
    eMotoProvider: isRetrofit ? '—' : pick(PROVIDERS, index),
    retrofitAssembler: isRetrofit ? pick(ASSEMBLERS, index) : undefined,
    retailCost: retail,
    rebateAmount: rebate,
    verificationStatus:
      category === 'not-yet-verified' || category === 'over-two-days'
        ? 'In Process'
        : category === 'verified-not-qa'
          ? 'Verified'
          : 'Verified',
    daysAfterReceipt: days,
    category,
    companyName: pick(['Bank of Kigali', 'Equity Bank', 'Bboxx', 'REM'], index),
    submittedBy: pick(['Pamela Mugabe', 'James Uwizeye', 'Claire Mukamana'], index),
    ...overrides,
  };
}

function buildCategoryRecords(
  category: Exclude<AnalystMetricCategory, 'all'>,
  count: number
): AnalystRebateRecord[] {
  return Array.from({ length: count }, (_, i) => buildRecord(i, category));
}

/** Report rows sized to match dashboard card counts */
export const ANALYST_MOCK_REBATE_RECORDS: AnalystRebateRecord[] = [
  ...buildCategoryRecords('not-yet-verified', ANALYST_DASHBOARD_STATS.notYetVerified),
  ...buildCategoryRecords('over-two-days', ANALYST_DASHBOARD_STATS.overTwoDays),
  ...buildCategoryRecords('verified-not-qa', ANALYST_DASHBOARD_STATS.verifiedNotPresentedQA),
  ...buildCategoryRecords('approved-no-emoto', ANALYST_DASHBOARD_STATS.approvedNoEmotoConfirmation),
];

export function recordMatchesMetric(
  record: AnalystRebateRecord,
  category: AnalystMetricCategory
): boolean {
  switch (category) {
    case 'all':
      return true;
    case 'not-yet-verified':
      return record.category === 'not-yet-verified';
    case 'over-two-days':
      return record.category === 'over-two-days';
    case 'verified-not-qa':
      return record.category === 'verified-not-qa';
    case 'approved-no-emoto':
      return record.category === 'approved-no-emoto';
    default:
      return true;
  }
}

export function metricCount(category: AnalystMetricCategory): number {
  switch (category) {
    case 'all':
      return ANALYST_MOCK_REBATE_RECORDS.length;
    case 'not-yet-verified':
      return ANALYST_DASHBOARD_STATS.notYetVerified;
    case 'over-two-days':
      return ANALYST_DASHBOARD_STATS.overTwoDays;
    case 'verified-not-qa':
      return ANALYST_DASHBOARD_STATS.verifiedNotPresentedQA;
    case 'approved-no-emoto':
      return ANALYST_DASHBOARD_STATS.approvedNoEmotoConfirmation;
    default:
      return 0;
  }
}

const ANALYST_REBATE_REPORT_COLUMNS: ReportColumn[] = [
  { header: 'Ticket No', key: 'ticketNumber' },
  { header: 'Date', key: 'originatedAt' },
  { header: 'First Name', key: 'firstName' },
  { header: 'Last Name', key: 'lastName' },
  { header: 'National ID', key: 'nationalId' },
  { header: 'DOB', key: 'dateOfBirth' },
  { header: 'License', key: 'motoLicense' },
  { header: 'Gender', key: 'gender' },
  { header: 'Vehicle', key: 'vehicleType' },
  { header: 'E-Moto Provider', key: 'eMotoProvider' },
  { header: 'Assembler', key: 'retrofitAssembler' },
  { header: 'Retail (RWF)', key: 'retailCost' },
  { header: 'Rebate Amount (RWF)', key: 'rebateAmount' },
  { header: 'Rebate Percentage (%)', key: 'rebatePercent' },
  { header: 'Status', key: 'status' },
];

/** Builds the full column/row set for an AnalystRebateRecord report export — every field the on-screen table shows. */
export function analystRebateRowsForExport(rows: AnalystRebateRecord[]) {
  const reportRows = rows.map((r) => ({
    ticketNumber: r.ticketNumber,
    originatedAt: formatDisplayDate(r.originatedAt),
    firstName: r.firstName || '',
    lastName: r.lastName || '',
    nationalId: r.nationalId || '',
    dateOfBirth: formatDisplayDate(r.dateOfBirth),
    motoLicense: r.motoLicense || '',
    gender: r.gender,
    vehicleType: r.vehicleType,
    eMotoProvider: r.isRetrofit ? '' : r.eMotoProvider || '',
    retrofitAssembler: r.isRetrofit ? r.retrofitAssembler || '' : '',
    retailCost: r.retailCost,
    rebateAmount: r.rebateAmount,
    rebatePercent: getRebatePercent({ isWoman: r.isWoman, isRetrofit: r.isRetrofit }),
    status: ANALYST_STATUS_DISPLAY[r.verificationStatus],
  }));
  return { columns: ANALYST_REBATE_REPORT_COLUMNS, rows: reportRows };
}
