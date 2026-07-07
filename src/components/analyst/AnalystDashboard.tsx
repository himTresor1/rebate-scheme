import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Eye, Filter, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { User } from '../../utils/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { ApplicationReviewEnhanced } from './ApplicationReviewEnhanced';
import { FinancierGroupedView } from '../shared/FinancierGroupedView';
import { Greeting } from '../ui/Greeting';
import { PageHeader } from '../PageHeader';
import { getSlaBadge } from '../../utils/slaBadges';

interface Application {
  id: string;
  companyName: string;
  applicantName?: string;
  registrationNumber: string;
  rebateAmount: string;
  status: string;
  createdAt: string;
  assignedAt?: string;
  assignedTo?: string;
  isRetrofit?: boolean;
  eligibilityCheck?: {
    nationalIdCheck?: { gender?: string };
  };
}

interface AnalystDashboardProps {
  user: User;
  currentPage: string;
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

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await api.getAllApplications();
      // Filter applications assigned to this analyst
      const myApps = data.filter((app: Application) => app.assignedTo === user.id);
      setApplications(myApps);
    } catch (error: any) {
      toast.error('Failed to load applications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleReviewComplete = () => {
    setSelectedApp(null);
    loadApplications();
  };

  const isWomanApplicant = (app: Application) =>
    app.eligibilityCheck?.nationalIdCheck?.gender === 'Female';

  const daysSinceReceipt = (app: Application) =>
    Math.floor((Date.now() - new Date(app.assignedAt || app.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  const financiers = [...new Set(applications.map((a) => a.companyName))].sort();

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
      if (!name.includes(q) && !app.registrationNumber.toLowerCase().includes(q) && !app.id.toLowerCase().includes(q)) {
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

  const assignedApps = sortedApps.filter(app => app.status === 'assigned');
  const inReviewApps = sortedApps.filter(app => app.status === 'under-review');
  const completedApps = sortedApps.filter(app => ['manager-review', 'rejected'].includes(app.status));

  if (selectedApp) {
    return (
      <ApplicationReviewEnhanced
        application={selectedApp}
        user={user}
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

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader />
      <Greeting user={user} />
      <h1 className="text-lg sm:text-xl text-[#023F40] mt-6">Rebate Review Pipeline</h1>
      <p className="text-sm text-gray-600 mt-1">Check AF documentation, record eligibility results, and recommend to QA (no final decisions).</p>

      {/* Filters */}
      <Card className="mb-6">
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
                <SelectItem value="manager-review">Sent to manager</SelectItem>
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
            Showing {sortedApps.length} of {applications.length} assigned applications
          </p>
        </CardContent>
      </Card>

      {/* Applications Tabs */}
      <Tabs defaultValue="assigned">
        <TabsList className="flex flex-col sm:grid sm:grid-cols-3 w-full gap-2 sm:gap-0 h-auto sm:h-10">
          <TabsTrigger value="assigned" className="flex items-center gap-2 w-full justify-center">
            <Clock className="w-4 h-4" />
            New ({assignedApps.length})
          </TabsTrigger>
          <TabsTrigger value="in-review" className="flex items-center gap-2 w-full justify-center">
            <AlertCircle className="w-4 h-4" />
            In Progress ({inReviewApps.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2 w-full justify-center">
            <CheckCircle className="w-4 h-4" />
            Completed ({completedApps.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="space-y-4 mt-6">
          {assignedApps.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No new applications assigned</p>
              </CardContent>
            </Card>
          ) : (
            <FinancierGroupedView
              applications={assignedApps}
              renderApplicationCard={(app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  formatDate={formatDate}
                  onReview={() => setSelectedApp(app)}
                />
              )}
            />
          )}
        </TabsContent>

        <TabsContent value="in-review" className="space-y-4 mt-6">
          {inReviewApps.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No applications in progress</p>
              </CardContent>
            </Card>
          ) : (
            <FinancierGroupedView
              applications={inReviewApps}
              renderApplicationCard={(app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  formatDate={formatDate}
                  onReview={() => setSelectedApp(app)}
                />
              )}
            />
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedApps.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No completed reviews</p>
              </CardContent>
            </Card>
          ) : (
            <FinancierGroupedView
              applications={completedApps}
              renderApplicationCard={(app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  formatDate={formatDate}
                  onReview={() => setSelectedApp(app)}
                  showReviewOnly
                />
              )}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ApplicationCardProps {
  app: Application;
  formatDate: (date: string) => string;
  onReview: () => void;
  showReviewOnly?: boolean;
}

function ApplicationCard({ app, formatDate, onReview, showReviewOnly }: ApplicationCardProps) {
  const daysSince = Math.floor((Date.now() - new Date(app.assignedAt || app.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const statusColors: Record<string, string> = {
    assigned: 'default',
    'under-review': 'secondary',
    'manager-review': 'default',
    rejected: 'destructive',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h3 className="text-lg font-medium">{app.applicantName || app.companyName}</h3>
              <Badge variant={statusColors[app.status] as any}>
                {app.status === 'assigned' && 'New'}
                {app.status === 'under-review' && 'In Progress'}
                {app.status === 'manager-review' && 'Sent to Manager'}
                {app.status === 'rejected' && 'Rejected'}
              </Badge>
              {getSlaBadge(daysSince, app.status !== 'assigned')}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Registration:</span> {app.registrationNumber}
              </div>
              <div>
                <span className="font-medium">Amount:</span> ${parseFloat(app.rebateAmount).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Assigned:</span> {formatDate(app.assignedAt || app.createdAt)}
              </div>
            </div>
          </div>

          <Button onClick={onReview} className="w-full sm:w-auto">
            <Eye className="w-4 h-4 mr-2" />
            {showReviewOnly ? 'View' : 'Review'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}