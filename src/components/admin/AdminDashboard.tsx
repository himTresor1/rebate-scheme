import { useState, useEffect } from 'react';
import { FileText, Users, CheckCircle, TrendingUp, ArrowUp, Settings, Shield, Key, ScrollText, Building2, GitBranch } from 'lucide-react';
import { ApplicationManager } from './ApplicationManager';
import { CriteriaManager } from './CriteriaManager';
import { UserManager } from './UserManager';
import { RoleManagement } from './RoleManagement';
import { PermissionManagement } from './PermissionManagement';
import { AuditLogs } from './AuditLogs';
import { PendingRegistrations } from './PendingRegistrations';
import { InvitationManager } from './InvitationManager';
import { WorkflowManager } from './WorkflowManager';
import { NotificationsView } from '../NotificationsView';
import { DashboardStatsSkeleton, QuickActionsGridSkeleton } from '../ui/skeletons';
import type { User } from '../../types/auth';
import { Greeting } from '../ui/Greeting';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'motion/react';
import { ProfileSettings } from '../ProfileSettings';
import { PageHeader } from '../PageHeader';

interface AdminDashboardProps {
  user: User;
  currentPage: string;
  onNavigate?: (page: string) => void;
}

export function AdminDashboard({ user, currentPage, onNavigate }: AdminDashboardProps) {
  const [loading, setLoading] = useState(true);
  const isAdmin = user.role === 'SYSTEM_ADMIN' || user.role === 'admin';

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [currentPage]);

  // Render based on current page
  const renderContent = () => {
    switch (currentPage) {
      case 'notifications':
        return <NotificationsView user={user} />;
      case 'applications':
        return <ApplicationManager user={user} />;
      case 'criteria':
        return <CriteriaManager />;
      case 'users':
        return <UserManager />;
      case 'roles':
        return isAdmin ? <RoleManagement /> : <div>Access Denied</div>;
      case 'permissions':
        return isAdmin ? <PermissionManagement /> : <div>Access Denied</div>;
      case 'audit':
        return isAdmin ? <AuditLogs /> : <div>Access Denied</div>;
      case 'pending-registrations':
        return isAdmin ? <PendingRegistrations /> : <div>Access Denied</div>;
      case 'invitations':
        return isAdmin ? <InvitationManager /> : <div>Access Denied</div>;
      case 'workflows':
        return <WorkflowManager user={user} />;
      case 'profile':
        return <ProfileSettings user={user} onUpdate={async (updates) => {
          // Handle profile update
          console.log('Profile update:', updates);
        }} />;
      case 'dashboard':
      default:
        if (loading) {
          return (
            <div>
              <Greeting name={user.name} className="mb-6" />
              <DashboardStatsSkeleton />
              <div className="mt-6"><QuickActionsGridSkeleton actions={7} /></div>
            </div>
          );
        }

        // Sample data for charts
        const monthlyData = [
          { month: 'Jan', applications: 45, approved: 35, rejected: 5 },
          { month: 'Feb', applications: 52, approved: 40, rejected: 7 },
          { month: 'Mar', applications: 61, approved: 48, rejected: 6 },
          { month: 'Apr', applications: 70, approved: 55, rejected: 8 },
          { month: 'May', applications: 85, approved: 67, rejected: 10 },
          { month: 'Jun', applications: 95, approved: 75, rejected: 12 },
        ];

        const weeklyTrend = [
          { day: 'Mon', count: 12 },
          { day: 'Tue', count: 18 },
          { day: 'Wed', count: 15 },
          { day: 'Thu', count: 22 },
          { day: 'Fri', count: 19 },
          { day: 'Sat', count: 8 },
          { day: 'Sun', count: 5 },
        ];

        const statusData = [
          { name: 'Approved', value: 654, color: '#023F40' },
          { name: 'Pending', value: 127, color: '#4a7c7d' },
          { name: 'Rejected', value: 66, color: '#9ca3af' },
        ];

        return (
          <div>
            {/* Greeting */}
            <Greeting name={user.name} className="mb-6" />

            {/* Stats Grid - Responsive 2x2 on Mobile, 4 across on Desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-[#023F40] to-[#035f60] p-3 sm:p-4 rounded-xl shadow-md text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-1 rounded-md">
                    <ArrowUp className="w-3 h-3" />
                    12%
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold mb-0.5">847</p>
                <p className="text-white/80 text-xs">Total Apps</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-[#023F40] to-[#035f60] p-3 sm:p-4 rounded-xl shadow-md text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-1 rounded-md">
                    <ArrowUp className="w-3 h-3" />
                    8%
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold mb-0.5">127</p>
                <p className="text-white/80 text-xs">Pending</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-[#023F40] to-[#035f60] p-3 sm:p-4 rounded-xl shadow-md text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-1 rounded-md">
                    <ArrowUp className="w-3 h-3" />
                    15%
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold mb-0.5">654</p>
                <p className="text-white/80 text-xs">Approved</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-[#023F40] to-[#035f60] p-3 sm:p-4 rounded-xl shadow-md text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-1 rounded-md">
                    <ArrowUp className="w-3 h-3" />
                    5%
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold mb-0.5">42</p>
                <p className="text-white/80 text-xs">Active Users</p>
              </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Application Trend Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Application Trend</h3>
                    <p className="text-sm text-gray-500">Last 6 months</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-[#023F40]"></div>
                      <span className="text-gray-600">Total</span>
                    </span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart 
                    data={monthlyData.map((item, idx) => ({ ...item, id: `month-${idx}` }))}
                    id="admin-trend-area-chart"
                  >
                    <defs>
                      <linearGradient id="colorApplicationsTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#023F40" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#023F40" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="applications" 
                      stroke="#023F40" 
                      strokeWidth={3}
                      fill="url(#colorApplicationsTrend)" 
                      name="Applications"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Weekly Applications Bar Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">This Week</h3>
                    <p className="text-sm text-gray-500">Daily submissions</p>
                  </div>
                  <div className="px-3 py-1 bg-[#023F40]/10 text-[#023F40] rounded-lg text-sm font-medium">
                    99 total
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart 
                    data={weeklyTrend.map((item, idx) => ({ ...item, id: `day-${idx}` }))}
                    id="admin-weekly-bar-chart"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#023F40" 
                      radius={[8, 8, 0, 0]} 
                      name="Daily Count"
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Status Distribution - 60/40 Split */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
              {/* Line Chart - 60% */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-1">Application Status Distribution</h3>
                  <p className="text-sm text-gray-500">Performance over time</p>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart 
                    data={monthlyData.map((item, idx) => ({ ...item, id: `status-${idx}` }))}
                    id="admin-status-line-chart"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="applications" 
                      stroke="#023F40" 
                      strokeWidth={2}
                      dot={{ fill: '#023F40', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Total Applications"
                      isAnimationActive={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="approved" 
                      stroke="#4a7c7d" 
                      strokeWidth={2}
                      dot={{ fill: '#4a7c7d', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Approved"
                      isAnimationActive={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rejected" 
                      stroke="#9ca3af" 
                      strokeWidth={2}
                      dot={{ fill: '#9ca3af', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Rejected"
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Pie Chart - 40% */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-1">Current Status</h3>
                  <p className="text-sm text-gray-500">Total: 847 applications</p>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart id="admin-status-pie-chart">
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`status-cell-${entry.name}-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                <button 
                  onClick={() => onNavigate?.('applications')}
                  className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#023F40] hover:bg-gray-50 text-left transition-all group"
                >
                  <FileText className="w-4 h-4 text-[#023F40] flex-shrink-0" />
                  <span className="font-medium text-gray-900 text-sm">All Applications</span>
                </button>
                <button 
                  onClick={() => onNavigate?.('criteria')}
                  className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#023F40] hover:bg-gray-50 text-left transition-all group"
                >
                  <Settings className="w-4 h-4 text-[#023F40] flex-shrink-0" />
                  <span className="font-medium text-gray-900 text-sm">Eligibility Criteria</span>
                </button>
                <button 
                  onClick={() => onNavigate?.('users')}
                  className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#023F40] hover:bg-gray-50 text-left transition-all group"
                >
                  <Users className="w-4 h-4 text-[#023F40] flex-shrink-0" />
                  <span className="font-medium text-gray-900 text-sm">User Management</span>
                </button>
                <button 
                  onClick={() => onNavigate?.('roles')}
                  className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#023F40] hover:bg-gray-50 text-left transition-all group"
                >
                  <Shield className="w-4 h-4 text-[#023F40] flex-shrink-0" />
                  <span className="font-medium text-gray-900 text-sm">Roles</span>
                </button>
                <button 
                  onClick={() => onNavigate?.('permissions')}
                  className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#023F40] hover:bg-gray-50 text-left transition-all group"
                >
                  <Key className="w-4 h-4 text-[#023F40] flex-shrink-0" />
                  <span className="font-medium text-gray-900 text-sm">Permissions</span>
                </button>
                <button 
                  onClick={() => onNavigate?.('audit')}
                  className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#023F40] hover:bg-gray-50 text-left transition-all group"
                >
                  <ScrollText className="w-4 h-4 text-[#023F40] flex-shrink-0" />
                  <span className="font-medium text-gray-900 text-sm">Audit Logs</span>
                </button>
                <button 
                  onClick={() => onNavigate?.('pending-registrations')}
                  className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#023F40] hover:bg-gray-50 text-left transition-all group"
                >
                  <Building2 className="w-4 h-4 text-[#023F40] flex-shrink-0" />
                  <span className="font-medium text-gray-900 text-sm">Pending Registrations</span>
                </button>
                <button 
                  onClick={() => onNavigate?.('invitations')}
                  className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#023F40] hover:bg-gray-50 text-left transition-all group"
                >
                  <Building2 className="w-4 h-4 text-[#023F40] flex-shrink-0" />
                  <span className="font-medium text-gray-900 text-sm">Invitations</span>
                </button>
                <button 
                  onClick={() => onNavigate?.('workflows')}
                  className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#023F40] hover:bg-gray-50 text-left transition-all group"
                >
                  <GitBranch className="w-4 h-4 text-[#023F40] flex-shrink-0" />
                  <span className="font-medium text-gray-900 text-sm">Workflow Management</span>
                </button>
              </div>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader />
      {renderContent()}
    </div>
  );
}