import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Eye, Filter, Clock, CheckCircle, AlertCircle, LayoutGrid, List } from 'lucide-react';
import { User } from '../../utils/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ApplicationReviewEnhanced } from './ApplicationReviewEnhanced';
import { FinancierGroupedView } from '../shared/FinancierGroupedView';
import { Greeting } from '../ui/Greeting';
import { PageHeader } from '../PageHeader';

interface Application {
  id: string;
  companyName: string;
  registrationNumber: string;
  rebateAmount: string;
  status: string;
  createdAt: string;
  assignedAt?: string;
  assignedTo?: string;
}

interface AnalystDashboardProps {
  user: User;
  currentPage: string;
}

export function AnalystDashboard({ user, currentPage }: AnalystDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [sortBy, setSortBy] = useState<string>('date');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');

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

  // Filter applications by status
  let filteredApps = applications;
  if (filterStatus !== 'all') {
    filteredApps = applications.filter(app => app.status === filterStatus);
  }

  // Sort applications
  const sortedApps = [...filteredApps].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.assignedAt || b.createdAt).getTime() - new Date(a.assignedAt || a.createdAt).getTime();
    } else if (sortBy === 'amount') {
      return parseFloat(b.rebateAmount) - parseFloat(a.rebateAmount);
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
      <h1 className="text-lg sm:text-xl text-[#023F40] mt-6">My Application Queue</h1>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3">
            <div className="flex-1">
              <label className="text-xs sm:text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date Assigned</SelectItem>
                  <SelectItem value="amount">Rebate Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
              <h3 className="text-lg font-medium">{app.companyName}</h3>
              <Badge variant={statusColors[app.status] as any}>
                {app.status === 'assigned' && 'New'}
                {app.status === 'under-review' && 'In Progress'}
                {app.status === 'manager-review' && 'Sent to Manager'}
                {app.status === 'rejected' && 'Rejected'}
              </Badge>
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