import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Filter, Printer } from 'lucide-react';
import { User } from '../../utils/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
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

export function QADashboard({ user, currentPage }: QADashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [sortBy, setSortBy] = useState<string>('date');
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterWomen, setFilterWomen] = useState('all');
  const [filterFinancier, setFilterFinancier] = useState('all');
  const [filterProvider, setFilterProvider] = useState('all');
  const [filterRetrofitAssembler, setFilterRetrofitAssembler] = useState('all');
  const [qaDecisions, setQaDecisions] = useState<Record<string, QaDecision>>({});
  const [rejectDialogApp, setRejectDialogApp] = useState<Application | null>(null);
  const [rejectComment, setRejectComment] = useState('');

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

  const QA_AWAITING_STATUSES = ['manager-review', 'qa-review', 'program-manager-review'];
  const STATUS_GROUPS: Record<string, string[]> = {
    submitted: ['assigned', 'under-review', 'manager-review', 'qa-review', 'program-manager-review'],
    approved: ['approved', 'approved-pending-lease', 'disbursed', 'payment-processed', 'lease-review'],
    rejected: ['rejected'],
  };
  const NO_POSSESSION_STATUSES = ['approved-pending-lease', 'payment-processed', 'approved'];

  const awaitingQaApps = applications.filter(
    (app) => QA_AWAITING_STATUSES.includes(app.status) && !qaDecisions[app.id]
  );

  const matchesOverviewFilters = (app: Application) => {
    const days = Math.floor(
      (Date.now() - new Date(app.lastReviewedAt || app.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const isWoman = app.eligibilityCheck?.nationalIdCheck?.gender === 'Female';
    const provider = (app.motorcycleBrand || '').toLowerCase();
    const assembler = (app.retrofitAssembler || '').toLowerCase();
    const registration = (app.registrationNumber || app.ticketNumber || '').toLowerCase();
    const name = (app.applicantName || app.companyName || '').toLowerCase();
    const q = query.toLowerCase();

    if (q && !name.includes(q) && !registration.includes(q) && !app.id.toLowerCase().includes(q)) return false;
    if (filterStatus !== 'all' && !STATUS_GROUPS[filterStatus]?.includes(app.status)) return false;
    if (filterDateRange === 'day' && days > 1) return false;
    if (filterDateRange === 'week' && days > 7) return false;
    if (filterDateRange === 'month' && days > 30) return false;
    if (filterDateRange === 'year' && days > 365) return false;
    if (filterWomen === 'yes' && !isWoman) return false;
    if (filterWomen === 'no' && isWoman) return false;
    if (filterFinancier !== 'all' && app.companyName !== filterFinancier) return false;
    if (filterProvider !== 'all' && provider !== filterProvider.toLowerCase()) return false;
    if (filterRetrofitAssembler !== 'all' && assembler !== filterRetrofitAssembler.toLowerCase()) return false;
    return true;
  };

  const sortApplications = (apps: Application[]) =>
    [...apps].sort((a, b) => {
      if (sortBy === 'date') {
        // Reverse chronological by AF submission date
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'amount') {
        return parseFloat(b.rebateAmount) - parseFloat(a.rebateAmount);
      }
      return 0;
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

  const captureDecision = (
    app: Application,
    decision: 'approve' | 'reject',
    reason: string
  ) => {
    setQaDecisions((prev) => ({
      ...prev,
      [app.id]: {
        decision,
        reason,
        timestamp: new Date().toISOString(),
        submitted: false,
      },
    }));
    toast.success(
      decision === 'approve'
        ? `Approved ${app.ticketNumber || app.registrationNumber}`
        : `Rejected ${app.ticketNumber || app.registrationNumber}`
    );
  };

  const handleApproveRow = (app: Application, e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    captureDecision(app, 'approve', '');
  };

  const handleOpenReject = (app: Application, e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setRejectDialogApp(app);
    setRejectComment('');
  };

  const handleConfirmReject = () => {
    if (!rejectDialogApp) return;
    if (!rejectComment.trim()) {
      toast.error('Comment is mandatory when rejecting a rebate.');
      return;
    }
    captureDecision(rejectDialogApp, 'reject', rejectComment.trim());
    setRejectDialogApp(null);
    setRejectComment('');
  };

  const handlePrintReport = () => {
    window.print();
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
        <PossessionAnalysisView />
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
        <NotificationsView user={user} />
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
  const tableApps = isDashboardHome ? overviewApps : reviewQueueApps;

  const renderOverviewFilters = () => (
    <Card className="mt-6 mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search ticket/applicant..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterDateRange} onValueChange={setFilterDateRange}>
            <SelectTrigger>
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All dates</SelectItem>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterWomen} onValueChange={setFilterWomen}>
            <SelectTrigger>
              <SelectValue placeholder="Women" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All applicants</SelectItem>
              <SelectItem value="yes">Women only</SelectItem>
              <SelectItem value="no">Non-women</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select value={filterFinancier} onValueChange={setFilterFinancier}>
            <SelectTrigger>
              <SelectValue placeholder="Asset Financier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Asset Financiers</SelectItem>
              {financiers.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterProvider} onValueChange={setFilterProvider}>
            <SelectTrigger>
              <SelectValue placeholder="E-Moto Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All E-Moto Providers</SelectItem>
              {providers.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterRetrofitAssembler} onValueChange={setFilterRetrofitAssembler}>
            <SelectTrigger>
              <SelectValue placeholder="Retrofit Assembler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Retrofit Assemblers</SelectItem>
              {retrofitAssemblers.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">AF submission date (newest first)</SelectItem>
              <SelectItem value="amount">Rebate amount (high to low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-gray-500">
          Showing {tableApps.length} of {applications.length} rebates submitted to RGF
        </p>
      </CardContent>
    </Card>
  );

  const renderOverviewTable = (rows: Application[], showQaColumns: boolean) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-[#023F40]">
          {showQaColumns
            ? 'Default Report: Rebates verified awaiting QA Team approval'
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
                  <th className="pb-3 pr-3 font-medium">Woman</th>
                  <th className="pb-3 pr-3 font-medium">Retrofit</th>
                  <th className="pb-3 pr-3 font-medium">Asset Financier</th>
                  <th className="pb-3 pr-3 font-medium">E-Moto Provider</th>
                  <th className="pb-3 pr-3 font-medium">E-Moto Retail Cost (RWF)</th>
                  <th className="pb-3 pr-3 font-medium">Rebate Amount (RWF)</th>
                  <th className="pb-3 pr-3 font-medium">Rebate Percentage (%)</th>
                  {showQaColumns && (
                    <>
                      <th className="pb-3 pr-3 font-medium">QA Team Approval</th>
                      <th className="pb-3 pr-3 font-medium">Issues for follow-up</th>
                      <th className="pb-3 font-medium">Actions</th>
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
                        {app.eligibilityCheck?.nationalIdCheck?.gender === 'Female' ? 'Yes' : 'No'}
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
                          <td className="py-3 pr-3 text-sm text-gray-600">{decision?.reason || '—'}</td>
                          <td className="py-3" onClick={(e) => e.stopPropagation()}>
                            {decision ? (
                              <span className="text-xs text-gray-400">Done</span>
                            ) : (
                              <div className="flex gap-2 whitespace-nowrap">
                                <Button
                                  size="sm"
                                  className="h-7 bg-[#6DB27F] hover:bg-[#5da170]"
                                  onClick={(e) => handleApproveRow(app, e)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7"
                                  onClick={(e) => handleOpenReject(app, e)}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </td>
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
            Click a row to open the detail page. Use Actions to approve or reject; rejection comments appear under Issues for follow-up.
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
        {isDashboardHome ? 'Quality Assurance Team Dashboard' : 'Rebate Quality Assurance Team Review'}
      </h1>
      <p className="text-sm text-gray-600 mt-1">
        {isDashboardHome
          ? 'The QA Team approves rebates verified by the Rebate Team before they are presented to the CFO for disbursement. The top section tracks rebates awaiting QA review; the overview section covers all rebates submitted to RGF to date.'
          : 'This page is for the QA Team to approve rebates verified by the Rebate Team during scheduled review meetings, before presentation to the CFO for disbursement authorization.'}
      </p>

      <h2 className="text-base font-semibold text-[#023F40] mt-8">Rebates awaiting QA Team Review</h2>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Rebates Verified for QA Review</p>
            <p className="text-2xl font-bold text-[#023F40]">{verifiedForQaCount}</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Amount of Rebates Verified for QA Review (RWF)</p>
            <p className="text-2xl font-bold text-[#023F40]">
              {Math.round(verifiedForQaAmount).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Of which women</p>
            <p className="text-2xl font-bold text-[#023F40]">{awaitingWomenCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Of which retrofits</p>
            <p className="text-2xl font-bold text-[#023F40]">{awaitingRetrofitCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Of which no e-moto yet in possession</p>
            <p className="text-2xl font-bold text-[#023F40]">{noEmotoPossessionCount}</p>
          </CardContent>
        </Card>
      </div>

      {isDashboardHome ? (
        <>
          <h2 className="text-base font-semibold text-[#023F40] mt-8">
            Overview Rebates Submitted to RGF to date
          </h2>
          {renderOverviewFilters()}
          {renderOverviewTable(overviewApps, false)}
        </>
      ) : (
        <>
          {renderOverviewFilters()}
          <div className="mb-4 flex w-full flex-wrap justify-end gap-2">
            <Button onClick={handleSubmitDecisions} className="bg-[#023F40] hover:bg-[#035f60]">
              Submit Decisions
            </Button>
          </div>
          {renderOverviewTable(reviewQueueApps, true)}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              {pendingReview.length} rebate(s) awaiting QA decision. Sorted by AF submission date (newest first).
            </p>
            <Button
              onClick={handlePrintReport}
              className="bg-[#6DB27F] hover:bg-[#5da170] text-white"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Report
            </Button>
          </div>
        </>
      )}

      <Dialog
        open={!!rejectDialogApp}
        onOpenChange={(open) => {
          if (!open) {
            setRejectDialogApp(null);
            setRejectComment('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject rebate</DialogTitle>
            <DialogDescription>
              A comment is mandatory when rejecting. This will appear under Issues for follow-up.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="qa-reject-comment">Comment *</Label>
            <Textarea
              id="qa-reject-comment"
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Explain why this rebate is rejected..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogApp(null);
                setRejectComment('');
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmReject}>
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}