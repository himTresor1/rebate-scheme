import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { InternalUserManagement } from './InternalUserManagement';
import { ApplicationsOverview } from './ApplicationsOverview';
import { SubmitApplicationForm } from './SubmitApplicationForm';
import { RebateStatusView } from './RebateStatusView';
import { PossessionConfirmationView } from './PossessionConfirmationView';
import { ClientTransferForm } from './ClientTransferForm';
import { RebateBackgroundInfo } from './RebateBackgroundInfo';
import { RepaymentTracking } from './RepaymentTracking';
import { AfReportsView } from './AfReportsView';
import { AfTemplatesView } from './AfTemplatesView';
import { NotificationsView } from '../NotificationsView';
import { User } from '../../utils/auth';
import { Greeting } from '../ui/Greeting';
import { PageHeader } from '../PageHeader';
import { toast } from 'sonner';
import { 
  Users, 
  FileText, 
  UserPlus, 
  Download,
  Printer,
  Bike,
  CheckCircle2,
} from 'lucide-react';
import {
  AF_DASHBOARD_STATS,
  AF_DOCUMENT_TEMPLATES,
  AF_METRIC_LABELS,
  AF_MOCK_REBATE_RECORDS,
  AfMetricCategory,
  afRecordToFormDraft,
  AfRebateRecord,
  formDataToUnfinishedRecord,
} from '../../utils/afRebateData';
import { getAfPermissionLevel } from '../../utils/afPermissions';

// Skeleton components for loading states
function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
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
  const isMarketingAgent =
    user.role === 'ASSET_FINANCIER_STAFF' ||
    user.role === 'CLAIMS_OFFICER' ||
    getAfPermissionLevel(user.email) === 'internal-proposal';
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'users'
    | 'applications'
    | 'submit'
    | 'repayment'
    | 'rebate-status'
    | 'possession'
    | 'client-transfer'
    | 'background-info'
    | 'af-reports'
    | 'af-templates'
  >('overview');
  const [loading, setLoading] = useState(true);
  const [reportCategory, setReportCategory] = useState<AfMetricCategory>('all');
  const [targetAppId, setTargetAppId] = useState<string | null>(null);
  const [hideHeaderActions, setHideHeaderActions] = useState(false);
  const [resumeDraft, setResumeDraft] = useState<{
    ticket: string;
    data: ReturnType<typeof afRecordToFormDraft>;
  } | null>(null);
  const [pipelineRecords, setPipelineRecords] = useState<AfRebateRecord[]>(AF_MOCK_REBATE_RECORDS);

  const upsertUnfinished = (record: AfRebateRecord) => {
    setPipelineRecords((prev) => {
      const index = prev.findIndex((r) => r.ticketNumber === record.ticketNumber);
      if (index >= 0) {
        return prev.map((r, i) => (i === index ? { ...record, status: 'unfinished' as const } : r));
      }
      return [...prev, { ...record, status: 'unfinished' as const }];
    });
  };

  const markSubmitted = (ticketNumber: string) => {
    setPipelineRecords((prev) =>
      prev.map((r) =>
        r.ticketNumber === ticketNumber
          ? { ...r, status: 'submitted-not-approved' as const, missingFields: [] }
          : r
      )
    );
    setResumeDraft(null);
  };

  const markProposalSubmitted = (ticketNumber: string) => {
    setPipelineRecords((prev) =>
      prev.map((r) =>
        r.ticketNumber === ticketNumber
          ? { ...r, status: 'unfinished' as const, missingFields: [] }
          : r
      )
    );
    setResumeDraft(null);
  };

  // Debug logging
  console.log('AssetFinancierAdminDashboard rendering for user:', user);
  console.log('Active tab:', activeTab);
  console.log('Current page from sidebar:', currentPage);

  // Sync activeTab with currentPage from sidebar
  useEffect(() => {
    const pageToTabMap: Record<string, typeof activeTab> = {
      dashboard: 'overview',
      'internal-users': 'users',
      applications: 'applications',
      submit: 'submit',
      repayment: 'repayment',
      'rebate-status': 'rebate-status',
      possession: 'possession',
      'client-transfer': 'client-transfer',
      'background-info': 'background-info',
      'af-reports': 'af-reports',
      'af-templates': 'af-templates',
    };

    const newTab = pageToTabMap[currentPage] || 'overview';
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [currentPage, activeTab]);

  const openMetricReport = (category: AfMetricCategory) => {
    setReportCategory(category);
    setActiveTab('af-reports');
    onNavigate('af-reports');
  };

  useEffect(() => {
    // Simulate loading data when tab changes
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const afMetricCards: { category: AfMetricCategory; value: number; icon: typeof Users }[] = [
    { category: 'all', value: AF_DASHBOARD_STATS.totalInPipelineAndDisbursed, icon: Users },
    { category: 'unfinished', value: AF_DASHBOARD_STATS.pipelineBeingDeveloped, icon: FileText },
    { category: 'submitted-not-approved', value: AF_DASHBOARD_STATS.submittedNotApproved, icon: CheckCircle2 },
    { category: 'lacking-possession', value: AF_DASHBOARD_STATS.lackingPossession, icon: Bike },
    { category: 'disbursements-to-date', value: AF_DASHBOARD_STATS.disbursementsToDate, icon: Download },
  ];
  const marketingAssetFinancierOptions = [
    { id: 'af-bboxx', name: 'Bboxx' },
    { id: 'af-jali', name: 'Jali' },
    { id: 'af-watu', name: 'Watu' },
    { id: 'af-rem', name: 'REM' },
    { id: 'af-safi', name: 'Safi' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader hideActions={hideHeaderActions || currentPage !== 'dashboard'} />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'notifications' ? (
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
        ) : (
          <>
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
                
                <h1 className="text-lg sm:text-xl text-[#023F40] mt-6">
                  {isMarketingAgent ? 'Marketing Dashboard' : 'Asset Financier Dashboard'}
                </h1>

                {/* Stats Grid — same cards for AF and Marketing Agent */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {afMetricCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                      <motion.button
                        key={card.category}
                        type="button"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * (index + 1) }}
                        onClick={() => openMetricReport(card.category)}
                        className="bg-gradient-to-br from-[#023F40] to-[#035f60] p-4 rounded-xl shadow-md text-white text-left hover:from-[#035f60] hover:to-[#047a7c] transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Icon className="w-5 h-5" />
                          </div>
                        </div>
                        <p className="text-3xl font-bold mb-0.5">{card.value}</p>
                        <p className="text-white/80 text-xs">{AF_METRIC_LABELS[card.category]}</p>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="mb-4 font-semibold text-gray-900">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        setActiveTab('submit');
                        onNavigate('submit');
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#023F40] hover:bg-gray-50 text-left transition-all group"
                    >
                      <UserPlus className="w-4 h-4 text-[#023F40] flex-shrink-0" />
                      <span className="font-medium text-gray-900 text-sm">Submit Rebate</span>
                    </button>

                    {!isMarketingAgent && (
                      <button
                        onClick={() => {
                          setActiveTab('users');
                          onNavigate('internal-users');
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#023F40] hover:bg-gray-50 text-left transition-all group"
                      >
                        <Users className="w-4 h-4 text-[#023F40] flex-shrink-0" />
                        <span className="font-medium text-gray-900 text-sm">Designate Rebate Originators</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setReportCategory('all');
                        setActiveTab('af-reports');
                        onNavigate('af-reports');
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#023F40] hover:bg-gray-50 text-left transition-all group"
                    >
                      <Printer className="w-4 h-4 text-[#023F40] flex-shrink-0" />
                      <span className="font-medium text-gray-900 text-sm">Create and Print Reports</span>
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
                    {isMarketingAgent ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                          {AF_DOCUMENT_TEMPLATES.filter(t =>
                            t.file === 'Individual_Affidavit_of_Financial_Need_Template.pdf' ||
                            t.file === 'ICE_Moto_Engine_Disposal_Agreement_Template.pdf'
                          ).map((template) => (
                            <button
                              key={template.file}
                              onClick={() => {
                                toast.success('Template ready for download', { description: template.file });
                              }}
                              className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#023F40] hover:bg-[#023F40]/5 text-left transition-all group"
                            >
                              <Download className="w-5 h-5 text-[#023F40] flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{template.label}</p>
                                <p className="text-xs text-gray-500">PDF Template</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600 mb-4">
                          Download required templates for signature and submission
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {AF_DOCUMENT_TEMPLATES.map((template) => (
                            <button
                              key={template.file}
                              onClick={() => {
                                toast.success('Template ready for download', { description: template.file });
                              }}
                              className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#023F40] hover:bg-[#023F40]/5 text-left transition-all group"
                            >
                              <Download className="w-5 h-5 text-[#023F40] flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{template.label}</p>
                                <p className="text-xs text-gray-500">PDF Template</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </div>
        )}

        {activeTab === 'users' && currentPage === 'internal-users' && <InternalUserManagement organizationId={user.assetFinancierId || user.organizationId || user.id} />}
        {activeTab === 'applications' && currentPage === 'applications' && (
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
        {activeTab === 'submit' && currentPage === 'submit' && (
          <SubmitApplicationForm
            organizationId={user.assetFinancierId || user.organizationId || user.id}
            requireAssetFinancierSelection={isMarketingAgent}
            assetFinancierOptions={isMarketingAgent ? marketingAssetFinancierOptions : undefined}
            submissionMode={isMarketingAgent ? 'af-proposal' : 'rgf'}
            prefilledTicketNumber={resumeDraft?.ticket}
            initialData={resumeDraft?.data}
            submittedBy={user.name || 'AF User'}
            onSaveUnfinished={(formData, missingFields, ticketNumber) => {
              upsertUnfinished(
                formDataToUnfinishedRecord(
                  formData as Parameters<typeof formDataToUnfinishedRecord>[0],
                  ticketNumber,
                  user.name || 'AF User',
                  missingFields,
                  { email: user.email }
                )
              );
            }}
            onSubmitted={isMarketingAgent ? markProposalSubmitted : markSubmitted}
            onNavigateToBackgroundInfo={() => {
              setActiveTab('background-info');
              onNavigate('background-info');
            }}
          />
        )}
        {activeTab === 'rebate-status' && currentPage === 'rebate-status' && (
          <RebateStatusView
            records={pipelineRecords}
            isMarketingAgent={isMarketingAgent}
            currentUserName={user.name}
            onDetailOpenChange={setHideHeaderActions}
            onSubmitApplication={(record) => {
              markSubmitted(record.ticketNumber);
            }}
            onUpdateRecord={(record) => {
              setPipelineRecords((prev) =>
                prev.map((r) => (r.ticketNumber === record.ticketNumber ? record : r))
              );
            }}
          />
        )}
        {activeTab === 'af-reports' && currentPage === 'af-reports' && (
          <AfReportsView
            initialCategory={reportCategory}
            records={pipelineRecords}
            onDetailOpenChange={setHideHeaderActions}
          />
        )}
        {activeTab === 'af-templates' && currentPage === 'af-templates' && <AfTemplatesView />}
        {activeTab === 'possession' && currentPage === 'possession' && <PossessionConfirmationView />}
        {activeTab === 'client-transfer' && currentPage === 'client-transfer' && (
          <ClientTransferForm organizationId={user.assetFinancierId || user.organizationId || user.id} />
        )}
        {activeTab === 'background-info' && currentPage === 'background-info' && <RebateBackgroundInfo />}
        {activeTab === 'repayment' && currentPage === 'repayment' && <RepaymentTracking organizationId={user.assetFinancierId || user.organizationId || user.id} />}
          </>
        )}
      </div>
    </div>
  );
}