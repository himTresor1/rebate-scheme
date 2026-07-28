import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import {
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Users,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { User } from '../../utils/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Greeting } from '../ui/Greeting';
import { PageHeader } from '../PageHeader';
import { NotificationsView } from '../NotificationsView';
import { formatDisplayDate } from '../../utils/dateFormat';

interface Application {
  id: string;
  companyName: string;
  registrationNumber: string;
  rebateAmount: string;
  status: string;
  createdAt: string;
  lastReviewedBy?: string;
  assignedTo?: string;
}

interface Evaluation {
  score: number;
  criteriaEvaluations: Record<string, boolean>;
}

interface Criterion {
  id: string;
  text: string;
  enabled?: boolean;
}

interface ManagementDashboardProps {
  user: User;
  currentPage: string;
}

export function ManagementDashboard({ user, currentPage }: ManagementDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('score');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appsData, criteriaData, usersData] = await Promise.all([
        api.getAllApplications(),
        api.getCriteria(),
        api.getUsers()
      ]);

      setApplications(appsData);
      setCriteria(criteriaData.filter((c: Criterion) => c.enabled));
      setUsers(usersData);

      // Load evaluations
      const evalPromises = appsData
        .filter((app: Application) => !['draft', 'pending'].includes(app.status))
        .map(async (app: Application) => {
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
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const evaluatedApps = applications.filter(app => evaluations[app.id]);
  const avgScore = evaluatedApps.length > 0
    ? evaluatedApps.reduce((sum, app) => sum + (evaluations[app.id]?.score || 0), 0) / evaluatedApps.length
    : 0;

  const approvalRate = applications.length > 0
    ? (applications.filter(app => ['approved', 'disbursed'].includes(app.status)).length / applications.length) * 100
    : 0;

  const avgProcessingTime = 5.2; // Mock data - would calculate from actual timestamps

  // Criteria failure analysis
  const criteriaFailureRates = criteria.map(criterion => {
    const totalEvaluated = evaluatedApps.length;
    const failed = evaluatedApps.filter(app => 
      evaluations[app.id]?.criteriaEvaluations[criterion.id] === false
    ).length;

    return {
      criterion,
      failureRate: totalEvaluated > 0 ? (failed / totalEvaluated) * 100 : 0,
      failureCount: failed
    };
  }).sort((a, b) => b.failureRate - a.failureRate);

  // Analyst performance
  const analysts = users.filter(u => u.role === 'analyst');
  const analystPerformance = analysts.map(analyst => {
    const reviewedApps = applications.filter(app => app.lastReviewedBy === analyst.id);
    const avgAnalystScore = reviewedApps.length > 0
      ? reviewedApps.reduce((sum, app) => sum + (evaluations[app.id]?.score || 0), 0) / reviewedApps.length
      : 0;

    return {
      analyst,
      reviewed: reviewedApps.length,
      avgScore: avgAnalystScore
    };
  }).sort((a, b) => b.reviewed - a.reviewed);

  // Filter and sort applications for ranking
  let filteredApps = evaluatedApps;

  if (scoreFilter !== 'all') {
    filteredApps = evaluatedApps.filter(app => {
      const score = evaluations[app.id]?.score || 0;
      if (scoreFilter === 'high') return score >= 80;
      if (scoreFilter === 'medium') return score >= 60 && score < 80;
      if (scoreFilter === 'low') return score < 60;
      return true;
    });
  }

  const rankedApps = [...filteredApps].sort((a, b) => {
    if (sortBy === 'score') {
      const scoreA = evaluations[a.id]?.score || 0;
      const scoreB = evaluations[b.id]?.score || 0;
      return scoreB - scoreA;
    } else if (sortBy === 'amount') {
      return parseFloat(b.rebateAmount) - parseFloat(a.rebateAmount);
    }
    return 0;
  });

  const exportRanking = () => {
    const headers = ['Rank', 'Company', 'Registration', 'Score', 'Pass/Fail', 'Amount', 'Status'];
    const rows = rankedApps.map((app, index) => {
      const evaluation = evaluations[app.id];
      const passCount = evaluation ? Object.values(evaluation.criteriaEvaluations).filter(v => v).length : 0;
      const failCount = evaluation ? Object.values(evaluation.criteriaEvaluations).filter(v => !v).length : 0;

      return [
        index + 1,
        app.companyName,
        app.registrationNumber,
        `${evaluation?.score || 0}%`,
        `${passCount}/${failCount}`,
        app.rebateAmount,
        app.status
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `application-ranking-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <p>Loading analytics...</p>
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

  if (currentPage === 'applications') {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <PageHeader />
        <Greeting name={user.name || 'Reviewer'} />
        <h1 className="text-lg sm:text-xl text-[#023F40] mt-6 mb-4">View Applications</h1>
        <Card>
          <CardHeader>
            <CardTitle>All rebate applications</CardTitle>
            <CardDescription>Read-only list for external reviewers and M&E Rebate Team.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="pb-3 pr-3">Company</th>
                  <th className="pb-3 pr-3">Registration</th>
                  <th className="pb-3 pr-3">Rebate Amount</th>
                  <th className="pb-3 pr-3">Status</th>
                  <th className="pb-3">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b last:border-0">
                    <td className="py-3 pr-3 font-medium">{app.companyName}</td>
                    <td className="py-3 pr-3">{app.registrationNumber}</td>
                    <td className="py-3 pr-3">{Number(app.rebateAmount || 0).toLocaleString()} RWF</td>
                    <td className="py-3 pr-3">
                      <Badge variant="outline">{app.status}</Badge>
                    </td>
                    <td className="py-3">{formatDisplayDate(app.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader />
      <Greeting name={user.name || 'Reviewer'} />
      
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
        <h1 className="text-lg sm:text-xl text-[#023F40]">Management Dashboard</h1>
        <Button onClick={exportRanking} variant="outline" className="w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Export Ranking
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold">{avgScore.toFixed(0)}%</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +2.3% from last month
                </p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold">{approvalRate.toFixed(0)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Processing</p>
                <p className="text-2xl font-bold">{avgProcessingTime} days</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="ranking">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ranking">Application Ranking</TabsTrigger>
          <TabsTrigger value="criteria">Criteria Analysis</TabsTrigger>
          <TabsTrigger value="performance">Team Performance</TabsTrigger>
        </TabsList>

        {/* Ranking Tab */}
        <TabsContent value="ranking" className="mt-6">
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Ranking by Eligibility Score</CardTitle>
              <CardDescription>
                Applications ranked by compliance level - {rankedApps.length} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rankedApps.map((app, index) => {
                  const evaluation = evaluations[app.id];
                  const score = evaluation?.score || 0;
                  const passCount = evaluation ? Object.values(evaluation.criteriaEvaluations).filter(v => v).length : 0;
                  const failCount = evaluation ? Object.values(evaluation.criteriaEvaluations).filter(v => !v).length : 0;

                  const getScoreColor = (score: number) => {
                    if (score >= 80) return 'bg-green-100 text-green-700 border-green-300';
                    if (score >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
                    return 'bg-red-100 text-red-700 border-red-300';
                  };

                  return (
                    <div key={app.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                      <div className="text-2xl font-bold text-gray-400 w-12 text-center flex-shrink-0">
                        #{index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium break-all">{app.companyName}</h4>
                        <p className="text-sm text-gray-600 break-all">{app.registrationNumber}</p>
                      </div>

                      <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 w-full sm:w-auto">
                        <div className="text-left sm:text-right">
                          <p className="text-sm text-gray-600">Criteria</p>
                          <p className="font-medium">
                            <span className="text-green-600">{passCount}</span> / <span className="text-red-600">{failCount}</span>
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="font-medium">${(parseFloat(app.rebateAmount) / 1000).toFixed(0)}K</p>
                        </div>

                        <div className={`px-4 py-2 rounded-lg border ${getScoreColor(score)}`}>
                          <p className="font-bold text-lg">{score}%</p>
                        </div>

                        <Badge className="w-24 justify-center">
                          {app.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Criteria Analysis Tab */}
        <TabsContent value="criteria" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Criteria Failure Analysis</CardTitle>
              <CardDescription>
                Identify which criteria have the highest failure rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criteriaFailureRates.map((item, index) => (
                  <div key={item.criterion.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.criterion.text}</p>
                        <p className="text-sm text-gray-600">
                          {item.failureCount} failures out of {evaluatedApps.length} evaluations
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-red-600">
                          {item.failureRate.toFixed(0)}%
                        </span>
                        {item.failureRate > 50 && (
                          <Badge variant="destructive">High Failure</Badge>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${item.failureRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {criteriaFailureRates.filter(c => c.failureRate > 50).length > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Recommendation:</strong> {criteriaFailureRates.filter(c => c.failureRate > 50).length} criteria have high failure rates (&gt;50%). Consider reviewing these requirements with stakeholders.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyst Performance Comparison</CardTitle>
              <CardDescription>
                Review workload and average scores by analyst
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analystPerformance.map((item) => (
                  <div key={item.analyst.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium">{item.analyst.name}</h4>
                      <p className="text-sm text-gray-600">{item.analyst.email}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600">Applications Reviewed</p>
                      <p className="text-2xl font-bold">{item.reviewed}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600">Avg Score</p>
                      <p className="text-2xl font-bold">{item.avgScore.toFixed(0)}%</p>
                    </div>

                    {item.avgScore > avgScore && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Above Average
                      </Badge>
                    )}
                  </div>
                ))}

                {analystPerformance.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No analyst data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}