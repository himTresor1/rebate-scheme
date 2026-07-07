import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Eye, Filter, AlertTriangle, CheckCircle } from 'lucide-react';
import { User } from '../../utils/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { QAReview } from './QAReview';
import { FinancierGroupedView } from '../shared/FinancierGroupedView';
import { Greeting } from '../ui/Greeting';
import { LeaseReviewView } from './LeaseReviewView';
import { RebateStatusView } from '../asset-financier/RebateStatusView';
import { RebateReassignmentPipeline } from './RebateReassignmentPipeline';
import { PageHeader } from '../PageHeader';
import { getSlaBadge } from '../../utils/slaBadges';
import { NotificationsView } from '../NotificationsView';
import { withDemoPipelineFallback } from '../../utils/demoPipelineData';

interface Application {
  id: string;
  companyName: string;
  registrationNumber: string;
  rebateAmount: string;
  status: string;
  createdAt: string;
  lastReviewedAt?: string;
  flaggedForCFO?: boolean;
}

interface Evaluation {
  score: number;
  evaluatorId: string;
}

interface QADashboardProps {
  user: User;
  currentPage: string;
}

export function QADashboard({ user, currentPage }: QADashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [sortBy, setSortBy] = useState<string>('score');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await api.getAllApplications();
      // Filter Manager review applications
      const qaApps = withDemoPipelineFallback(
        data.filter((app: Application) =>
          ['manager-review', 'qa-review', 'program-manager-review', 'approved-pending-lease', 'approved', 'lease-review'].includes(app.status)
        ),
        true
      );
      setApplications(qaApps);

      // Load evaluations for scoring
      const evalPromises = qaApps.map(async (app: Application) => {
        try {
          const evaluation = await api.getEvaluation(app.id.replace('application:', ''));
          return { id: app.id, evaluation };
        } catch {
          return { id: app.id, evaluation: null };
        }
      });

      const evalResults = await Promise.all(evalPromises);
      const evalMap: Record<string, Evaluation> = {};
      evalResults.forEach(({ id, evaluation }) => {
        if (evaluation) {
          evalMap[id] = evaluation;
        } else {
          evalMap[id] = { score: 85, evaluatorId: 'demo' };
        }
      });
      setEvaluations(evalMap);
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

  // Sort applications
  const sortedApps = [...applications].sort((a, b) => {
    if (sortBy === 'score') {
      const scoreA = evaluations[a.id]?.score || 0;
      const scoreB = evaluations[b.id]?.score || 0;
      return scoreB - scoreA;
    } else if (sortBy === 'date') {
      return new Date(b.lastReviewedAt || b.createdAt).getTime() - 
             new Date(a.lastReviewedAt || a.createdAt).getTime();
    } else if (sortBy === 'amount') {
      return parseFloat(b.rebateAmount) - parseFloat(a.rebateAmount);
    }
    return 0;
  });

  const pendingReview = sortedApps.filter(app => app.status === 'manager-review');
  const sentToQA = sortedApps.filter(app => ['qa-review', 'program-manager-review', 'approved-pending-lease'].includes(app.status));
  const approved = sortedApps.filter(app => app.status === 'approved');

  // Show reassignment pipeline for Rebate Manager
  if (currentPage === 'reassignment') {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <PageHeader />
        <RebateReassignmentPipeline />
      </div>
    );
  }

  // Show possession analysis for Rebate Manager (RGF view)
  if (currentPage === 'possession-analysis') {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <PageHeader />
        <RebateStatusView
          title="Analysis of Individual E-Moto Possession"
          description="Cross-AF view of rebate applications and whether individuals have received their e-moto (escrow vs disbursed)."
          mode="possession-analysis"
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
        <NotificationsView user={user} />
      </div>
    );
  }

  if (selectedApp) {
    return (
      <QAReview
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
      <Greeting name={user.name || 'Rebate Manager'} />
      <h1 className="text-lg sm:text-xl text-[#023F40] mt-6">Rebate Review Pipeline</h1>
      <p className="text-sm text-gray-600 mt-1">Rebate Team pipeline — verify documentation within 1 business day and forward verified cases to QA Team for weekly disbursement review.</p>

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
                  <SelectItem value="score">Eligibility Score (High to Low)</SelectItem>
                  <SelectItem value="date">Review Date</SelectItem>
                  <SelectItem value="amount">Rebate Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Awaiting verification ({pendingReview.length})
          </TabsTrigger>
          <TabsTrigger value="qa" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Sent to QA Team ({sentToQA.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            CFO disbursement complete ({approved.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingReview.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No applications awaiting Rebate Team verification</p>
              </CardContent>
            </Card>
          ) : (
            <FinancierGroupedView
              applications={pendingReview}
              renderApplicationCard={(app) => (
                <QAApplicationCard
                  key={app.id}
                  app={app}
                  evaluation={evaluations[app.id]}
                  formatDate={formatDate}
                  onReview={() => setSelectedApp(app)}
                />
              )}
            />
          )}
        </TabsContent>

        <TabsContent value="qa" className="space-y-4 mt-6">
          {sentToQA.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No cases forwarded to QA Team yet</p>
              </CardContent>
            </Card>
          ) : (
            <FinancierGroupedView
              applications={sentToQA}
              renderApplicationCard={(app) => (
                <QAApplicationCard
                  key={app.id}
                  app={app}
                  evaluation={evaluations[app.id]}
                  formatDate={formatDate}
                  onReview={() => setSelectedApp(app)}
                  showViewOnly
                />
              )}
            />
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {approved.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No applications approved yet</p>
              </CardContent>
            </Card>
          ) : (
            <FinancierGroupedView
              applications={approved}
              renderApplicationCard={(app) => (
                <QAApplicationCard
                  key={app.id}
                  app={app}
                  evaluation={evaluations[app.id]}
                  formatDate={formatDate}
                  onReview={() => setSelectedApp(app)}
                  showViewOnly
                />
              )}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface QAApplicationCardProps {
  app: Application;
  evaluation?: Evaluation;
  formatDate: (date: string) => string;
  onReview: () => void;
  showViewOnly?: boolean;
}

function QAApplicationCard({ app, evaluation, formatDate, onReview, showViewOnly }: QAApplicationCardProps) {
  const score = evaluation?.score || 0;
  const daysSince = Math.floor((Date.now() - new Date(app.lastReviewedAt || app.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h3 className="text-lg font-medium">{app.companyName}</h3>
              {getSlaBadge(daysSince, app.status !== 'manager-review')}
              {app.flaggedForCFO && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Flagged for CFO
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3 sm:mb-0">
              <div>
                <span className="font-medium">Registration:</span> {app.registrationNumber}
              </div>
              <div>
                <span className="font-medium">Amount:</span> RWF {parseFloat(app.rebateAmount).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Reviewed:</span> {formatDate(app.lastReviewedAt || app.createdAt)}
              </div>
              <div className={`font-semibold px-3 py-1 rounded border ${getScoreColor(score)}`}>
                Score: {score}%
              </div>
            </div>
          </div>

          <Button onClick={onReview} className="w-full sm:w-auto">
            <Eye className="w-4 h-4 mr-2" />
            {showViewOnly ? 'View' : 'Open verification'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}