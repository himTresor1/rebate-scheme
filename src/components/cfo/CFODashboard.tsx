import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import {
  Eye,
  CheckCircle,
  XCircle,
  Flag,
  TrendingUp,
  DollarSign,
  FileCheck,
  Filter
} from 'lucide-react';
import { User } from '../../utils/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PageHeader } from '../PageHeader';
import { CFOReview } from './CFOReview';
import { FinancierGroupedView } from '../shared/FinancierGroupedView';
import { Greeting } from '../ui/Greeting';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface Application {
  id: string;
  companyName: string;
  registrationNumber: string;
  rebateAmount: string;
  status: string;
  createdAt: string;
  flaggedForCFO?: boolean;
  flagReason?: string;
}

interface Evaluation {
  score: number;
  criteriaEvaluations: Record<string, boolean>;
}

interface CFODashboardProps {
  user: User;
  currentPage: string;
}

export function CFODashboard({ user, currentPage }: CFODashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedForBatch, setSelectedForBatch] = useState<string[]>([]);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [batchNotes, setBatchNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [sortBy, setSortBy] = useState<string>('score');
  const [scoreFilter, setScoreFilter] = useState<string>('all');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await api.getAllApplications();
      const cfoApps = data.filter((app: Application) =>
        ['program-manager-review', 'approved-pending-lease', 'approved'].includes(app.status)
      );
      setApplications(cfoApps);

      // Load evaluations
      const evalPromises = cfoApps.map(async (app: Application) => {
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

  const toggleSelection = (appId: string) => {
    setSelectedForBatch(prev =>
      prev.includes(appId)
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const handleBatchApprove = async () => {
    if (selectedForBatch.length === 0) {
      toast.error('No applications selected');
      return;
    }

    setProcessing(true);
    try {
      const ids = selectedForBatch.map(id => id.replace('application:', ''));
      await api.cfoBatchApprove(ids, batchNotes);
      toast.success(`${selectedForBatch.length} applications approved`);
      setShowBatchDialog(false);
      setBatchNotes('');
      setSelectedForBatch([]);
      loadApplications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to batch approve');
    } finally {
      setProcessing(false);
    }
  };

  // Filter and sort applications
  let filteredApps = applications.filter(app => app.status === 'program-manager-review');

  if (scoreFilter !== 'all') {
    filteredApps = filteredApps.filter(app => {
      const score = evaluations[app.id]?.score || 0;
      if (scoreFilter === 'high') return score >= 80;
      if (scoreFilter === 'medium') return score >= 60 && score < 80;
      if (scoreFilter === 'low') return score < 60;
      return true;
    });
  }

  const sortedApps = [...filteredApps].sort((a, b) => {
    if (sortBy === 'score') {
      const scoreA = evaluations[a.id]?.score || 0;
      const scoreB = evaluations[b.id]?.score || 0;
      return scoreB - scoreA;
    } else if (sortBy === 'amount') {
      return parseFloat(b.rebateAmount) - parseFloat(a.rebateAmount);
    } else if (sortBy === 'flagged') {
      return (b.flaggedForCFO ? 1 : 0) - (a.flaggedForCFO ? 1 : 0);
    }
    return 0;
  });

  const pendingApps = sortedApps;
  const approvedApps = applications.filter(app => app.status === 'approved');
  const flaggedApps = pendingApps.filter(app => app.flaggedForCFO);

  // Calculate stats
  const totalPendingAmount = pendingApps.reduce((sum, app) => sum + parseFloat(app.rebateAmount), 0);
  const avgScore = pendingApps.length > 0
    ? pendingApps.reduce((sum, app) => sum + (evaluations[app.id]?.score || 0), 0) / pendingApps.length
    : 0;

  if (selectedApp) {
    return (
      <CFOReview
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
      <h1 className="text-lg sm:text-xl text-[#023F40] mt-6">QA Decision Dashboard</h1>
      <p className="text-sm text-gray-600 mt-1">E-Moto Quality Assurance — record weekly rebate decisions with mandatory rationale.</p>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold">{pendingApps.length}</p>
              </div>
              <FileCheck className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold">${(totalPendingAmount / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold">{avgScore.toFixed(0)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Flagged</p>
                <p className="text-2xl font-bold">{flaggedApps.length}</p>
              </div>
              <Flag className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <SelectItem value="score">Score (High to Low)</SelectItem>
                  <SelectItem value="amount">Amount (High to Low)</SelectItem>
                  <SelectItem value="flagged">Flagged First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-xs sm:text-sm font-medium mb-2 block">Score Range</label>
              <Select value={scoreFilter} onValueChange={setScoreFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="high">High (80%+)</SelectItem>
                  <SelectItem value="medium">Medium (60-79%)</SelectItem>
                  <SelectItem value="low">Low (&lt;60%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => setShowBatchDialog(true)}
              disabled={selectedForBatch.length === 0}
              className="w-full"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Batch Approve ({selectedForBatch.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending Review ({pendingApps.length})
          </TabsTrigger>
          <TabsTrigger value="flagged">
            Flagged ({flaggedApps.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedApps.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingApps.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileCheck className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No applications pending approval</p>
              </CardContent>
            </Card>
          ) : (
            <FinancierGroupedView
              applications={pendingApps}
              renderApplicationCard={(app) => (
                <CFOApplicationCard
                  key={app.id}
                  app={app}
                  evaluation={evaluations[app.id]}
                  formatDate={formatDate}
                  onReview={() => setSelectedApp(app)}
                  isSelected={selectedForBatch.includes(app.id)}
                  onToggleSelect={toggleSelection}
                />
              )}
            />
          )}
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4 mt-6">
          {flaggedApps.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Flag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No flagged applications</p>
              </CardContent>
            </Card>
          ) : (
            <FinancierGroupedView
              applications={flaggedApps}
              renderApplicationCard={(app) => (
                <CFOApplicationCard
                  key={app.id}
                  app={app}
                  evaluation={evaluations[app.id]}
                  formatDate={formatDate}
                  onReview={() => setSelectedApp(app)}
                  isSelected={selectedForBatch.includes(app.id)}
                  onToggleSelect={toggleSelection}
                />
              )}
            />
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {approvedApps.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No approved applications yet</p>
              </CardContent>
            </Card>
          ) : (
            <FinancierGroupedView
              applications={approvedApps}
              renderApplicationCard={(app) => (
                <CFOApplicationCard
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

      {/* Batch Approve Dialog */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batch Approve Applications</DialogTitle>
            <DialogDescription>
              You are about to approve {selectedForBatch.length} application(s). This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Approval Notes (Optional)</Label>
              <Textarea
                value={batchNotes}
                onChange={(e) => setBatchNotes(e.target.value)}
                placeholder="Add any conditions or notes for this batch approval..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBatchApprove} disabled={processing}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve {selectedForBatch.length} Application(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CFOApplicationCardProps {
  app: Application;
  evaluation?: Evaluation;
  formatDate: (date: string) => string;
  onReview: () => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  showViewOnly?: boolean;
}

function CFOApplicationCard({
  app,
  evaluation,
  formatDate,
  onReview,
  isSelected,
  onToggleSelect,
  showViewOnly
}: CFOApplicationCardProps) {
  const score = evaluation?.score || 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const passedCount = evaluation ? Object.values(evaluation.criteriaEvaluations).filter(v => v === true).length : 0;
  const totalCount = evaluation ? Object.keys(evaluation.criteriaEvaluations).length : 0;

  return (
    <Card className={isSelected ? 'border-blue-500 bg-blue-50' : ''}>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            {!showViewOnly && onToggleSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(app.id)}
                className="mt-1 flex-shrink-0"
              />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h3 className="text-lg font-medium">{app.companyName}</h3>
                {app.flaggedForCFO && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <Flag className="w-3 h-3" />
                    Flagged
                  </Badge>
                )}
                {showViewOnly && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Approved
                  </Badge>
                )}
              </div>

              {app.flaggedForCFO && app.flagReason && (
                <p className="text-sm text-red-600 mb-2 italic">
                  Flagged: {app.flagReason}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Registration:</span>
                  <p className="font-medium break-all">{app.registrationNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <p className="font-medium text-green-600">
                    ${parseFloat(app.rebateAmount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Submitted:</span>
                  <p className="font-medium">{formatDate(app.createdAt)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Criteria:</span>
                  <p className="font-medium">{passedCount}/{totalCount} passed</p>
                </div>
                <div className={`px-3 py-1 rounded border text-center ${getScoreColor(score)}`}>
                  <p className="font-bold text-lg">{score}%</p>
                  <p className="text-xs">Score</p>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={onReview} className="w-full sm:w-auto sm:self-end">
            <Eye className="w-4 h-4 mr-2" />
            {showViewOnly ? 'View' : 'Review'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}