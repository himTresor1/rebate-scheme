import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Eye, Filter } from 'lucide-react';
import { User } from '../../utils/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { QAReview } from './QAReview';
import { Greeting } from '../ui/Greeting';
import { LeaseReviewView } from './LeaseReviewView';
import { RebateStatusView } from '../asset-financier/RebateStatusView';
import { RebateReassignmentPipeline } from './RebateReassignmentPipeline';
import { WeeklyDisbursementReport } from './WeeklyDisbursementReport';
import { PageHeader } from '../PageHeader';
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
  const motorcycleBrand = app.motorcycleBrand || ['Bbox', 'Spiro', 'Ampersand'][index % 3];
  const motorcycleModel = app.motorcycleModel || `Model-${index + 1}`;
  const createdAt = app.createdAt || new Date().toISOString();
  return {
    ...app,
    applicantName,
    nationalId: app.nationalId || `11990${(1000000000 + index).toString()}`,
    phoneNumber: app.phoneNumber || `+25078890${(1000 + index).toString()}`,
    email: app.email || `${applicantName.toLowerCase().replace(/\s+/g, '.')}@demo.rw`,
    motorcycleBrand,
    motorcycleModel,
    chassisNumber: app.chassisNumber || `VIN-${(10000 + index).toString()}`,
    purchasePrice: app.purchasePrice || `${3500000 + index * 100000}`,
    loanAmount: app.loanAmount || `${3000000 + index * 90000}`,
    monthlyRepayment: app.monthlyRepayment || `${140000 + index * 5000}`,
    eligibilityCheck: app.eligibilityCheck || {
      nationalIdCheck: { gender: index % 2 === 0 ? 'Male' : 'Female', dateOfBirth: '1992-04-12' },
    },
    documents: app.documents && app.documents.length > 0 ? app.documents : [
      {
        name: 'National ID Document',
        type: 'pdf',
        url: '/mock/documents/national-id.pdf',
        uploadedAt: createdAt,
        verified: true,
      },
      {
        name: 'Driver License',
        type: 'pdf',
        url: '/mock/documents/driver-license.pdf',
        uploadedAt: createdAt,
        verified: true,
      },
      {
        name: 'Affidavit of Financial Need',
        type: 'pdf',
        url: '/mock/documents/affidavit.pdf',
        uploadedAt: createdAt,
        verified: true,
      },
      {
        name: 'AF Confirmation of Financial Need',
        type: 'pdf',
        url: '/mock/documents/af-confirmation.pdf',
        uploadedAt: createdAt,
        verified: true,
      },
      {
        name: 'Mobile Money Statement',
        type: 'pdf',
        url: '/mock/documents/mobile-money.pdf',
        uploadedAt: createdAt,
        verified: false,
      },
    ],
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
        reviewedAt: new Date(Date.now() - 86400000).toISOString(),
        notes: 'Forwarded for weekly QA decision capture.',
      },
    ],
  };
}

export function QADashboard({ user, currentPage }: QADashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [sortBy, setSortBy] = useState<string>('score');
  const [query, setQuery] = useState('');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterWomen, setFilterWomen] = useState('all');
  const [filterRetrofit, setFilterRetrofit] = useState('all');
  const [filterFinancier, setFilterFinancier] = useState('all');
  const [filterProvider, setFilterProvider] = useState('all');
  const [qaDecisions, setQaDecisions] = useState<Record<string, QaDecision>>({});

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
      const enriched = (qaApps as any[]).map((app, idx) => enrichQaApplication(app, idx));
      setApplications(enriched as Application[]);

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

  const handleReviewComplete = () => {
    setSelectedApp(null);
    loadApplications();
  };

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

  const providers = Array.from(new Set(applications.map((a: any) => a.motorcycleBrand).filter(Boolean))) as string[];
  const financiers = Array.from(new Set(applications.map((a) => a.companyName)));
  const filteredApps = sortedApps.filter((app: any) => {
    const days = Math.floor((Date.now() - new Date(app.lastReviewedAt || app.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const isWoman = app.eligibilityCheck?.nationalIdCheck?.gender === 'Female';
    const isRetrofit = Boolean(app.isRetrofit);
    const provider = (app.motorcycleBrand || '').toLowerCase();
    const registration = (app.registrationNumber || '').toLowerCase();
    const name = (app.applicantName || app.companyName || '').toLowerCase();
    const q = query.toLowerCase();

    if (q && !name.includes(q) && !registration.includes(q) && !app.id.toLowerCase().includes(q)) return false;
    if (filterDateRange === 'day' && days > 1) return false;
    if (filterDateRange === 'week' && days > 7) return false;
    if (filterDateRange === 'month' && days > 30) return false;
    if (filterDateRange === 'year' && days > 365) return false;
    if (filterWomen === 'yes' && !isWoman) return false;
    if (filterWomen === 'no' && isWoman) return false;
    if (filterRetrofit === 'yes' && !isRetrofit) return false;
    if (filterRetrofit === 'no' && isRetrofit) return false;
    if (filterFinancier !== 'all' && app.companyName !== filterFinancier) return false;
    if (filterProvider !== 'all' && provider !== filterProvider.toLowerCase()) return false;
    return true;
  });

  const pendingReview = filteredApps.filter(app => !qaDecisions[app.id]);
  const reviewedCount = Object.keys(qaDecisions).length;
  const womenCount = filteredApps.filter((app: any) => app.eligibilityCheck?.nationalIdCheck?.gender === 'Female').length;
  const retrofitCount = filteredApps.filter((app: any) => app.isRetrofit).length;
  const noPossessionCount = filteredApps.filter((app) => ['approved-pending-lease', 'payment-processed'].includes(app.status)).length;
  const reviewedAmount = filteredApps
    .filter((app) => qaDecisions[app.id])
    .reduce((sum, app) => sum + (parseFloat(app.rebateAmount || '0') || 0), 0);
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

  return (
    <div className="container mx-auto max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8">
      <PageHeader />
      <Greeting name={user.name || 'Rebate Manager'} />
      <h1 className="text-lg sm:text-xl text-[#023F40] mt-6">RGF Quality Assurance Team: Review Page</h1>
      <p className="text-sm text-gray-600 mt-1">
        QA Team checks rebates, records decisions during the week, and submits weekly disbursement decisions to the next stage.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Awaiting Q&A review</p><p className="text-2xl font-bold text-[#023F40]">{pendingReview.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Total rebate amount reviewed</p><p className="text-2xl font-bold text-[#023F40]">RWF {Math.round(reviewedAmount).toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Total rebates reviewed to date</p><p className="text-2xl font-bold text-[#023F40]">{reviewedCount}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Of which women</p><p className="text-2xl font-bold text-[#023F40]">{womenCount}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Of which retrofits</p><p className="text-2xl font-bold text-[#023F40]">{retrofitCount}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Individuals without e-moto</p><p className="text-2xl font-bold text-[#023F40]">{noPossessionCount}</p></CardContent></Card>
      </div>

      <Card className="mt-6 mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Filter className="w-4 h-4" />Multiple Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Input placeholder="Search ticket/applicant..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger><SelectValue placeholder="Sort By" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Eligibility Score (High to Low)</SelectItem>
              <SelectItem value="date">Review Date</SelectItem>
              <SelectItem value="amount">Rebate Amount</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterDateRange} onValueChange={setFilterDateRange}>
            <SelectTrigger><SelectValue placeholder="Date range" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All dates</SelectItem>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterWomen} onValueChange={setFilterWomen}>
            <SelectTrigger><SelectValue placeholder="Women" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="yes">Women only</SelectItem><SelectItem value="no">Non-women</SelectItem></SelectContent>
          </Select>
          <Select value={filterRetrofit} onValueChange={setFilterRetrofit}>
            <SelectTrigger><SelectValue placeholder="Retrofit" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="yes">Retrofit only</SelectItem><SelectItem value="no">Non-retrofit</SelectItem></SelectContent>
          </Select>
          <Select value={filterFinancier} onValueChange={setFilterFinancier}>
            <SelectTrigger><SelectValue placeholder="Asset financier" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All financiers</SelectItem>
              {financiers.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterProvider} onValueChange={setFilterProvider}>
            <SelectTrigger><SelectValue placeholder="E-moto provider" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All providers</SelectItem>
              {providers.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="mb-4 flex w-full justify-end">
        <Button onClick={handleSubmitDecisions} className="bg-[#023F40] hover:bg-[#035f60] max-w-full">
          Submit Decisions
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[#023F40]">Default Report For Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="pb-3 pr-3">Ticket No.</th>
                  <th className="pb-3 pr-3">Applicant Name</th>
                  <th className="pb-3 pr-3">Woman</th>
                  <th className="pb-3 pr-3">Retrofit</th>
                  <th className="pb-3 pr-3">Asset Financier</th>
                  <th className="pb-3 pr-3">E-Moto Provider</th>
                  <th className="pb-3 pr-3">Retail Cost (RWF)</th>
                  <th className="pb-3 pr-3">Rebate amount</th>
                  <th className="pb-3 pr-3">QA Team Approval</th>
                  <th className="pb-3">Issues for follow-up</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app: any) => {
                  const decision = qaDecisions[app.id];
                  return (
                    <tr key={app.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedApp(app)}>
                      <td className="py-3 pr-3 font-semibold text-[#023F40]">{(app.ticketNumber || app.registrationNumber || app.id).toString().replace('application:', '').slice(0, 8).toUpperCase()}</td>
                      <td className="py-3 pr-3">{app.applicantName || app.companyName}</td>
                      <td className="py-3 pr-3">{app.eligibilityCheck?.nationalIdCheck?.gender === 'Female' ? 'Yes' : 'No'}</td>
                      <td className="py-3 pr-3">{app.isRetrofit ? 'Yes' : 'No'}</td>
                      <td className="py-3 pr-3">{app.companyName}</td>
                      <td className="py-3 pr-3">{app.motorcycleBrand || 'N/A'}</td>
                      <td className="py-3 pr-3">{parseFloat(app.purchasePrice || '0').toLocaleString()}</td>
                      <td className="py-3 pr-3">{parseFloat(app.rebateAmount || '0').toLocaleString()}</td>
                      <td className="py-3 pr-3">
                        {decision ? (
                          <div className="space-y-1">
                            <Badge className={decision.decision === 'approve' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {decision.decision === 'approve' ? 'Approved' : 'Rejected'}
                            </Badge>
                            <p className="text-xs text-gray-500">{new Date(decision.timestamp).toLocaleString()}</p>
                          </div>
                        ) : (
                          <Badge variant="outline">Pending Review</Badge>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-sm text-gray-600">{decision?.reason || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">Click any row to open the application and use Review to capture QA decision.</p>
        </CardContent>
      </Card>
    </div>
  );
}