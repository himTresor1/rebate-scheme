import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Filter } from 'lucide-react';
import { User } from '../../utils/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { ApplicationReviewEnhanced } from './ApplicationReviewEnhanced';
import { Greeting } from '../ui/Greeting';
import { PageHeader } from '../PageHeader';
import { NotificationsView } from '../NotificationsView';
import {
  ANALYST_DASHBOARD_STATS,
  analystDaysAfterReceipt,
  enrichAnalystApplication,
  withDemoPipelineFallback,
} from '../../utils/demoPipelineData';
import { ReassignmentCheckingPage } from './ReassignmentCheckingPage';
import { formatDisplayDate } from '../../utils/dateFormat';

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
}

interface RecommendationRecord {
  decision: 'approve' | 'reject';
  notes: string;
  rejectionReason?: string;
  timestamp: string;
  submitted: boolean;
}

export function AnalystDashboard({ user, currentPage }: AnalystDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [sortBy, setSortBy] = useState<string>('date-oldest');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [filterWoman, setFilterWoman] = useState<string>('all');
  const [filterRetrofit, setFilterRetrofit] = useState<string>('all');
  const [filterFinancier, setFilterFinancier] = useState<string>('all');
  const [filterSla, setFilterSla] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [recommendations, setRecommendations] = useState<Record<string, RecommendationRecord>>({});

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await api.getAllApplications();
      // Filter applications assigned to this analyst
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

  // Filter applications
  let filteredApps = applications.filter((app) => {
    if (filterStatus !== 'all' && app.status !== filterStatus) return false;
    if (filterFinancier !== 'all' && app.companyName !== filterFinancier) return false;
    if (filterWoman === 'yes' && !isWomanApplicant(app)) return false;
    if (filterWoman === 'no' && isWomanApplicant(app)) return false;
    if (filterRetrofit === 'yes' && !app.isRetrofit) return false;
    if (filterRetrofit === 'no' && app.isRetrofit) return false;
    const days = daysSinceReceipt(app);
    if (filterDateRange === 'day' && days > 1) return false;
    if (filterDateRange === 'week' && days > 7) return false;
    if (filterDateRange === 'month' && days > 30) return false;
    if (filterDateRange === 'year' && days > 365) return false;
    if (filterSla === 'over-2' && days <= 2) return false;
    if (filterSla === 'not-opened' && app.status !== 'assigned') return false;
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

  // Sort applications
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

  const notYetReviewedApps = applications.filter((app) =>
    ['assigned', 'under-review'].includes(app.status)
  );
  const overTwoDaysNotReviewed = notYetReviewedApps.filter((app) => daysSinceReceipt(app) > 2);
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

  const openApplication = (app: Application) => setSelectedApp(enrichAnalystApplication(app));

  if (currentPage === 'notifications') {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <PageHeader />
        <NotificationsView user={user} />
      </div>
    );
  }

  if (currentPage === 'reassignment-checking') {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <PageHeader />
        <Greeting name={user.name || 'Analyst'} />
        <div className="mt-6">
          <ReassignmentCheckingPage
            applications={sortedApps}
            onOpenApplication={openApplication}
          />
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

  const showAssignedOnly = currentPage === 'assigned';
  const tableRows = showAssignedOnly
    ? sortedApps.filter((app) => app.status === 'assigned')
    : sortedApps.filter((app) => ['assigned', 'under-review'].includes(app.status));
  const defaultReportCount = notYetReviewedApps.length;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader />
      <Greeting name={user.name || 'Analyst'} />
      <h1 className="text-lg sm:text-xl text-[#023F40] mt-6">
        {showAssignedOnly ? 'Assigned Rebates' : 'Rebate Review Pipeline'}
      </h1>
      <p className="text-sm text-gray-600 mt-1">Check AF documentation, record eligibility results, and recommend to Rebate Team (no final decisions).</p>
      <div className="mt-4 flex justify-end">
        <Button onClick={handleSubmitRecommendations} className="bg-[#023F40] hover:bg-[#035f60]">
          Submit Recommendations
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Rebates received but not yet reviewed</p>
            <p className="text-2xl font-bold text-[#023F40]">{notYetReviewedApps.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Of which received more than 2 days ago</p>
            <p className="text-2xl font-bold text-[#023F40]">{overTwoDaysNotReviewed.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Rebates Verified but not yet presented to QA Team</p>
            <p className="text-2xl font-bold text-[#023F40]">{ANALYST_DASHBOARD_STATS.verifiedNotPresentedQA}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Rebates Approved but No E-Moto Confirmation</p>
            <p className="text-2xl font-bold text-[#023F40]">{ANALYST_DASHBOARD_STATS.approvedNoEmotoConfirmation}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mt-8 mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters &amp; Sort
          </CardTitle>
          <CardDescription>Narrow the rebate review pipeline by status, date, applicant type, and SLA.</CardDescription>
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
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="assigned">New — not opened</SelectItem>
                <SelectItem value="under-review">Rebate team in process</SelectItem>
                <SelectItem value="manager-review">Sent to Rebate Team</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSla} onValueChange={setFilterSla}>
              <SelectTrigger>
                <SelectValue placeholder="SLA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All SLA</SelectItem>
                <SelectItem value="not-opened">Not opened yet</SelectItem>
                <SelectItem value="over-2">Over 2 days since received</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="year">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterWoman} onValueChange={setFilterWoman}>
              <SelectTrigger>
                <SelectValue placeholder="Women" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All applicants</SelectItem>
                <SelectItem value="yes">Women only</SelectItem>
                <SelectItem value="no">Non-women</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRetrofit} onValueChange={setFilterRetrofit}>
              <SelectTrigger>
                <SelectValue placeholder="Retrofit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="yes">Retrofit only</SelectItem>
                <SelectItem value="no">New e-moto only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterFinancier} onValueChange={setFilterFinancier}>
              <SelectTrigger>
                <SelectValue placeholder="Asset financier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All financiers</SelectItem>
                {financiers.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-gray-500">
            Showing {tableRows.length} of {defaultReportCount} assigned applications
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#023F40]">
            {showAssignedOnly
              ? 'Assigned Rebates'
              : `Default Report: Rebates received but not yet reviewed (${defaultReportCount})`}
          </CardTitle>
          <CardDescription>Click on the Ticket Number to verify the rebate submission.</CardDescription>
        </CardHeader>
        <CardContent>
          {tableRows.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-600">No applications match the current filters.</div>
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
                        <Badge className={toStatusBadgeClass(app)}>
                          {toPipelineStatusLabel(app)}
                        </Badge>
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
  );
}