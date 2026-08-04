import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { ClipboardList, Filter, Printer, X } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../../utils/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { ApplicationReviewEnhanced } from './ApplicationReviewEnhanced';
import { Greeting } from '../ui/Greeting';
import { PageHeader } from '../PageHeader';
import { NotificationsView } from '../NotificationsView';
import {
  analystDaysAfterReceipt,
  enrichAnalystApplication,
  withDemoPipelineFallback,
} from '../../utils/demoPipelineData';
import {
  ANALYST_DASHBOARD_STATS,
  ANALYST_METRIC_LABELS,
  AnalystMetricCategory,
} from '../../utils/analystRebateData';
// import { ReassignmentCheckingPage } from './ReassignmentCheckingPage';
import { AnalystReportsView } from './AnalystReportsView';
import { formatDisplayDate } from '../../utils/dateFormat';
import {
  ALL_ASSET_FINANCIERS_LABEL,
  ALL_STATUSES_LABEL,
  DATE_RANGE_FILTER_OPTIONS,
  FILTER_LABELS,
  GENDER_FILTER_OPTIONS,
  matchesGenderFilter,
  matchesVehicleTypeFilter,
  VEHICLE_TYPE_FILTER_OPTIONS,
} from '../../utils/filterLabels';

interface Application {
  id: string;
  companyName: string;
  applicantName?: string;
  registrationNumber?: string;
  ticketNumber?: string;
  rebateAmount: string;
  status: string;
  createdAt: string;
  assignedAt?: string;
  assignedTo?: string;
  isRetrofit?: boolean;
  motorcycleBrand?: string;
  motorcycleModel?: string;
  eligibilityCheck?: {
    nationalIdCheck?: { gender?: string; dateOfBirth?: string };
  };
  demoDaysAfterReceipt?: number;
  submittedBy?: string;
  submittedByEmail?: string;
  submittedByPhone?: string;
  phoneNumber?: string;
  email?: string;
}

interface AnalystDashboardProps {
  user: User;
  currentPage: string;
  onNavigate?: (page: string) => void;
}

interface RecommendationRecord {
  decision: 'approve' | 'reject';
  notes: string;
  rejectionReason?: string;
  timestamp: string;
  submitted: boolean;
}

const DASHBOARD_CARDS: {
  category: Exclude<AnalystMetricCategory, 'all'>;
  value: number;
}[] = [
  { category: 'not-yet-verified', value: ANALYST_DASHBOARD_STATS.notYetVerified },
  { category: 'over-two-days', value: ANALYST_DASHBOARD_STATS.overTwoDays },
  { category: 'verified-not-qa', value: ANALYST_DASHBOARD_STATS.verifiedNotPresentedQA },
  { category: 'approved-no-emoto', value: ANALYST_DASHBOARD_STATS.approvedNoEmotoConfirmation },
];

export function AnalystDashboard({ user, currentPage, onNavigate }: AnalystDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [sortBy, setSortBy] = useState<string>('date-oldest');
  const [filterStatus, setFilterStatus] = useState<string>('not-yet-verified');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterVehicleType, setFilterVehicleType] = useState<string>('all');
  const [filterFinancier, setFilterFinancier] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [recommendations, setRecommendations] = useState<Record<string, RecommendationRecord>>({});
  const [reportCategory, setReportCategory] = useState<AnalystMetricCategory>('not-yet-verified');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await api.getAllApplications();
      const myApps = withDemoPipelineFallback(
        data.filter((app: Application) => app.assignedTo === user.id || app.assignedTo === 'demo-analyst'),
        true
      );
      setApplications((myApps as Application[]).map(enrichAnalystApplication));
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

  const isWomanApplicant = (app: Application) =>
    app.eligibilityCheck?.nationalIdCheck?.gender === 'Female';

  const daysSinceReceipt = (app: Application) => analystDaysAfterReceipt(app);

  const toTicketNumber = (app: Application) =>
    app.ticketNumber || app.registrationNumber || app.id.replace('application:', '').slice(0, 8).toUpperCase();

  const toVehicleLabel = (app: Application) => (app.isRetrofit ? 'Retrofit' : 'New E-Moto');

  const toGenderLabel = (app: Application) => (isWomanApplicant(app) ? 'W' : 'M');

  const toPipelineStatusLabel = (app: Application) => {
    if (app.status === 'under-review') return 'Review in process';
    if (app.status === 'assigned' && daysSinceReceipt(app) > 2) return 'Over 2 days since received';
    if (app.status === 'assigned') return 'Not opened';
    return app.status.replace(/-/g, ' ');
  };

  const toStatusBadgeClass = (app: Application) => {
    if (app.status === 'under-review') return 'bg-blue-100 text-blue-900';
    if (app.status === 'assigned' && daysSinceReceipt(app) > 2) return 'bg-yellow-200 text-yellow-900';
    if (app.status === 'assigned') return 'bg-orange-100 text-orange-900';
    return 'bg-gray-100 text-gray-800';
  };

  const financiers = Array.from(new Set(applications.map((a) => a.companyName))).sort();

  let filteredApps = applications.filter((app) => {
    if (filterFinancier !== 'all' && app.companyName !== filterFinancier) return false;
    if (!matchesGenderFilter(isWomanApplicant(app), filterGender)) return false;
    if (!matchesVehicleTypeFilter(Boolean(app.isRetrofit), filterVehicleType)) return false;
    const days = daysSinceReceipt(app);
    if (filterDateRange === 'day' && days > 1) return false;
    if (filterDateRange === 'week' && days > 7) return false;
    if (filterDateRange === 'month' && days > 30) return false;
    if (filterDateRange === 'year' && days > 365) return false;
    const isNotYetVerified = ['assigned', 'under-review'].includes(app.status);
    if (filterStatus === 'not-yet-verified' && !isNotYetVerified) return false;
    if (filterStatus === 'over-two-days' && !(isNotYetVerified && days > 2)) return false;
    if (
      filterStatus === 'verified-not-qa' &&
      !['qa-review', 'manager-review', 'recommended'].includes(app.status)
    ) {
      return false;
    }
    if (
      filterStatus === 'approved-no-emoto' &&
      !['approved-pending-lease', 'approved-lacking-possession', 'approved'].includes(app.status)
    ) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const name = (app.applicantName || app.companyName).toLowerCase();
      const registration = (app.registrationNumber || '').toLowerCase();
      const ticket = toTicketNumber(app).toLowerCase();
      if (!name.includes(q) && !registration.includes(q) && !ticket.includes(q) && !app.id.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const sortedApps = [...filteredApps].sort((a, b) => {
    if (sortBy === 'date-oldest') {
      return new Date(a.assignedAt || a.createdAt).getTime() - new Date(b.assignedAt || b.createdAt).getTime();
    }
    if (sortBy === 'date-newest') {
      return new Date(b.assignedAt || b.createdAt).getTime() - new Date(a.assignedAt || a.createdAt).getTime();
    }
    if (sortBy === 'amount-high') {
      return parseFloat(b.rebateAmount) - parseFloat(a.rebateAmount);
    }
    if (sortBy === 'amount-low') {
      return parseFloat(a.rebateAmount) - parseFloat(b.rebateAmount);
    }
    if (sortBy === 'days-high') {
      return daysSinceReceipt(b) - daysSinceReceipt(a);
    }
    if (sortBy === 'days-low') {
      return daysSinceReceipt(a) - daysSinceReceipt(b);
    }
    return 0;
  });

  const pendingRecommendations = Object.values(recommendations).filter((r) => !r.submitted).length;

  const handleSubmitRecommendations = () => {
    if (pendingRecommendations === 0) {
      toast.info('No pending recommendations to submit.');
      return;
    }
    setRecommendations((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (!next[key].submitted) {
          next[key] = { ...next[key], submitted: true };
        }
      }
      return next;
    });
    toast.success(`Submitted ${pendingRecommendations} recommendation(s) for weekly QA review.`);
  };

  const scrollToPipelineTable = () => {
    requestAnimationFrame(() => {
      document.getElementById('analyst-pipeline-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const openMetricReport = (category: Exclude<AnalystMetricCategory, 'all'>) => {
    setFilterStatus(category);
    scrollToPipelineTable();
  };

  const openApplication = (app: Application) => setSelectedApp(enrichAnalystApplication(app));

  if (selectedApp) {
    if (!selectedApp?.id) {
      toast.error('Unable to open application details for this record.');
      setSelectedApp(null);
      return null;
    }
    return (
      <ApplicationReviewEnhanced
        application={selectedApp as any}
        user={user}
        onRecommendationSaved={({ applicationId, decision, notes, rejectionReason, timestamp }) => {
          setRecommendations((prev) => ({
            ...prev,
            [applicationId]: {
              decision,
              notes,
              rejectionReason,
              timestamp,
              submitted: false,
            },
          }));
        }}
        onBack={handleReviewComplete}
      />
    );
  }

  if (currentPage === 'notifications') {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <PageHeader />
        <NotificationsView user={user} />
      </div>
    );
  }

  if (currentPage === 'reassignment-checking') {
    // Sidebar entry commented out — keep route unreachable for now.
    // return (
    //   <div className="container mx-auto p-4 sm:p-6 lg:p-8">
    //     <PageHeader />
    //     <Greeting name={user.name || 'Analyst'} />
    //     <div className="mt-6">
    //       <ReassignmentCheckingPage
    //         applications={sortedApps}
    //         onOpenApplication={openApplication}
    //       />
    //     </div>
    //   </div>
    // );
  }

  if (currentPage === 'analyst-reports') {
    return (
      <div className="w-full min-w-0 max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <PageHeader />
        <Greeting name={user.name || 'Analyst'} />
        <div className="mt-6 w-full min-w-0 max-w-full">
          <AnalystReportsView user={user} initialCategory={reportCategory} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <p>Loading applications...</p>
      </div>
    );
  }

  const pipelineReportLabel =
    filterStatus !== 'all' && filterStatus in ANALYST_METRIC_LABELS
      ? ANALYST_METRIC_LABELS[filterStatus as AnalystMetricCategory]
      : 'All statuses';
  const pipelineRows = sortedApps;
  const tableRows = pipelineRows;
  const isDashboardHome = currentPage === 'dashboard';

  const isFiltered =
    search !== '' ||
    sortBy !== 'date-oldest' ||
    filterStatus !== 'all' ||
    filterDateRange !== 'all' ||
    filterGender !== 'all' ||
    filterVehicleType !== 'all' ||
    filterFinancier !== 'all';

  const clearFilters = () => {
    setSearch('');
    setSortBy('date-oldest');
    setFilterStatus('all');
    setFilterDateRange('all');
    setFilterGender('all');
    setFilterVehicleType('all');
    setFilterFinancier('all');
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader />
      <Greeting name={user.name || 'Analyst'} />

      {isDashboardHome ? (
        <>
          <div>
            <h1 className="text-lg sm:text-xl text-[#023F40] mt-2">Rebate Team Dashboard</h1>
            <p className="text-sm text-gray-600 mt-2 max-w-4xl">
              The Rebate Team is accountable for verifying rebate submissions against supporting documentation,
              communicating with Asset Financiers when clarification is needed, and recommending verified rebates
              to the QA Team for approval before CFO review.
            </p>
            <p className="text-sm text-gray-700 mt-3 font-medium">
              To access rebate details, please click on the below status categories.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
            {DASHBOARD_CARDS.map((card, index) => (
              <motion.button
                key={card.category}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                onClick={() => openMetricReport(card.category)}
                className="bg-gradient-to-br from-[#023F40] to-[#035f60] p-4 rounded-xl shadow-md text-white text-left hover:from-[#035f60] hover:to-[#047a7c] transition-colors"
              >
                <p className="text-3xl font-bold mb-1">{card.value}</p>
                <p className="text-white/85 text-xs leading-snug">{ANALYST_METRIC_LABELS[card.category]}</p>
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h1 className="text-lg sm:text-xl text-[#023F40] mt-6">Review Pipeline</h1>
          <p className="text-sm text-gray-600 mt-1">
            Check AF documentation, record eligibility results, and recommend to Rebate Team (no final decisions).
          </p>
        </>
      )}

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          className="border-[#023F40] text-[#023F40]"
          onClick={() => {
            setReportCategory('not-yet-verified');
            onNavigate?.('analyst-reports');
          }}
        >
          <Printer className="w-4 h-4 mr-2" />
          Create and Print Reports
        </Button>
        <Button onClick={handleSubmitRecommendations} className="bg-[#023F40] hover:bg-[#035f60]">
          Submit Recommendations
        </Button>
      </div>

      <div id="analyst-pipeline-table">
      <Card className="mt-8 mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters &amp; Sort
            </CardTitle>
            {isFiltered && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-gray-600 hover:text-gray-900"
                onClick={clearFilters}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
          <CardDescription>
            Narrow results by {FILTER_LABELS.status.toLowerCase()}, {FILTER_LABELS.dateRange.toLowerCase()},{' '}
            {FILTER_LABELS.gender.toLowerCase()}, {FILTER_LABELS.vehicleType.toLowerCase()}, and{' '}
            {FILTER_LABELS.assetFinancier.toLowerCase()}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              placeholder="Search applicant, ticket, or registration..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-oldest">Date received (oldest first)</SelectItem>
                <SelectItem value="date-newest">Date received (newest first)</SelectItem>
                <SelectItem value="days-high">Days since receipt (high to low)</SelectItem>
                <SelectItem value="days-low">Days since receipt (low to high)</SelectItem>
                <SelectItem value="amount-high">Rebate amount (high to low)</SelectItem>
                <SelectItem value="amount-low">Rebate amount (low to high)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder={FILTER_LABELS.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{ALL_STATUSES_LABEL}</SelectItem>
                <SelectItem value="not-yet-verified">
                  {ANALYST_METRIC_LABELS['not-yet-verified']}
                </SelectItem>
                <SelectItem value="over-two-days">{ANALYST_METRIC_LABELS['over-two-days']}</SelectItem>
                <SelectItem value="verified-not-qa">
                  {ANALYST_METRIC_LABELS['verified-not-qa']}
                </SelectItem>
                <SelectItem value="approved-no-emoto">
                  {ANALYST_METRIC_LABELS['approved-no-emoto']}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger>
                <SelectValue placeholder={FILTER_LABELS.dateRange} />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Select value={filterGender} onValueChange={setFilterGender}>
              <SelectTrigger>
                <SelectValue placeholder={FILTER_LABELS.gender} />
              </SelectTrigger>
              <SelectContent>
                {GENDER_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterVehicleType} onValueChange={setFilterVehicleType}>
              <SelectTrigger>
                <SelectValue placeholder={FILTER_LABELS.vehicleType} />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_TYPE_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterFinancier} onValueChange={setFilterFinancier}>
              <SelectTrigger>
                <SelectValue placeholder={FILTER_LABELS.assetFinancier} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{ALL_ASSET_FINANCIERS_LABEL}</SelectItem>
                {financiers.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-gray-500">
            Showing {tableRows.length} application{tableRows.length === 1 ? '' : 's'} in this view
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#023F40]">
            {pipelineReportLabel} ({tableRows.length})
          </CardTitle>
          <CardDescription>Click on the Ticket Number to verify the rebate submission.</CardDescription>
        </CardHeader>
        <CardContent>
          {tableRows.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-600">
              No applications match the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="pb-3 pr-3 font-medium">Ticket Number</th>
                    <th className="pb-3 pr-3 font-medium">Name</th>
                    <th className="pb-3 pr-3 font-medium">Date Received</th>
                    <th className="pb-3 pr-3 font-medium">Financier</th>
                    <th className="pb-3 pr-3 font-medium">Vehicle Type</th>
                    <th className="pb-3 pr-3 font-medium">Gender [M, W]</th>
                    <th className="pb-3 pr-3 font-medium">Days after Receipt</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((app) => (
                    <tr key={app.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          className="font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                          onClick={() => openApplication(app)}
                        >
                          {toTicketNumber(app)}
                        </button>
                      </td>
                      <td className="py-3 pr-3">{app.applicantName || app.companyName}</td>
                      <td className="py-3 pr-3">{formatDisplayDate(app.createdAt)}</td>
                      <td className="py-3 pr-3">{app.companyName}</td>
                      <td className="py-3 pr-3">{toVehicleLabel(app)}</td>
                      <td className="py-3 pr-3">{toGenderLabel(app)}</td>
                      <td className="py-3 pr-3">{daysSinceReceipt(app)}</td>
                      <td className="py-3">
                        <Badge className={toStatusBadgeClass(app)}>{toPipelineStatusLabel(app)}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {isDashboardHome && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <h2 className="mb-4 font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                setReportCategory('not-yet-verified');
                onNavigate?.('analyst-reports');
              }}
              className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#023F40] hover:bg-gray-50 text-left transition-all group"
            >
              <Printer className="w-4 h-4 text-[#023F40] flex-shrink-0" />
              <span className="font-medium text-gray-900 text-sm">Create and Print Reports</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('queue')}
              className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#023F40] hover:bg-gray-50 text-left transition-all group"
            >
              <ClipboardList className="w-4 h-4 text-[#023F40] flex-shrink-0" />
              <span className="font-medium text-gray-900 text-sm">Review Pipeline</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
