import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { exportReportToExcel, exportReportToPdf, ReportColumn } from '../../utils/reportExport';
import { motion } from 'motion/react';
import { User } from '../../utils/auth';
import { QAReview } from './QAReview';
import { Greeting } from '../ui/Greeting';
import { LeaseReviewView } from './LeaseReviewView';
import { QATeamDecisionPage } from './QATeamDecisionPage';
import { PossessionAnalysisView } from './PossessionAnalysisView';
import { RebateReassignmentPipeline } from './RebateReassignmentPipeline';
import { WeeklyDisbursementReport } from './WeeklyDisbursementReport';
import { PageHeader } from '../PageHeader';
import { NotificationsView } from '../NotificationsView';
import { getQaPresentationApplications } from '../../utils/demoPipelineData';
import { getRebatePercent } from '../../utils/rebateCalculation';
import { formatNumber } from '../../utils/numberFormat';
import { formatDisplayDate } from '../../utils/dateFormat';
import { DOC_NAMES } from '../../utils/documentNames';
import { matchesGenderFilter, matchesVehicleTypeFilter } from '../../utils/filterLabels';
import { QA_DEFAULT_FILTER_VALUES, QaStandardFilters } from './QaStandardFilters';

interface Application {
  id: string;
  companyName: string;
  registrationNumber?: string;
  ticketNumber?: string;
  applicantName?: string;
  rebateAmount: string;
  status: string;
  createdAt: string;
  lastReviewedAt?: string;
  verifiedAt?: string;
  flaggedForCFO?: boolean;
  isRetrofit?: boolean;
  motorcycleBrand?: string;
  motorcycleModel?: string;
  retrofitAssembler?: string;
  purchasePrice?: string;
  eligibilityCheck?: {
    nationalIdCheck?: { gender?: string };
  };
}

interface QaDecision {
  decision: 'approve' | 'reject';
  reason: string;
  timestamp: string;
  submitted: boolean;
}

interface QADashboardProps {
  user: User;
  currentPage: string;
  onNavigate?: (page: string) => void;
}

function enrichQaApplication(app: any, index: number): any {
  const applicantName = app.applicantName || ['Patrick N', 'Alice U', 'Jean H', 'Grace M'][index % 4];
  const motorcycleBrand = app.motorcycleBrand || ['Bboxx', 'Spiro', 'Ampersand'][index % 3];
  const motorcycleModel = app.motorcycleModel || `Model-${index + 1}`;
  const createdAt = app.createdAt || new Date().toISOString();
  const defaultDocs = [
    {
      name: DOC_NAMES.signedFinancingAgreement,
      type: 'pdf',
      url: '/mock/documents/financing-contract.pdf',
      uploadedAt: createdAt,
      verified: true,
    },
    {
      name: DOC_NAMES.nationalIdCopy,
      type: 'pdf',
      url: '/mock/documents/national-id.pdf',
      uploadedAt: createdAt,
      verified: true,
    },
    {
      name: DOC_NAMES.motorcycleDriversLicense,
      type: 'pdf',
      url: '/mock/documents/driver-license.pdf',
      uploadedAt: createdAt,
      verified: true,
    },
    {
      name: DOC_NAMES.notarizedAffidavit,
      type: 'pdf',
      url: '/mock/documents/affidavit.pdf',
      uploadedAt: createdAt,
      verified: true,
    },
    {
      name: DOC_NAMES.afConfirmationFinancialNeed,
      type: 'pdf',
      url: '/mock/documents/af-confirmation.pdf',
      uploadedAt: createdAt,
      verified: true,
    },
  ];
  if (app.isRetrofit) {
    defaultDocs.push(
      {
        name: DOC_NAMES.retrofitSuitability,
        type: 'pdf',
        url: '/mock/documents/retrofit-suitability.pdf',
        uploadedAt: createdAt,
        verified: true,
      },
      {
        name: DOC_NAMES.iceEngineDisposal,
        type: 'pdf',
        url: '/mock/documents/ice-disposal.pdf',
        uploadedAt: createdAt,
        verified: true,
      }
    );
  }
  // Most demos omit possession — optional for QA approval / CFO exclusion rule
  if (index % 3 === 0) {
    defaultDocs.push({
      name: DOC_NAMES.possessionStatement,
      type: 'pdf',
      url: '/mock/documents/possession.pdf',
      uploadedAt: createdAt,
      verified: true,
    });
  }
  defaultDocs.push({
    name: 'Mobile Money Statement',
    type: 'pdf',
    url: '/mock/documents/mobile-money.pdf',
    uploadedAt: createdAt,
    verified: false,
  });

  return {
    ...app,
    applicantName,
    nationalId: app.nationalId || `11990${(1000000000 + index).toString()}`,
    phoneNumber: app.phoneNumber || `+25078890${(1000 + index).toString()}`,
    email: app.email || `${applicantName.toLowerCase().replace(/\s+/g, '.')}@demo.rw`,
    motorcycleBrand,
    motorcycleModel,
    retrofitAssembler: app.retrofitAssembler || (app.isRetrofit ? motorcycleBrand : undefined),
    purchasePrice: app.purchasePrice || `${3500000 + index * 100000}`,
    loanAmount: app.loanAmount || `${3000000 + index * 90000}`,
    interestRate: app.interestRate || '12%',
    loanTerm: app.loanTerm || '24 months',
    monthlyRepayment: app.monthlyRepayment || `${140000 + index * 5000}`,
    submittedBy: app.submittedBy || 'Pamela Mugabe',
    submittedByEmail: app.submittedByEmail || 'pamela.mugabe@af.rw',
    submittedByPhone: app.submittedByPhone || '+250-3256',
    eligibilityCheck: app.eligibilityCheck || {
      nationalIdCheck: { gender: index % 2 === 0 ? 'Male' : 'Female', dateOfBirth: '1992-04-12' },
    },
    documents: app.documents && app.documents.length > 0 ? app.documents : defaultDocs,
    reviewHistory: app.reviewHistory && app.reviewHistory.length > 0 ? app.reviewHistory : [
      {
        reviewerName: 'Alice Analyst',
        reviewerRole: 'Rebate Analyst',
        decision: 'Recommended',
        reviewedAt: createdAt,
        notes: 'All required checks completed and recommendation recorded for QA.',
      },
      {
        reviewerName: 'Catherine Manager',
        reviewerRole: 'Rebate Manager',
        decision: 'Forwarded',
        reviewedAt: app.verifiedAt || app.lastReviewedAt || new Date(Date.now() - 86400000).toISOString(),
        notes: 'Verified and forwarded for QA Team review.',
      },
    ],
    verifiedAt: app.verifiedAt || app.lastReviewedAt || createdAt,
  };
}

export function QADashboard({ user, currentPage, onNavigate }: QADashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [sortBy, setSortBy] = useState<string>('date-oldest');
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [filterVehicleType, setFilterVehicleType] = useState('all');
  const [filterFinancier, setFilterFinancier] = useState('all');
  const [filterProvider, setFilterProvider] = useState('all');
  const [filterRetrofitAssembler, setFilterRetrofitAssembler] = useState('all');
  const [qaDecisions, setQaDecisions] = useState<Record<string, QaDecision>>({});
  const [autoOpenPossessionTicket, setAutoOpenPossessionTicket] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await api.getAllApplications();
      const merged = getQaPresentationApplications(data as Application[]);
      const enriched = merged.map((app, idx) => enrichQaApplication(app, idx));
      setApplications(enriched as Application[]);
    } catch (error: any) {
      toast.error('Failed to load applications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewComplete = () => {
    setSelectedApp(null);
    loadApplications();
  };

  const STATUS_GROUPS: Record<string, string[]> = {
    submitted: ['assigned', 'submitted', 'submitted-not-approved'],
    'in-process': [
      'under-review',
      'manager-review',
      'qa-review',
      'program-manager-review',
      'awaiting-qa',
    ],
    'no-possession': ['approved-pending-lease', 'payment-processed', 'approved'],
    approved: ['approved', 'approved-pending-lease', 'lease-review'],
    rejected: ['rejected'],
    disbursed: ['disbursed', 'payment-processed'],
    'awaiting-qa': ['manager-review', 'qa-review', 'program-manager-review'],
  };
  const NO_POSSESSION_STATUSES = ['approved-pending-lease', 'payment-processed', 'approved'];
  const QA_AWAITING_STATUSES = ['manager-review', 'qa-review', 'program-manager-review'];

  const awaitingQaApps = applications.filter(
    (app) => QA_AWAITING_STATUSES.includes(app.status) && !qaDecisions[app.id]
  );

  const matchesOverviewFilters = (app: Application) => {
    const isWoman = app.eligibilityCheck?.nationalIdCheck?.gender === 'Female';
    const provider = (app.motorcycleBrand || '').toLowerCase();
    const assembler = (app.retrofitAssembler || '').toLowerCase();
    const registration = (app.registrationNumber || app.ticketNumber || '').toLowerCase();
    const name = (app.applicantName || app.companyName || '').toLowerCase();
    const q = query.toLowerCase();
    const submittedAt = new Date(app.createdAt).getTime();
    const from = filterDateFrom ? new Date(filterDateFrom).getTime() : 0;
    const to = filterDateTo ? new Date(filterDateTo).getTime() + 86400000 - 1 : Number.MAX_SAFE_INTEGER;

    if (q && !name.includes(q) && !registration.includes(q) && !app.id.toLowerCase().includes(q)) return false;
    if (filterStatus !== 'all' && !STATUS_GROUPS[filterStatus]?.includes(app.status)) return false;
    if (filterStatus === 'awaiting-qa' && qaDecisions[app.id]) return false;
    if (filterStatus === 'in-process' && qaDecisions[app.id]) return false;
    if (submittedAt < from || submittedAt > to) return false;
    if (!matchesGenderFilter(isWoman, filterGender)) return false;
    if (!matchesVehicleTypeFilter(Boolean(app.isRetrofit), filterVehicleType)) return false;
    if (filterFinancier !== 'all' && app.companyName !== filterFinancier) return false;
    if (filterProvider !== 'all' && provider !== filterProvider.toLowerCase()) return false;
    if (filterRetrofitAssembler !== 'all' && assembler !== filterRetrofitAssembler.toLowerCase()) return false;
    return true;
  };

  const sortApplications = (apps: Application[]) =>
    [...apps].sort((a, b) => {
      if (sortBy === 'amount-high' || sortBy === 'amount') {
        return parseFloat(b.rebateAmount) - parseFloat(a.rebateAmount);
      }
      // date-oldest (default) — AF submission oldest first
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const overviewApps = sortApplications(applications.filter(matchesOverviewFilters));
  const reviewQueueApps = sortApplications(
    applications.filter(
      (app) => QA_AWAITING_STATUSES.includes(app.status) && matchesOverviewFilters(app)
    )
  );

  const providers = Array.from(new Set(applications.map((a) => a.motorcycleBrand).filter(Boolean))) as string[];
  const financiers = Array.from(new Set(applications.map((a) => a.companyName)));
  const retrofitAssemblers = Array.from(
    new Set(applications.map((a) => a.retrofitAssembler).filter(Boolean))
  ) as string[];

  const formatShortDate = (dateString?: string) => {
    if (!dateString) return '—';
    return formatDisplayDate(dateString);
  };

  const getRebateAmount = (app: Application) =>
    formatNumber(parseFloat(app.rebateAmount || '0') || 0);

  const getRebatePercentForApp = (app: Application) => {
    const isWoman = app.eligibilityCheck?.nationalIdCheck?.gender === 'Female';
    const isRetrofit = Boolean(app.isRetrofit);
    return getRebatePercent({ isWoman, isRetrofit });
  };

  const qaReviewReportColumns: ReportColumn[] = [
    { header: 'Ticket No.', key: 'ticket' },
    { header: 'Date of AF Submission', key: 'afSubmittedAt' },
    { header: 'Date of Rebate Team Verification', key: 'verifiedAt' },
    { header: 'Name', key: 'name' },
    { header: 'Gender', key: 'gender' },
    { header: 'Retrofit', key: 'retrofit' },
    { header: 'Asset Financier', key: 'af' },
    { header: 'E-Moto Provider', key: 'provider' },
    { header: 'E-Moto Retail Cost (RWF)', key: 'retailCost' },
    { header: 'Rebate Amount (RWF)', key: 'rebateAmount' },
    { header: 'Rebate Percentage (%)', key: 'rebatePercent' },
    { header: 'QA Team Approval', key: 'qaApproval' },
    { header: 'Issues for follow-up', key: 'issues' },
  ];

  const buildQaReviewReportRows = () =>
    reviewQueueApps.map((app) => {
      const decision = qaDecisions[app.id];
      return {
        ticket:
          app.ticketNumber || app.registrationNumber || app.id.replace('application:', '').toUpperCase(),
        afSubmittedAt: formatShortDate(app.createdAt),
        verifiedAt: formatShortDate(app.verifiedAt || app.lastReviewedAt),
        name: app.applicantName || app.companyName || '',
        gender: app.eligibilityCheck?.nationalIdCheck?.gender === 'Female' ? 'Woman' : 'Man',
        retrofit: app.isRetrofit ? 'Yes' : 'No',
        af: app.companyName || '',
        provider: app.motorcycleBrand || '',
        retailCost: parseFloat(app.purchasePrice || '0') || 0,
        rebateAmount: parseFloat(app.rebateAmount || '0') || 0,
        rebatePercent: getRebatePercentForApp(app),
        qaApproval: decision ? (decision.decision === 'approve' ? 'Approved' : 'Rejected') : 'Pending Review',
        issues: decision?.reason || '',
      };
    });

  const handleDownloadExcel = () => {
    if (reviewQueueApps.length === 0) {
      toast.error('No rebates to include in the report.');
      return;
    }
    exportReportToExcel({
      filename: 'qa-review-queue-report',
      title: `Rebates Awaiting QA Team Review${activeMetricLabel ? ` — ${activeMetricLabel}` : ''}`,
      columns: qaReviewReportColumns,
      rows: buildQaReviewReportRows(),
    });
    toast.success('Excel report downloaded');
  };

  const handleDownloadPdf = () => {
    if (reviewQueueApps.length === 0) {
      toast.error('No rebates to include in the report.');
      return;
    }
    exportReportToPdf({
      filename: 'qa-review-queue-report',
      title: `Rebates Awaiting QA Team Review${activeMetricLabel ? ` — ${activeMetricLabel}` : ''}`,
      columns: qaReviewReportColumns,
      rows: buildQaReviewReportRows(),
    });
    toast.success('PDF report downloaded');
  };

  const verifiedForQaCount = awaitingQaApps.length;
  const verifiedForQaAmount = awaitingQaApps.reduce(
    (sum, app) => sum + (parseFloat(app.rebateAmount || '0') || 0),
    0
  );
  const awaitingWomenCount = awaitingQaApps.filter(
    (app) => app.eligibilityCheck?.nationalIdCheck?.gender === 'Female'
  ).length;
  const awaitingRetrofitCount = awaitingQaApps.filter((app) => app.isRetrofit).length;
  const noEmotoPossessionCount = applications.filter((app) =>
    NO_POSSESSION_STATUSES.includes(app.status)
  ).length;

  const pendingReview = reviewQueueApps.filter((app) => !qaDecisions[app.id]);
  const pendingDecisionSubmit = Object.values(qaDecisions).filter((d) => !d.submitted).length;

  type QaMetricPreset =
    | 'awaiting-qa'
    | 'awaiting-amount'
    | 'awaiting-women'
    | 'awaiting-retrofit'
    | 'awaiting-no-possession';

  const openMetricReport = (preset: QaMetricPreset) => {
    setQuery('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterFinancier('all');
    setFilterProvider('all');
    setFilterRetrofitAssembler('all');
    setFilterGender('all');
    setFilterVehicleType('all');
    setSortBy(QA_DEFAULT_FILTER_VALUES.sortBy);
    setFilterStatus('in-process');

    if (preset === 'awaiting-women') setFilterGender('woman');
    if (preset === 'awaiting-retrofit') setFilterVehicleType('retrofit');
    if (preset === 'awaiting-no-possession') setFilterStatus('no-possession');

    onNavigate?.('dashboard');
    requestAnimationFrame(() => {
      document.getElementById('qa-dashboard-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const QA_METRIC_CARDS: { preset: QaMetricPreset; value: string | number; label: string }[] = [
    {
      preset: 'awaiting-qa',
      value: verifiedForQaCount,
      label: 'Rebates Verified for QA Review',
    },
    {
      preset: 'awaiting-amount',
      value: Math.round(verifiedForQaAmount).toLocaleString(),
      label: 'Amount of Rebates Verified for QA Review (RWF)',
    },
    {
      preset: 'awaiting-women',
      value: awaitingWomenCount,
      label: 'Of which women',
    },
    {
      preset: 'awaiting-retrofit',
      value: awaitingRetrofitCount,
      label: 'Of which retrofits',
    },
    {
      preset: 'awaiting-no-possession',
      value: noEmotoPossessionCount,
      label: 'Of which no e-moto yet in possession',
    },
  ];

  const activeMetricLabel = (() => {
    if (filterStatus === 'no-possession') return 'No E-Moto Possession Yet';
    if (filterGender === 'woman') return 'Woman';
    if (filterVehicleType === 'retrofit') return 'Retrofits';
    return null;
  })();

  const handleSubmitDecisions = () => {
    if (pendingDecisionSubmit === 0) {
      toast.info('No QA decisions captured yet.');
      return;
    }
    setQaDecisions((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (!next[key].submitted) next[key] = { ...next[key], submitted: true };
      });
      return next;
    });
    toast.success(`Submitted ${pendingDecisionSubmit} QA decision(s) to next stage weekly batch.`);
  };

  if (currentPage === 'review-queue') {
    return <QATeamDecisionPage user={user} />;
  }

  // Show reassignment pipeline for Rebate Manager
  if (currentPage === 'reassignment') {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <PageHeader />
        <RebateReassignmentPipeline />
      </div>
    );
  }

  if (currentPage === 'qa-cfo-request') {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <PageHeader />
        <WeeklyDisbursementReport mode="cfo-authorization" />
      </div>
    );
  }

  // Show possession analysis for Rebate Manager (RGF view)
  if (currentPage === 'possession-analysis') {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <PageHeader />
        <PossessionAnalysisView
          currentUserName={user.name}
          autoOpenTicket={autoOpenPossessionTicket}
          onAutoOpenHandled={() => setAutoOpenPossessionTicket(null)}
        />
      </div>
    );
  }

  // Show lease review view if currentPage is 'lease-review'
  if (currentPage === 'lease-review') {
    return <LeaseReviewView user={user} />;
  }

  if (currentPage === 'notifications') {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <PageHeader />
        <NotificationsView
          user={user}
          onAction={(data: any) => {
            if (data?.type === 'open-possession-review') {
              setAutoOpenPossessionTicket(data.ticketNumber);
              onNavigate?.('possession-analysis');
            }
          }}
        />
      </div>
    );
  }

  if (selectedApp) {
    return (
      <QAReview
        application={selectedApp as any}
        user={user}
        onDecisionCaptured={({ applicationId, decision, reason, timestamp }) => {
          setQaDecisions((prev) => ({
            ...prev,
            [applicationId]: { decision, reason, timestamp, submitted: false },
          }));
        }}
        onBack={handleReviewComplete}
      />
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <p>Loading applications...</p>
      </div>
    );
  }

  const isDashboardHome = currentPage === 'dashboard';
  const isAllRebatesPage = currentPage === 'applications';
  const tableApps = isAllRebatesPage ? overviewApps : reviewQueueApps;
  const showQaColumns = !isAllRebatesPage;

  const renderOverviewFilters = () => (
    <QaStandardFilters
      values={{
        query,
        status: filterStatus,
        dateFrom: filterDateFrom,
        dateTo: filterDateTo,
        gender: filterGender,
        vehicleType: filterVehicleType,
        assetFinancier: filterFinancier,
        eMotoProvider: filterProvider,
        retrofitAssembler: filterRetrofitAssembler,
        sortBy,
      }}
      onChange={(patch) => {
        if (patch.query !== undefined) setQuery(patch.query);
        if (patch.status !== undefined) setFilterStatus(patch.status);
        if (patch.dateFrom !== undefined) setFilterDateFrom(patch.dateFrom);
        if (patch.dateTo !== undefined) setFilterDateTo(patch.dateTo);
        if (patch.gender !== undefined) setFilterGender(patch.gender);
        if (patch.vehicleType !== undefined) setFilterVehicleType(patch.vehicleType);
        if (patch.assetFinancier !== undefined) setFilterFinancier(patch.assetFinancier);
        if (patch.eMotoProvider !== undefined) setFilterProvider(patch.eMotoProvider);
        if (patch.retrofitAssembler !== undefined) setFilterRetrofitAssembler(patch.retrofitAssembler);
        if (patch.sortBy !== undefined) setSortBy(patch.sortBy);
      }}
      financiers={financiers}
      providers={providers}
      assemblers={retrofitAssemblers}
      showingCount={tableApps.length}
      totalCount={isAllRebatesPage ? applications.length : awaitingQaApps.length}
      showingLabel={
        isAllRebatesPage ? 'rebates submitted to RGF' : 'rebates awaiting QA Team review'
      }
    />
  );

  const renderOverviewTable = (rows: Application[], showQaColumns: boolean) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-[#023F40]">
          {showQaColumns
            ? `Rebates Awaiting QA Team Review${activeMetricLabel ? ` — ${activeMetricLabel}` : ''}`
            : 'Overview Rebates Submitted to RGF to date'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-600">No rebates match the current filters.</div>
        ) : (
          <div className="w-full max-w-full overflow-x-auto">
            <table className={`w-full text-sm ${showQaColumns ? 'min-w-[1400px]' : 'min-w-[1050px]'}`}>
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="pb-3 pr-3 font-medium">Ticket No.</th>
                  {showQaColumns && (
                    <>
                      <th className="pb-3 pr-3 font-medium">Date of AF Submission</th>
                      <th className="pb-3 pr-3 font-medium">Date of Rebate Team Verification</th>
                    </>
                  )}
                  <th className="pb-3 pr-3 font-medium">Name</th>
                  <th className="pb-3 pr-3 font-medium">Gender</th>
                  <th className="pb-3 pr-3 font-medium">Retrofit</th>
                  <th className="pb-3 pr-3 font-medium">Asset Financier</th>
                  <th className="pb-3 pr-3 font-medium">E-Moto Provider</th>
                  <th className="pb-3 pr-3 font-medium">E-Moto Retail Cost (RWF)</th>
                  <th className="pb-3 pr-3 font-medium">Rebate Amount (RWF)</th>
                  <th className="pb-3 pr-3 font-medium">Rebate Percentage (%)</th>
                  {showQaColumns && (
                    <>
                      <th className="pb-3 pr-3 font-medium">QA Team Approval</th>
                      <th className="pb-3 font-medium">Issues for follow-up</th>
                    </>
                  )}
                  {!showQaColumns && <th className="pb-3 font-medium">Status</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((app) => {
                  const decision = qaDecisions[app.id];
                  const ticket =
                    app.ticketNumber ||
                    app.registrationNumber ||
                    app.id.replace('application:', '').toUpperCase();
                  return (
                    <tr
                      key={app.id}
                      className={`border-b hover:bg-gray-50 ${showQaColumns ? 'cursor-pointer' : ''}`}
                      onClick={showQaColumns ? () => setSelectedApp(app) : undefined}
                    >
                      <td className="py-3 pr-3 font-semibold text-blue-700 hover:underline">{ticket}</td>
                      {showQaColumns && (
                        <>
                          <td className="py-3 pr-3">{formatShortDate(app.createdAt)}</td>
                          <td className="py-3 pr-3">
                            {formatShortDate(app.verifiedAt || app.lastReviewedAt)}
                          </td>
                        </>
                      )}
                      <td className="py-3 pr-3">{app.applicantName || app.companyName}</td>
                      <td className="py-3 pr-3">
                        {app.eligibilityCheck?.nationalIdCheck?.gender === 'Female' ? 'Woman' : 'Man'}
                      </td>
                      <td className="py-3 pr-3">{app.isRetrofit ? 'Yes' : 'No'}</td>
                      <td className="py-3 pr-3">{app.companyName}</td>
                      <td className="py-3 pr-3">{app.motorcycleBrand || 'N/A'}</td>
                      <td className="py-3 pr-3">{formatNumber(parseFloat(app.purchasePrice || '0'))}</td>
                      <td className="py-3 pr-3">{getRebateAmount(app)}</td>
                      <td className="py-3 pr-3">{getRebatePercentForApp(app)}</td>
                      {showQaColumns && (
                        <>
                          <td className="py-3 pr-3">
                            {decision ? (
                              <div className="space-y-1">
                                <Badge
                                  className={
                                    decision.decision === 'approve'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }
                                >
                                  {decision.decision === 'approve' ? 'Approved' : 'Rejected'}
                                </Badge>
                                <p className="text-xs text-gray-500">
                                  {new Date(decision.timestamp).toLocaleString()}
                                </p>
                              </div>
                            ) : (
                              <Badge variant="outline">Pending Review</Badge>
                            )}
                          </td>
                          <td className="py-3 text-sm text-gray-600">{decision?.reason || '—'}</td>
                        </>
                      )}
                      {!showQaColumns && (
                        <td className="py-3">
                          <Badge variant="outline">{app.status.replace(/-/g, ' ')}</Badge>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {showQaColumns && (
          <p className="text-xs text-gray-500 mt-3">
            Click a row to open the detail page. Approve or reject from the QA Team Review page.
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8">
      <PageHeader />
      <Greeting name={user.name || 'QA Team Member'} />
      <h1 className="text-lg sm:text-xl text-[#023F40] mt-6">
        {isDashboardHome
          ? 'Quality Assurance Team Dashboard'
          : isAllRebatesPage
            ? 'All Rebates Submitted to RGF'
            : 'Rebate Quality Assurance Team Review'}
      </h1>
      <p className="text-sm text-gray-600 mt-1">
        {isDashboardHome
          ? 'The QA Team approves rebates verified by the Rebate Team before they are presented to the CFO for disbursement. The default report below lists rebates awaiting QA Team review.'
          : isAllRebatesPage
            ? 'Overview of all rebates submitted to Rwanda Green Fund to date.'
            : 'This page is for the QA Team to approve rebates verified by the Rebate Team during scheduled review meetings, before presentation to the CFO for disbursement authorization.'}
      </p>

      {isDashboardHome && (
        <>
          <h2 className="text-base font-semibold text-[#023F40] mt-8">Rebates awaiting QA Team Review</h2>
          <p className="text-sm text-gray-700 mt-2 font-medium">
            To access rebate details, please click on the below status categories.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {QA_METRIC_CARDS.map((card, index) => (
              <motion.button
                key={card.preset}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                onClick={() => openMetricReport(card.preset)}
                className="bg-gradient-to-br from-[#023F40] to-[#035f60] p-4 rounded-xl shadow-md text-white text-left hover:from-[#035f60] hover:to-[#047a7c] transition-colors min-h-[7.5rem]"
              >
                <p className="text-3xl font-bold mb-1 break-words">{card.value}</p>
                <p className="text-white/85 text-xs leading-snug">{card.label}</p>
              </motion.button>
            ))}
          </div>
        </>
      )}

      {isAllRebatesPage ? (
        <>
          <h2 className="text-base font-semibold text-[#023F40] mt-8">
            Overview Rebates Submitted to RGF to date
          </h2>
          {renderOverviewFilters()}
          {renderOverviewTable(overviewApps, false)}
        </>
      ) : (
        <div id="qa-dashboard-table">
          {renderOverviewFilters()}
          <div className="mb-4 flex w-full flex-wrap justify-end gap-2">
            <Button onClick={handleSubmitDecisions} className="bg-[#023F40] hover:bg-[#035f60]">
              Submit Decisions
            </Button>
          </div>
          {renderOverviewTable(reviewQueueApps, true)}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              {pendingReview.length} rebate(s) awaiting QA decision. Sorted by AF submission date (oldest first).
            </p>
            <Button variant="outline" onClick={handleDownloadPdf}>
              <FileText className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button
              onClick={handleDownloadExcel}
              className="bg-[#6DB27F] hover:bg-[#5da170] text-white"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Download Excel
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}