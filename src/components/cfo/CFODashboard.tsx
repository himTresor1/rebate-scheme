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
import { WeeklyDisbursementReport } from '../qa/WeeklyDisbursementReport';
import { QATeamWeeklyReview } from '../qa/QATeamWeeklyReview';
import { NotificationsView } from '../NotificationsView';
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
  onNavigate?: (page: string) => void;
}

export function CFODashboard({ user, currentPage, onNavigate }: CFODashboardProps) {
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
  const [advanceDecisionNotes, setAdvanceDecisionNotes] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await api.getAllApplications();
      const cfoApps = data.filter((app: Application) =>
        ['approved-pending-lease', 'approved'].includes(app.status)
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
  let filteredApps = applications.filter(app => app.status === 'approved-pending-lease');

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

  if (currentPage === 'weekly-report') {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <PageHeader />
        <WeeklyDisbursementReport mode="cfo-authorization" />
      </div>
    );
  }

  if (currentPage === 'approvals') {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <PageHeader />
        <Greeting name={user.name || 'Program Manager'} />
        <div className="mt-6">
          <QATeamWeeklyReview />
        </div>
      </div>
    );
  }

  if (currentPage === 'flagged') {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <PageHeader />
        <Greeting name={user.name || 'Program Manager'} />
        <h1 className="text-lg sm:text-xl text-[#023F40] mt-6">Recommended Rebates</h1>
        <p className="text-sm text-gray-600 mt-1">
          Rebates verified by Rebate Team and awaiting or included in QA weekly review.
        </p>
        <Card className="mt-6">
          <CardContent className="pt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="pb-2 pr-3">Ticket</th>
                  <th className="pb-2 pr-3">AF</th>
                  <th className="pb-2 pr-3">Applicant</th>
                  <th className="pb-2 pr-3">Amount</th>
                  <th className="pb-2 pr-3">Rebate Team</th>
                  <th className="pb-2">QA status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { ticket: 'REB-001', af: 'Bboxx', applicant: 'Jean Claude Ndayisaba', amount: 150000, team: 'Verified', qa: 'In weekly batch' },
                  { ticket: 'REB-002', af: 'REM', applicant: 'Grace UWASE', amount: 200000, team: 'Verified', qa: 'Excluded — no possession' },
                  { ticket: 'REB-004', af: 'Bboxx', applicant: 'Jean HABIMANA', amount: 150000, team: 'Verified', qa: 'In weekly batch' },
                ].map((r) => (
                  <tr key={r.ticket} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-medium">{r.ticket}</td>
                    <td className="py-2 pr-3">{r.af}</td>
                    <td className="py-2 pr-3">{r.applicant}</td>
                    <td className="py-2 pr-3">RWF {r.amount.toLocaleString()}</td>
                    <td className="py-2 pr-3"><Badge className="bg-green-100 text-green-800">{r.team}</Badge></td>
                    <td className="py-2">{r.qa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentPage === 'advance-funding') {
    const projections = [
      { financier: 'Bank of Kigali', historicalRetailCost: 240000000, projectedRetailCost: 280000000, recommendedEscrow: 51000000, qaStatus: 'Recommended' },
      { financier: 'Equity Bank Rwanda', historicalRetailCost: 180000000, projectedRetailCost: 215000000, recommendedEscrow: 38700000, qaStatus: 'Recommended' },
      { financier: 'Vision Finance Company', historicalRetailCost: 130000000, projectedRetailCost: 155000000, recommendedEscrow: 27900000, qaStatus: 'Pending QA' },
    ];

    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <PageHeader />
        <Greeting name={user.name || 'Program Manager'} />
        <h1 className="text-lg sm:text-xl text-[#023F40] mt-6">Advance Funding Approval</h1>
        <p className="text-sm text-gray-600 mt-1">
          QA Team recommends 6-month AF escrow projections; CFO authorizes advance rebate funding before AF possession and weekly disbursement cycles.
        </p>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Projected Escrow Requirements</CardTitle>
            <CardDescription>Historical and projected lease retail values used to determine advance rebate escrow.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="pb-3 pr-3">Asset Financier</th>
                  <th className="pb-3 pr-3">Historical retail cost</th>
                  <th className="pb-3 pr-3">Projected retail cost</th>
                  <th className="pb-3 pr-3">QA recommended escrow</th>
                  <th className="pb-3">QA status</th>
                </tr>
              </thead>
              <tbody>
                {projections.map((p) => (
                  <tr key={p.financier} className="border-b last:border-0">
                    <td className="py-3 pr-3 font-medium">{p.financier}</td>
                    <td className="py-3 pr-3">RWF {p.historicalRetailCost.toLocaleString()}</td>
                    <td className="py-3 pr-3">RWF {p.projectedRetailCost.toLocaleString()}</td>
                    <td className="py-3 pr-3">RWF {p.recommendedEscrow.toLocaleString()}</td>
                    <td className="py-3">
                      <Badge className={p.qaStatus === 'Recommended' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                        {p.qaStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>CFO Decision Note</CardTitle>
            <CardDescription>Capture rationale for approved or adjusted advance funding amounts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={advanceDecisionNotes}
              onChange={(e) => setAdvanceDecisionNotes(e.target.value)}
              placeholder="Document approval rationale, adjustments, and conditions for disbursement..."
              rows={4}
            />
            <div className="flex gap-2">
              <Button className="bg-[#023F40] hover:bg-[#035f60]" onClick={() => toast.success('Advance funding approval recorded')}>
                Approve advances
              </Button>
              <Button variant="outline" onClick={() => toast.info('Returned to QA for updates')}>
                Return to QA
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
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

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader />
      <Greeting name={user.name || 'Program Manager'} />
      <h1 className="text-lg sm:text-xl text-[#023F40] mt-6">QA Team Dashboard</h1>
      <p className="text-sm text-gray-600 mt-1">Accountable for weekly disbursement review before CFO authorization.</p>

      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6 text-sm text-blue-900">
          Per-case verification is done by the <strong>Rebate Team</strong> (1 business day SLA). QA Team confirms weekly batches and submits disbursement requests to the CFO. AFs are notified after CFO authorization.
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Awaiting QA review</p>
            <p className="text-2xl font-bold">3</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">In weekly batch</p>
            <p className="text-2xl font-bold text-green-600">2</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Weekly total</p>
            <p className="text-2xl font-bold">RWF 300,000</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Excluded (no possession)</p>
            <p className="text-2xl font-bold text-amber-600">1</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#023F40]" />
              QA Team Review
            </CardTitle>
            <CardDescription>Weekly accountability check and batch inclusion before CFO request.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">3 verified rebates ready · 2 with possession confirmed</p>
            <Button className="w-full bg-[#023F40] hover:bg-[#035f60]" onClick={() => onNavigate?.('approvals')}>
              Open QA Team Review
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#023F40]" />
              CFO Weekly Report
            </CardTitle>
            <CardDescription>Authorize weekly disbursement and notify Asset Financiers.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Week ending 01 June 2026 · pending signature</p>
            <Button variant="outline" className="w-full" onClick={() => onNavigate?.('weekly-report')}>
              Open weekly report
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#023F40]" />
              Advance Funding
            </CardTitle>
            <CardDescription>6-month AF escrow projections — QA recommends, CFO approves.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">3 AFs · RWF 117.6M total recommended escrow</p>
            <Button variant="outline" className="w-full" onClick={() => onNavigate?.('advance-funding')}>
              Review advance funding
            </Button>
          </CardContent>
        </Card>
      </div>
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