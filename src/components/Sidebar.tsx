import { motion } from 'motion/react';
import { 
  X, 
  Menu, 
  LogOut, 
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  Building2,
  Mail,
  Shield,
  Key,
  ScrollText,
  UserCircle,
  Landmark,
  FilePlus,
  Receipt,
  ClipboardList,
  CheckSquare,
  DollarSign,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Upload,
  Bike,
  Bell,
  GitBranch,
  Download,
} from 'lucide-react';
import { User } from '../utils/auth';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ProfileSettings } from './ProfileSettings';
import { getAfPermissionLevel } from '../utils/afPermissions';

interface SidebarProps {
  user: User;
  currentPage: string;
  onNavigate: (page: string) => void;
  onSignOut: () => void;
  onExpandedChange?: (expanded: boolean) => void;
  onUpdateProfile?: (updates: Partial<User>) => Promise<void>;
}

export function Sidebar({ user, currentPage, onNavigate, onSignOut, onExpandedChange, onUpdateProfile }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const toggleSidebar = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onExpandedChange?.(newState);
  };
  
  const handleNavigate = (page: string) => {
    onNavigate(page);
    // Close mobile menu after navigation
    setMobileMenuOpen(false);
  };

  const getMenuItems = () => {
    const role = user.role;
    
    // Map new roles to dashboard types
    const normalizedRole = 
      role === 'SYSTEM_ADMIN' ? 'admin' :
      role === 'ASSET_FINANCIER_ADMIN' ? 'applicant' :
      role === 'CLAIMS_OFFICER' ? 'applicant' :
      role === 'ASSET_FINANCIER_STAFF' ? 'applicant' :
      role === 'ASSET_FINANCIER_OFFICER' ? 'applicant' :
      role === 'REBATE_ANALYST' ? 'analyst' :
      role === 'REBATE_MANAGER' ? 'rebate-manager' :
      role === 'E_MOTO_PROGRAM_MANAGER' ? 'program-manager' :
      role === 'DESIGNATED_FINANCE_OFFICER' ? 'finance-officer' :
      role === 'ME_TEAM' ? 'me-team' :
      role === 'EXTERNAL_REVIEWER' ? 'external-reviewer' :
      role;
    
    switch (normalizedRole) {
      case 'admin':
        const adminItems = [
          { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
          { icon: Bell, label: 'Notifications', page: 'notifications' },
          { icon: FileText, label: 'All Applications', page: 'applications' },
          { icon: Settings, label: 'Eligibility Criteria', page: 'criteria' },
          { icon: Users, label: 'User Management', page: 'users' },
          { icon: Building2, label: 'Pending Registrations', page: 'pending-registrations' },
          { icon: Mail, label: 'Invitations', page: 'invitations' },
          { icon: Shield, label: 'Roles', page: 'roles' },
          { icon: Key, label: 'Permissions', page: 'permissions' },
          { icon: GitBranch, label: 'Workflow Management', page: 'workflows' },
          { icon: ScrollText, label: 'Audit Logs', page: 'audit' },
          { icon: UserCircle, label: 'Profile Settings', page: 'profile' }
        ];
        
        return adminItems;
        
      case 'applicant': {
        const allAfItems = [
          { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
          { icon: Bell, label: 'Notifications', page: 'notifications' },
          { icon: FilePlus, label: 'Submit Rebate', page: 'submit' },
          { icon: FileText, label: 'Rebate Pipeline Dev.', page: 'rebate-status' },
          { icon: ClipboardList, label: 'All Rebates', page: 'af-reports' },
          { icon: Bike, label: 'E-Moto Possession', page: 'possession' },
          { icon: Download, label: 'Mandatory Templates', page: 'af-templates' },
          { icon: FileText, label: 'Client Transfer', page: 'client-transfer' },
          { icon: ScrollText, label: 'Background Info', page: 'background-info' },
          { icon: Users, label: 'Manage Staff', page: 'internal-users' },
          { icon: UserCircle, label: 'Profile Settings', page: 'profile' }
        ];

        // Marketing Agent: submit + own status only
        if (role === 'CLAIMS_OFFICER' || role === 'ASSET_FINANCIER_STAFF') {
          return allAfItems.filter((item) =>
            ['dashboard', 'notifications', 'submit', 'rebate-status', 'af-reports', 'profile'].includes(item.page)
          );
        }

        // AF Finance Staff: submit + status (including marketing tab), no staff management
        if (role === 'ASSET_FINANCIER_OFFICER') {
          return allAfItems.filter((item) =>
            ['dashboard', 'notifications', 'submit', 'rebate-status', 'af-reports', 'profile'].includes(item.page)
          );
        }

        const permission = getAfPermissionLevel(user.email);
        if (permission === 'internal-proposal') {
          return allAfItems.filter((item) =>
            ['dashboard', 'notifications', 'submit', 'rebate-status', 'af-reports', 'profile'].includes(item.page)
          );
        }
        return allAfItems;
      }
        
      case 'analyst':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
          { icon: Bell, label: 'Notifications', page: 'notifications' },
          { icon: ClipboardList, label: 'Rebate Review Pipeline', page: 'queue' },
          { icon: GitBranch, label: 'Reassignment Checking', page: 'reassignment-checking' },
          { icon: FileText, label: 'Assigned Rebates', page: 'assigned' },
          { icon: UserCircle, label: 'Profile Settings', page: 'profile' }
        ];
        
      case 'rebate-manager':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
          { icon: Bell, label: 'Notifications', page: 'notifications' },
          { icon: ClipboardList, label: 'QA Decisions', page: 'review-queue' },
          { icon: ScrollText, label: 'CFO Disbursement Req.', page: 'qa-cfo-request' },
          { icon: Bike, label: 'Possession Analysis', page: 'possession-analysis' },
          { icon: GitBranch, label: 'Rebate Reassignment', page: 'reassignment' },
          { icon: FileText, label: 'All Rebates', page: 'applications' },
          { icon: UserCircle, label: 'Profile Settings', page: 'profile' }
        ];
        
      case 'program-manager':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
          { icon: Bell, label: 'Notifications', page: 'notifications' },
          { icon: CheckSquare, label: 'QA Team Review', page: 'approvals' },
          { icon: FileText, label: 'Recommended Rebates', page: 'flagged' },
          { icon: ScrollText, label: 'CFO Weekly Report', page: 'weekly-report' },
          { icon: DollarSign, label: 'Advance Funding', page: 'advance-funding' },
          { icon: UserCircle, label: 'Profile Settings', page: 'profile' }
        ];
        
      case 'finance-officer':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
          { icon: Bell, label: 'Notifications', page: 'notifications' },
          { icon: DollarSign, label: 'Finance Tracking', page: 'finance-tracking' },
          { icon: Receipt, label: 'Top-Up Requests', page: 'top-up-requests' },
          { icon: UserCircle, label: 'Profile Settings', page: 'profile' }
        ];
        
      case 'me-team':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
          { icon: Bell, label: 'Notifications', page: 'notifications' },
          { icon: FileText, label: 'View Applications', page: 'applications' },
          { icon: BarChart3, label: 'Analytics', page: 'analytics' },
          { icon: UserCircle, label: 'Profile Settings', page: 'profile' }
        ];
        
      case 'external-reviewer':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
          { icon: Bell, label: 'Notifications', page: 'notifications' },
          { icon: FileText, label: 'View Applications', page: 'applications' },
          { icon: BarChart3, label: 'Analytics', page: 'analytics' },
          { icon: UserCircle, label: 'Profile Settings', page: 'profile' }
        ];
        
      default:
        return [];
    }
  };

  const getRoleTitle = () => {
    switch (user.role) {
      case 'admin': return 'Administrator';
      case 'SYSTEM_ADMIN': return 'System Administrator';
      case 'applicant': return 'E-Moto Company';
      case 'ASSET_FINANCIER_ADMIN': return 'Asset Financier';
      case 'CLAIMS_OFFICER': return 'Claims Officer';
      case 'ASSET_FINANCIER_OFFICER': return 'AF Finance Staff';
      case 'ASSET_FINANCIER_STAFF': return `${user.organization || 'Asset Financier'} E-Moto Marketing Person`;
      case 'analyst': return 'Rebate Analyst';
      case 'REBATE_ANALYST': return 'Rebate Analyst';
      case 'REBATE_MANAGER': return 'Rebate Team (Manager)';
      case 'E_MOTO_PROGRAM_MANAGER': return 'QA Team (Program Manager)';
      case 'DESIGNATED_FINANCE_OFFICER': return 'Designated Finance Officer';
      case 'ME_TEAM': return 'M&E Team';
      case 'EXTERNAL_REVIEWER': return 'External Reviewer';
      default: return 'User';
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Hamburger Button - Only visible on mobile */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-[60] p-2 bg-[#023F40] text-white rounded-lg shadow-lg hover:bg-[#035f60] transition-colors"
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay - Only visible when menu is open */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ 
          width: isExpanded ? 240 : 72
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          bg-white h-screen fixed left-0 top-0 flex flex-col shadow-lg z-50
          
          /* Mobile: Hidden by default, slides in when open */
          md:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          
          /* Desktop: Always visible */
          transition-transform duration-300 ease-in-out
        `}
      >
        {/* Logo and Toggle Button */}
        <div className="relative border-b border-gray-200">
          <div className="p-4">
            {isExpanded ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-lg font-semibold text-[#023F40]">RGF Rebate System</h1>
                <p className="text-xs text-gray-500 mt-1">{getRoleTitle()}</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <div className="w-10 h-10 bg-[#023F40] rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">RGF</span>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Toggle Button - Hidden on mobile, visible on desktop */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex absolute -right-3 top-6 w-6 h-6 bg-[#023F40] rounded-full items-center justify-center text-white hover:bg-[#035f60] transition-colors shadow-md"
          >
            {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation - Primary Section */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {isExpanded && (
            <div className="px-3 py-2 mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                RGF Rebate System Menu
              </p>
            </div>
          )}
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.page === currentPage;
            
            return (
              <motion.button
                key={index}
                onClick={() => {
                  // Open profile modal instead of navigating to profile page
                  if (item.page === 'profile') {
                    setShowProfileModal(true);
                  } else {
                    handleNavigate(item.page);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 min-w-0 overflow-hidden ${
                  isActive
                    ? 'bg-[#023F40] text-white shadow-md'
                    : 'text-gray-600 hover:bg-[#023F40]/5 hover:text-[#023F40]'
                }`}
                title={item.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`flex items-center ${isExpanded ? '' : 'justify-center w-full'}`}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                </div>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm font-medium truncate min-w-0 flex-1 text-left"
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom Section - Settings and Sign Out */}
        <div className="p-3 border-t border-gray-200 space-y-1">
          {isExpanded && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => setShowProfileModal(true)}
              className="mb-3 px-3 py-2 rounded-lg hover:bg-[#023F40]/5 transition-all duration-200 w-full text-left cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <p className="font-medium text-sm text-[#023F40] truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </motion.button>
          )}
          
          <motion.button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            title={!isExpanded ? 'Sign Out' : undefined}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`flex items-center ${isExpanded ? '' : 'justify-center w-full'}`}>
              <LogOut className="w-5 h-5 flex-shrink-0" />
            </div>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm font-medium"
              >
                Sign Out
              </motion.span>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Profile Settings Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
          </DialogHeader>
          <ProfileSettings user={user} onUpdate={async (updates) => {
            if (onUpdateProfile) {
              await onUpdateProfile(updates);
            } else {
              console.log('Profile update:', updates);
            }
          }} />
        </DialogContent>
      </Dialog>
    </>
  );
}