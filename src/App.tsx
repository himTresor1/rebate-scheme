import { useState, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { AuthWrapper } from './components/auth/AuthWrapper';
import { Sidebar } from './components/Sidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ApplicantDashboard } from './components/applicant/ApplicantDashboard';
import { AnalystDashboard } from './components/analyst/AnalystDashboard';
import { QADashboard as RebateManagerDashboard } from './components/qa/QADashboard';
import { CFODashboard as ProgramManagerDashboard } from './components/cfo/CFODashboard';
import { FinanceDashboard } from './components/finance/FinanceDashboard';
import { ManagementDashboard as ExternalReviewerDashboard } from './components/management/ManagementDashboard';
import { ManagementDashboard } from './components/management/ManagementDashboard';
import { AssetFinancierAdminDashboard } from './components/asset-financier/AssetFinancierAdminDashboard';
import { NotificationsView } from './components/NotificationsView';
import { Demo } from './components/Demo';
import { authService, User } from './utils/auth';
import { Loader2 } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on the demo page
  const isDemo = window.location.pathname === '/demo';

  useEffect(() => {
    // Skip auth check if on demo page
    if (isDemo) {
      setLoading(false);
      return;
    }
    checkAuth();
    
    // Check if mobile and update on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      console.log('=== AUTH CHECK ===');
      console.log('Current user:', currentUser);
      console.log('User role:', currentUser?.role);
      console.log('==================');
      setUser(currentUser);
    } catch (error: any) {
      console.error('Auth check failed:', error);
      // Check if it's a refresh token error
      if (error?.message?.includes('refresh') || error?.message?.includes('Refresh Token')) {
        console.log('Refresh token expired - clearing session');
        try {
          const supabase = (await import('./utils/supabase/client')).createClient();
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error('Failed to sign out');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-[#023F40]" />
          </div>
          <div className="text-center">
            <h2 className="font-semibold text-gray-900 mb-1">Loading RGF Rebate System</h2>
            <p className="text-sm text-gray-600">Please wait while we prepare your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user && !isDemo) {
    return (
      <>
        <AuthWrapper onSuccess={checkAuth} />
        <Toaster />
      </>
    );
  }

  // Render demo page without authentication
  if (isDemo) {
    return (
      <>
        <Demo />
        <Toaster />
      </>
    );
  }

  // Debug: Log the user role
  console.log('Current user:', user);
  console.log('User role:', user?.role);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        onSignOut={handleSignOut} 
        onExpandedChange={setSidebarExpanded}
      />

      {/* Main Content */}
      <main 
        className={`
          flex-1 min-w-0 max-w-full overflow-x-hidden transition-all duration-300
          md:ml-[72px]
          ${sidebarExpanded ? 'md:ml-[240px]' : 'md:ml-[72px]'}
        `}
      >
        {user?.role === 'admin' && <AdminDashboard user={user} currentPage={currentPage} onNavigate={setCurrentPage} />}
        {user?.role === 'SYSTEM_ADMIN' && <AdminDashboard user={user} currentPage={currentPage} onNavigate={setCurrentPage} />}
        {user?.role === 'applicant' && <ApplicantDashboard user={user} currentPage={currentPage} />}
        {user?.role === 'ASSET_FINANCIER_ADMIN' && <AssetFinancierAdminDashboard user={user} currentPage={currentPage} onNavigate={setCurrentPage} />}
        {user?.role === 'CLAIMS_OFFICER' && <AssetFinancierAdminDashboard user={user} currentPage={currentPage} onNavigate={setCurrentPage} />}
        {user?.role === 'ASSET_FINANCIER_STAFF' && <AssetFinancierAdminDashboard user={user} currentPage={currentPage} onNavigate={setCurrentPage} />}
        {user?.role === 'ASSET_FINANCIER_OFFICER' && <AssetFinancierAdminDashboard user={user} currentPage={currentPage} onNavigate={setCurrentPage} />}
        {user?.role === 'analyst' && <AnalystDashboard user={user} currentPage={currentPage} onNavigate={setCurrentPage} />}
        {user?.role === 'REBATE_ANALYST' && <AnalystDashboard user={user} currentPage={currentPage} onNavigate={setCurrentPage} />}
        {user?.role === 'REBATE_MANAGER' && <RebateManagerDashboard user={user} currentPage={currentPage} onNavigate={setCurrentPage} />}
        {user?.role === 'E_MOTO_PROGRAM_MANAGER' && <ProgramManagerDashboard user={user} currentPage={currentPage} onNavigate={setCurrentPage} />}
        {user?.role === 'DESIGNATED_FINANCE_OFFICER' && <FinanceDashboard user={user} currentPage={currentPage} />}
        {user?.role === 'ME_TEAM' && <ExternalReviewerDashboard user={user} currentPage={currentPage} />}
        {user?.role === 'EXTERNAL_REVIEWER' && <ExternalReviewerDashboard user={user} currentPage={currentPage} />}
        
        {/* Fallback for unrecognized roles */}
        {!['admin', 'SYSTEM_ADMIN', 'applicant', 'ASSET_FINANCIER_ADMIN', 'CLAIMS_OFFICER', 'ASSET_FINANCIER_STAFF', 'ASSET_FINANCIER_OFFICER',
            'analyst', 'REBATE_ANALYST', 'REBATE_MANAGER', 'E_MOTO_PROGRAM_MANAGER', 
            'DESIGNATED_FINANCE_OFFICER', 'ME_TEAM', 'EXTERNAL_REVIEWER'].includes(user?.role) && (
          <div className="p-8">
            <div className="max-w-2xl mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-900 mb-2">⚠️ Role Not Configured</h2>
              <p className="text-yellow-800 mb-4">Your account role "{user?.role}" is not configured in the system.</p>
              <div className="bg-white p-4 rounded border border-yellow-200">
                <p className="text-sm text-gray-700 mb-2"><strong>Debug Information:</strong></p>
                <pre className="text-xs text-gray-600 overflow-auto">{JSON.stringify(user, null, 2)}</pre>
              </div>
              <p className="text-sm text-yellow-700 mt-4">
                <strong>To fix this:</strong>
              </p>
              <ol className="text-sm text-yellow-700 mt-2 ml-4 list-decimal space-y-1">
                <li>Sign out of the system</li>
                <li>Click "🎯 Seed Demo Data" on the login screen (bottom-left button)</li>
                <li>Wait for the success message</li>
                <li>Login with one of the new demo credentials:</li>
              </ol>
              <div className="bg-white p-3 rounded border border-yellow-200 mt-3">
                <p className="text-xs text-gray-700 font-semibold mb-2">Asset Financier Admins:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• <code className="bg-gray-100 px-1 rounded">admin@bankofkigali.rw</code> / <code className="bg-gray-100 px-1 rounded">BoK2024!</code></li>
                  <li>• <code className="bg-gray-100 px-1 rounded">admin@equitybank.rw</code> / <code className="bg-gray-100 px-1 rounded">Equity2024!</code></li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">See <code>/DEMO_CREDENTIALS.md</code> for all 13 demo accounts</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Toaster />
    </div>
  );
}