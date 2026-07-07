import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { InternalUserManagement } from './InternalUserManagement';
import { ApplicationsOverview } from './ApplicationsOverview';
import { SubmitApplicationForm } from './SubmitApplicationForm';
import { RebateStatusView } from './RebateStatusView';
import { PossessionConfirmationView } from './PossessionConfirmationView';
import { MarketingProposalForm } from './MarketingProposalForm';
import { AfPermissionsView } from './AfPermissionsView';
import { ClientTransferForm } from './ClientTransferForm';
import { RebateBackgroundInfo } from './RebateBackgroundInfo';
import { RepaymentTracking } from './RepaymentTracking';
import { NotificationsView } from '../NotificationsView';
import { User } from '../../utils/auth';
import { Greeting } from '../ui/Greeting';
import { PageHeader } from '../PageHeader';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { 
  Users, 
  FileText, 
  Shield, 
  Settings, 
  ArrowUp, 
  UserPlus, 
  DollarSign,
  TrendingUp,
  Download,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Skeleton components for loading states
function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-gray-200 animate-pulse h-32 rounded-xl" />
      ))}
    </div>
  );
}

function QuickActionsGridSkeleton({ actions }: { actions: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: actions }).map((_, i) => (
        <div key={i} className="bg-gray-200 animate-pulse h-12 rounded-lg" />
      ))}
    </div>
  );
}

// Asset Financier Admin Dashboard Component
interface AssetFinancierAdminDashboardProps {
  user: User;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function AssetFinancierAdminDashboard({ 
  user, 
  currentPage,
  onNavigate 
}: AssetFinancierAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'applications' | 'submit' | 'repayment' | 'rebate-status' | 'possession' | 'marketing-proposal' | 'af-permissions' | 'client-transfer' | 'background-info'
  >('overview');
  const [loading, setLoading] = useState(true);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [targetAppId, setTargetAppId] = useState<string | null>(null);

  // Debug logging
  console.log('AssetFinancierAdminDashboard rendering for user:', user);
  console.log('Active tab:', activeTab);
  console.log('Current page from sidebar:', currentPage);

  // Chart data with unique IDs
  const trendChartData = [
    { id: 'af-trend-jul', month: 'Jul', applications: 12, approved: 8, rejected: 2, pending: 2 },
    { id: 'af-trend-aug', month: 'Aug', applications: 18, approved: 14, rejected: 2, pending: 2 },
    { id: 'af-trend-sep', month: 'Sep', applications: 15, approved: 10, rejected: 3, pending: 2 },
    { id: 'af-trend-oct', month: 'Oct', applications: 22, approved: 16, rejected: 4, pending: 2 },
    { id: 'af-trend-nov', month: 'Nov', applications: 28, approved: 20, rejected: 5, pending: 3 },
    { id: 'af-trend-dec', month: 'Dec', applications: 25, approved: 15, rejected: 3, pending: 7 }
  ];

  const rebateAmountData = [
    { id: 'af-rebate-jul', month: 'Jul', amount: 4200000 },
    { id: 'af-rebate-aug', month: 'Aug', amount: 5800000 },
    { id: 'af-rebate-sep', month: 'Sep', amount: 4900000 },
    { id: 'af-rebate-oct', month: 'Oct', amount: 7100000 },
    { id: 'af-rebate-nov', month: 'Nov', amount: 8900000 },
    { id: 'af-rebate-dec', month: 'Dec', amount: 7500000 }
  ];

  const statusDistributionData = [
    { id: 'af-status-approved', name: 'Approved', value: 45, color: '#10b981' },
    { id: 'af-status-review', name: 'Under Review', value: 25, color: '#023F40' },
    { id: 'af-status-pending', name: 'Pending', value: 20, color: '#f59e0b' },
    { id: 'af-status-rejected', name: 'Rejected', value: 10, color: '#ef4444' }
  ];

  // Sync activeTab with currentPage from sidebar
  useEffect(() => {
    const pageToTabMap: Record<string, typeof activeTab> = {
      'dashboard': 'overview',
      'internal-users': 'users',
      'applications': 'applications',
      'submit': 'submit',
      'repayment': 'repayment',
      'rebate-status': 'rebate-status',
      'possession': 'possession',
      'marketing-proposal': 'marketing-proposal',
      'af-permissions': 'af-permissions',
      'client-transfer': 'client-transfer',
      'background-info': 'background-info',
    };
    
    const newTab = pageToTabMap[currentPage] || 'overview';
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [currentPage, activeTab]);

  useEffect(() => {
    // Simulate loading data when tab changes
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const stats = {
    totalStaff: 12,
    activeApplications: 145,
    approvedApplications: 89,
    pendingReview: 34
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'notifications' && (
          <NotificationsView 
            user={user}
            onAction={(data) => {
              if (data.type === 'open-application') {
                setTargetAppId(data.appId);
                setActiveTab('applications');
                onNavigate('applications');
              }
            }}
          />
        )}
        
        {activeTab === 'overview' && currentPage === 'dashboard' && (
          <div className="space-y-6">
            {loading ? (
              <>
                <Greeting name={user.name} className="mb-6" />
                <DashboardStatsSkeleton />
                <QuickActionsGridSkeleton actions={3} />
              </>
            ) : (
              <>
                {/* Greeting */}
                <Greeting name={user.name} />
                
                <h1 className="text-lg sm:text-xl text-[#023F40] mt-6">Asset Financier Admin</h1>

                {/* Stats Grid - 2x2 on mobile, 4 across on desktop */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-[#023F40] to-[#035f60] p-4 rounded-xl shadow-md text-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-1 rounded-md">
                        <ArrowUp className="w-3 h-3" />
                        0%
                      </div>
                    </div>
                    <p className="text-3xl font-bold mb-0.5">{stats.totalStaff}</p>
                    <p className="text-white/80 text-xs">Total Staff</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-[#023F40] to-[#035f60] p-4 rounded-xl shadow-md text-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-1 rounded-md">
                        <ArrowUp className="w-3 h-3" />
                        0%
                      </div>
                    </div>
                    <p className="text-3xl font-bold mb-0.5">{stats.activeApplications}</p>
                    <p className="text-white/80 text-xs">Active Applications</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-[#023F40] to-[#035f60] p-4 rounded-xl shadow-md text-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-1 rounded-md">
                        <ArrowUp className="w-3 h-3" />
                        0%
                      </div>
                    </div>
                    <p className="text-3xl font-bold mb-0.5">{stats.approvedApplications}</p>
                    <p className="text-white/80 text-xs">Approved</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-[#023F40] to-[#035f60] p-4 rounded-xl shadow-md text-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Settings className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-1 rounded-md">
                        <ArrowUp className="w-3 h-3" />
                        0%
                      </div>
                    </div>
                    <p className="text-3xl font-bold mb-0.5">{stats.pendingReview}</p>
                    <p className="text-white/80 text-xs">Pending Review</p>
                  </motion.div>
                </div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="mb-4 font-semibold text-gray-900">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button
                      onClick={() => {
                        setActiveTab('submit');
                        onNavigate('submit');
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#023F40] hover:bg-gray-50 text-left transition-all group"
                    >
                      <UserPlus className="w-4 h-4 text-[#023F40] flex-shrink-0" />
                      <span className="font-medium text-gray-900 text-sm">Submit Application</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('applications');
                        onNavigate('applications');
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#023F40] hover:bg-gray-50 text-left transition-all group"
                    >
                      <FileText className="w-4 h-4 text-[#023F40] flex-shrink-0" />
                      <span className="font-medium text-gray-900 text-sm">View Applications</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('users');
                        onNavigate('internal-users');
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#023F40] hover:bg-gray-50 text-left transition-all group"
                    >
                      <Users className="w-4 h-4 text-[#023F40] flex-shrink-0" />
                      <span className="font-medium text-gray-900 text-sm">Manage Staff</span>
                    </button>

                    <button
                      onClick={() => setShowReportDialog(true)}
                      className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#023F40] hover:bg-gray-50 text-left transition-all group"
                    >
                      <Download className="w-4 h-4 text-[#023F40] flex-shrink-0" />
                      <span className="font-medium text-gray-900 text-sm">Download Reports</span>
                    </button>
                  </div>
                </motion.div>

                {/* Document Templates */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h2 className="mb-4 font-semibold text-gray-900">Document Templates</h2>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-600 mb-4">
                      Download required templates for application submission
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <button
                        onClick={() => {
                          toast.success('Downloading Affidavit Template...');
                          // Simulate download
                          setTimeout(() => {
                            const link = document.createElement('a');
                            link.href = '#';
                            link.download = 'Affidavit_Template.pdf';
                            toast.info('Template download started');
                          }, 500);
                        }}
                        className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#023F40] hover:bg-[#023F40]/5 text-left transition-all group"
                      >
                        <Download className="w-5 h-5 text-[#023F40] flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Affidavit</p>
                          <p className="text-xs text-gray-500">PDF Template</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          toast.success('Downloading Co-op Reference Template...');
                          setTimeout(() => {
                            toast.info('Template download started');
                          }, 500);
                        }}
                        className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#023F40] hover:bg-[#023F40]/5 text-left transition-all group"
                      >
                        <Download className="w-5 h-5 text-[#023F40] flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Co-op Reference</p>
                          <p className="text-xs text-gray-500">PDF Template</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          toast.success('Downloading Personal Reference Letter Template...');
                          setTimeout(() => {
                            toast.info('Template download started');
                          }, 500);
                        }}
                        className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#023F40] hover:bg-[#023F40]/5 text-left transition-all group"
                      >
                        <Download className="w-5 h-5 text-[#023F40] flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Personal Reference Letter</p>
                          <p className="text-xs text-gray-500">PDF Template</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          toast.success('Downloading Engine Disposal Agreement Template...');
                          setTimeout(() => {
                            toast.info('Template download started');
                          }, 500);
                        }}
                        className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#023F40] hover:bg-[#023F40]/5 text-left transition-all group"
                      >
                        <Download className="w-5 h-5 text-[#023F40] flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Engine Disposal Agreement</p>
                          <p className="text-xs text-gray-500">PDF Template</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          toast.success('Downloading E-Moto Company Retrofit Agreement Template...');
                          setTimeout(() => {
                            toast.info('Template download started');
                          }, 500);
                        }}
                        className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#023F40] hover:bg-[#023F40]/5 text-left transition-all group"
                      >
                        <Download className="w-5 h-5 text-[#023F40] flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">E-Moto Company Retrofit Agreement</p>
                          <p className="text-xs text-gray-500">PDF Template</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Analytics & Charts */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-6"
                >
                  <h2 className="font-semibold text-gray-900">Application Analytics</h2>
                  
                  {/* Application Trends Chart */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-1">Application Submission Trends</h3>
                      <p className="text-sm text-gray-500">Monthly application volume over the past 6 months</p>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={trendChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        id="financier-trend-line-chart"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="applications" 
                          stroke="#023F40" 
                          strokeWidth={2}
                          dot={{ fill: '#023F40', r: 4 }}
                          name="Total Submitted"
                          isAnimationActive={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="approved" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981', r: 4 }}
                          name="Approved"
                          isAnimationActive={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="pending" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          dot={{ fill: '#f59e0b', r: 4 }}
                          name="Pending"
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Rebate Amount & Status Distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Rebate Amount by Month */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-1">Rebate Amount Disbursed</h3>
                        <p className="text-sm text-gray-500">Monthly rebate disbursements (RWF)</p>
                      </div>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart
                          data={rebateAmountData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          id="financier-rebate-bar-chart"
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" stroke="#6b7280" />
                          <YAxis 
                            stroke="#6b7280"
                            tickFormatter={(value: number) => `${(value / 1000000).toFixed(1)}M`}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            formatter={(value: any) => [
                              new Intl.NumberFormat('en-RW', {
                                style: 'currency',
                                currency: 'RWF',
                                minimumFractionDigits: 0
                              }).format(value),
                              'Rebate Amount'
                            ]}
                          />
                          <Bar dataKey="amount" fill="#023F40" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Application Status Distribution */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-1">Application Status Distribution</h3>
                        <p className="text-sm text-gray-500">Current status breakdown</p>
                      </div>
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart id="financier-status-pie-chart">
                          <Pie
                            data={statusDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }: { name: string, percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            isAnimationActive={false}
                          >
                            {statusDistributionData.map((entry, index) => (
                              <Cell key={`financier-status-${entry.name}-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-gradient-to-br from-[#023F40] to-[#035f60] p-6 rounded-xl shadow-md text-white">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold">Performance Highlights</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-white/70 text-sm mb-1">Approval Rate</p>
                        <p className="text-2xl font-bold">82%</p>
                        <p className="text-white/60 text-xs mt-1">+5% from last month</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-sm mb-1">Avg. Processing Time</p>
                        <p className="text-2xl font-bold">12 days</p>
                        <p className="text-white/60 text-xs mt-1">-3 days improvement</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-sm mb-1">Total Rebates (2024)</p>
                        <p className="text-2xl font-bold">RWF 42.4M</p>
                        <p className="text-white/60 text-xs mt-1">120 applications funded</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        )}

        {activeTab === 'users' && <InternalUserManagement organizationId={user.assetFinancierId || user.organizationId || user.id} />}
        {activeTab === 'applications' && (
          <ApplicationsOverview 
            organizationId={user.assetFinancierId || user.organizationId || user.id}
            onNavigateToSubmit={() => {
              setActiveTab('submit');
              onNavigate('submit');
            }}
            autoOpenAppId={targetAppId}
            onClearAutoOpen={() => setTargetAppId(null)}
          />
        )}
        {activeTab === 'submit' && <SubmitApplicationForm organizationId={user.assetFinancierId || user.organizationId || user.id} />}
        {activeTab === 'rebate-status' && <RebateStatusView />}
        {activeTab === 'possession' && <PossessionConfirmationView />}
        {activeTab === 'marketing-proposal' && <MarketingProposalForm organizationName={user.organization || 'your AF'} />}
        {activeTab === 'af-permissions' && <AfPermissionsView />}
        {activeTab === 'client-transfer' && <ClientTransferForm />}
        {activeTab === 'background-info' && <RebateBackgroundInfo />}
        {activeTab === 'repayment' && <RepaymentTracking organizationId={user.assetFinancierId || user.organizationId || user.id} />}
      </div>

      {/* Download Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#023F40]">Download Standard Report</DialogTitle>
            <DialogDescription>
              Generate a comprehensive report containing real-time dashboard analytics and application data.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-100">
              <h4 className="font-semibold text-sm text-gray-900 mb-2">Report Contents:</h4>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#023F40] mt-0.5" />
                <span className="text-sm text-gray-600">Date of report generation</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#023F40] mt-0.5" />
                <span className="text-sm text-gray-600">Dashboard graphs and analytics</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#023F40] mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p>List of applications including:</p>
                  <ul className="list-disc pl-4 mt-1 text-gray-500 space-y-0.5">
                    <li>Applicant Name</li>
                    <li>Proposed Rebate Amount</li>
                    <li>Date Submitted</li>
                    <li>Current Status</li>
                    <li>Who Submitted Application</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)} disabled={isDownloading}>
              Cancel
            </Button>
            <Button 
              className="bg-[#023F40] hover:bg-[#035f60]"
              disabled={isDownloading}
              onClick={() => {
                setIsDownloading(true);
                setTimeout(() => {
                  toast.success('Report Downloaded Successfully!', {
                    description: 'The report has been saved as Standard_Report.pdf'
                  });
                  setIsDownloading(false);
                  setShowReportDialog(false);
                }, 2000);
              }}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}