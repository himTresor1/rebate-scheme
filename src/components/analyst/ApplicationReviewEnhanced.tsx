import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle, 
  XCircle, 
  FileText, 
  AlertCircle,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Car,
  Battery,
  CreditCard,
  FileCheck,
  Eye,
  Clock,
  CheckCircle2,
  MessageCircle,
  X,
  ClipboardCheck,
  Upload,
  Search,
  ChevronDown,
  ChevronUp,
  Database,
  ExternalLink,
  Loader2,
  MoreVertical
} from 'lucide-react';
import { User } from '../../utils/auth';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { DocumentUploadField } from './DocumentUploadField';
import { ForwardToMEDialog, MEForwardData } from './ForwardToMEDialog';
import { CriterionCardEnhanced } from './CriterionCardEnhanced';
import { 
  mockSocialRegistryCheck, 
  mockAdditionalMotorcyclesCheck,
  mockNationalIdCheck,
  mockTaxiLicenseCheck,
  simulateApiCall
} from '../../utils/mockApiResponses';

interface Application {
  id: string;
  companyName: string;
  applicantName: string;
  nationalId: string;
  phoneNumber: string;
  email: string;
  applicantAddress?: string;
  applicantOccupation?: string;
  applicantIncome?: string;
  
  motorcycleBrand: string;
  motorcycleModel: string;
  chassisNumber: string;
  batteryCapacity?: string;
  yearOfManufacture?: string;
  plateNumber?: string;
  vehicleColor?: string;
  registrationDate?: string;
  
  loanAmount: string;
  interestRate: string;
  loanTerm: string;
  monthlyRepayment: string;
  rebateAmount: string;
  purchasePrice?: string;
  downPayment?: number;
  processingFee?: number;
  insuranceFee?: number;
  totalLoanCost?: number;
  
  repaymentSchedule?: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
  
  documents?: Array<{
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
    verified: boolean;
  }>;
  
  reviewHistory?: Array<{
    reviewerName: string;
    reviewerRole: string;
    reviewerId: string;
    decision: string;
    reviewedAt: string;
    notes: string;
  }>;
  
  nidaVerified?: boolean;
  ruraVerified?: boolean;
  bankVerified?: boolean;
  
  status: string;
  createdAt: string;
}

interface Criterion {
  id: string;
  text: string;
  enabled: boolean;
  order: number;
}

// NEW: Enhanced evaluation structure with comments and documents per criterion
interface EnhancedCriteriaEvaluation {
  [criterionId: string]: {
    passed: boolean | null;
    comment?: string;
    documents?: Array<{
      name: string;
      url: string;
      uploadedAt: string;
      uploadedBy?: string;
    }>;
  };
}

interface CriteriaEvaluation {
  [criterionId: string]: boolean | null;
}

interface ApplicationReviewEnhancedProps {
  application: Application;
  user: User;
  onBack: () => void;
}

// API Check interfaces
interface ApiCheckState {
  loading: boolean;
  data: any;
  error?: string;
  checkedAt?: string;
}

export function ApplicationReviewEnhanced({ application, user, onBack }: ApplicationReviewEnhancedProps) {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  
  // NEW: Enhanced evaluations with comments and documents
  const [enhancedEvaluations, setEnhancedEvaluations] = useState<EnhancedCriteriaEvaluation>({});
  
  // NEW: Assessment section
  const [assessmentExplanation, setAssessmentExplanation] = useState('');
  const [assessmentComments, setAssessmentComments] = useState('');
  
  // NEW: Additional documents uploaded by analyst
  const [additionalDocuments, setAdditionalDocuments] = useState<Array<{
    name: string;
    url: string;
    uploadedAt: string;
    uploadedBy: string;
  }>>([]);
  
  // NEW: Expanded criteria state for showing/hiding comments and upload sections
  const [expandedCriteria, setExpandedCriteria] = useState<{[key: string]: boolean}>({});
  
  // NEW: Collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({
    applicant: false,
    apiChecks: false,
    vehicle: false,
    financing: false,
    repayment: false,
    documents: false,
    reviewHistory: false
  });
  
  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const [evaluations, setEvaluations] = useState<CriteriaEvaluation>({});
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showClarificationDialog, setShowClarificationDialog] = useState(false);
  const [clarificationMessage, setClarificationMessage] = useState('');
  const [showMobileCriteria, setShowMobileCriteria] = useState(false);
  const [showForwardToMEDialog, setShowForwardToMEDialog] = useState(false);

  // NEW: API Check states
  const [socialRegistryCheck, setSocialRegistryCheck] = useState<ApiCheckState>({ loading: false, data: null });
  const [motorcyclesCheck, setMotorcyclesCheck] = useState<ApiCheckState>({ loading: false, data: null });
  const [nidaCheck, setNidaCheck] = useState<ApiCheckState>({ loading: false, data: null });
  const [ruraCheck, setRuraCheck] = useState<ApiCheckState>({ loading: false, data: null });
  
  // Modal states for viewing API data
  const [showSocialRegistryModal, setShowSocialRegistryModal] = useState(false);
  const [showMotorcyclesModal, setShowMotorcyclesModal] = useState(false);
  const [showNidaModal, setShowNidaModal] = useState(false);
  const [showRuraModal, setShowRuraModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [application.id]);

  const loadData = async () => {
    try {
      const [criteriaData, evaluationData] = await Promise.all([
        api.getCriteria(),
        api.getEvaluation(application.id.replace('application:', ''))
      ]);

      const enabledCriteria = criteriaData.filter((c: Criterion) => c.enabled);
      setCriteria(enabledCriteria);

      if (evaluationData) {
        setEvaluations(evaluationData.criteriaEvaluations || {});
        setNotes(evaluationData.notes || '');
      }
    } catch (error: any) {
      toast.error('Failed to load review data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // API Check handlers
  const handleSocialRegistryCheck = async () => {
    setSocialRegistryCheck({ loading: true, data: null });
    try {
      const result = await simulateApiCall(mockSocialRegistryCheck(application.applicantName), 1500);
      setSocialRegistryCheck({ 
        loading: false, 
        data: result,
        checkedAt: new Date().toISOString()
      });
      toast.success('Social Registry data retrieved successfully');
    } catch (error) {
      setSocialRegistryCheck({ 
        loading: false, 
        data: null, 
        error: 'Failed to fetch data' 
      });
      toast.error('Failed to retrieve Social Registry data');
    }
  };

  const handleMotorcyclesCheck = async () => {
    setMotorcyclesCheck({ loading: true, data: null });
    try {
      const result = await simulateApiCall(mockAdditionalMotorcyclesCheck(application.nationalId), 1500);
      setMotorcyclesCheck({ 
        loading: false, 
        data: result,
        checkedAt: new Date().toISOString()
      });
      toast.success('Motorcycles data retrieved successfully');
    } catch (error) {
      setMotorcyclesCheck({ 
        loading: false, 
        data: null, 
        error: 'Failed to fetch data' 
      });
      toast.error('Failed to retrieve motorcycles data');
    }
  };

  const handleNidaCheck = async () => {
    setNidaCheck({ loading: true, data: null });
    try {
      const result = await simulateApiCall(mockNationalIdCheck(application.nationalId), 1500);
      setNidaCheck({ 
        loading: false, 
        data: result,
        checkedAt: new Date().toISOString()
      });
      toast.success('NIDA data retrieved successfully');
    } catch (error) {
      setNidaCheck({ 
        loading: false, 
        data: null, 
        error: 'Failed to fetch data' 
      });
      toast.error('Failed to retrieve NIDA data');
    }
  };

  const handleRuraCheck = async () => {
    setRuraCheck({ loading: true, data: null });
    try {
      const result = await simulateApiCall(mockTaxiLicenseCheck(application.plateNumber || 'RAE123E'), 1500);
      setRuraCheck({ 
        loading: false, 
        data: result,
        checkedAt: new Date().toISOString()
      });
      toast.success('RURA license data retrieved successfully');
    } catch (error) {
      setRuraCheck({ 
        loading: false, 
        data: null, 
        error: 'Failed to fetch data' 
      });
      toast.error('Failed to retrieve RURA data');
    }
  };

  const handleCriterionChange = (criterionId: string, value: boolean) => {
    setEvaluations({
      ...evaluations,
      [criterionId]: value
    });
  };

  const calculateScore = () => {
    const totalCriteria = criteria.length;
    if (totalCriteria === 0) return 0;

    const passedCriteria = Object.values(evaluations).filter(v => v === true).length;
    return Math.round((passedCriteria / totalCriteria) * 100);
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    try {
      const score = calculateScore();
      await api.saveEvaluation(application.id, {
        criteriaEvaluations: evaluations,
        notes,
        score
      });
      toast.success('Progress saved');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save progress');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (decision: 'approve' | 'reject') => {
    // Check if all criteria are evaluated
    const allEvaluated = criteria.every(c => evaluations[c.id] !== undefined && evaluations[c.id] !== null);
    
    if (!allEvaluated) {
      toast.error('Please evaluate all criteria before submitting');
      return;
    }

    if (decision === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setSaving(true);
    try {
      const score = calculateScore();
      await api.completeEvaluation(application.id.replace('application:', ''), {
        decision,
        criteriaEvaluations: evaluations,
        notes,
        rejectionReason: decision === 'reject' ? rejectionReason : undefined,
        score
      });
      
      toast.success(decision === 'approve' ? 'Application approved and sent to QA' : 'Application rejected');
      onBack();
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete review');
      console.error(error);
    } finally {
      setSaving(false);
      setShowApproveDialog(false);
      setShowRejectDialog(false);
    }
  };

  const handleRequestClarification = async () => {
    if (!clarificationMessage.trim()) {
      toast.error('Please provide a clarification message');
      return;
    }

    setSaving(true);
    try {
      // Get criteria that failed evaluation
      const failedCriteria = criteria
        .filter(c => evaluations[c.id] === false)
        .map(c => c.name);

      await api.requestClarification(
        application.id.replace('application:', ''),
        clarificationMessage,
        failedCriteria
      );

      toast.success('Clarification request sent to Asset Financier');
      setShowClarificationDialog(false);
      setClarificationMessage('');
      onBack();
    } catch (error: any) {
      toast.error(error.message || 'Failed to request clarification');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const score = calculateScore();
  const evaluatedCount = Object.values(evaluations).filter(v => v !== null && v !== undefined).length;
  const isReadOnly = ['manager-review', 'rejected', 'program-manager-review', 'approved', 'disbursed'].includes(application.status);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading review...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Mobile Responsive */}
      <div className="bg-gradient-to-r from-[#023F40] to-[#035f60] text-white px-4 sm:px-6 py-4 shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left Section - Back Button and Title */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20 flex-shrink-0">
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Back to Queue</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold truncate">{application.applicantName}</h2>
              <p className="text-xs sm:text-sm text-white/80 truncate">National ID: {application.nationalId}</p>
            </div>
          </div>

          {/* Right Section - Score and Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* Score Display */}
            <div className="text-center px-4 sm:px-6 py-2 bg-white/20 backdrop-blur rounded-lg border border-white/30 flex-shrink-0">
              <div className="text-2xl sm:text-3xl font-bold text-white">{score}%</div>
              <div className="text-xs text-white/90">Eligibility Score</div>
              <div className="text-xs text-white/70 mt-1">
                {evaluatedCount} / {criteria.length} evaluated
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={handleSaveProgress} 
                  disabled={saving} 
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Progress
                </Button>
                
                {/* Actions Dropdown */}
                {(user.role === 'analyst' || user.role === 'REBATE_ANALYST') && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        disabled={saving} 
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                      >
                        <MoreVertical className="w-4 h-4 mr-2" />
                        Actions
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white">
                      <DropdownMenuItem onClick={() => setShowClarificationDialog(true)} className="cursor-pointer">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Ask for Clarification
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowForwardToMEDialog(true)} className="cursor-pointer">
                        <Search className="w-4 h-4 mr-2" />
                        Forward to M&E
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                
                <Button 
                  variant="destructive" 
                  onClick={() => setShowRejectDialog(true)} 
                  disabled={saving} 
                  className="bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  onClick={() => setShowApproveDialog(true)} 
                  disabled={saving} 
                  className="bg-[#6DB27F] hover:bg-[#5da170]"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Application Details */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Applicant Information */}
          <Card>
            <CardHeader 
              className="bg-gradient-to-r from-[#6DB27F]/10 to-transparent cursor-pointer hover:bg-[#6DB27F]/15 transition-colors"
              onClick={() => toggleSection('applicant')}
            >
              <CardTitle className="text-[#023F40] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Applicant Information
                </div>
                {collapsedSections.applicant ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                )}
              </CardTitle>
            </CardHeader>
            {!collapsedSections.applicant && (
              <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <UserIcon className="w-5 h-5 text-[#6DB27F] mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium text-gray-900">{application.applicantName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileCheck className="w-5 h-5 text-[#6DB27F] mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">National ID</p>
                    <p className="font-medium text-gray-900">{application.nationalId}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#6DB27F] mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-medium text-gray-900">{application.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#6DB27F] mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="font-medium text-gray-900">{application.email}</p>
                  </div>
                </div>
                {application.applicantAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#6DB27F] mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium text-gray-900">{application.applicantAddress}</p>
                    </div>
                  </div>
                )}
                {application.applicantOccupation && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-[#6DB27F] mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Occupation</p>
                      <p className="font-medium text-gray-900">{application.applicantOccupation}</p>
                    </div>
                  </div>
                )}
                {application.applicantIncome && (
                  <div className="flex items-start gap-3 md:col-span-2">
                    <DollarSign className="w-5 h-5 text-[#6DB27F] mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Monthly Income</p>
                      <p className="font-medium text-gray-900">{application.applicantIncome}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            )}
          </Card>

          {/* NEW: API Verification Section */}
          <Card className="border-2 border-[#023F40]/20">
            <CardHeader 
              className="bg-gradient-to-r from-[#023F40]/10 to-transparent cursor-pointer hover:bg-[#023F40]/15 transition-colors"
              onClick={() => toggleSection('apiChecks')}
            >
              <CardTitle className="text-[#023F40] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  API Verification Checks
                </div>
                {collapsedSections.apiChecks ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                )}
              </CardTitle>
              {!collapsedSections.apiChecks && (
                <CardDescription>
                  Verify applicant data through external API integrations
                </CardDescription>
              )}
            </CardHeader>
            {!collapsedSections.apiChecks && (
              <CardContent className="pt-6 space-y-6">
              {/* Section A: Mandatory API Checks */}
              <div>
                <h3 className="font-semibold text-[#023F40] mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#023F40] text-white flex items-center justify-center text-sm">A</div>
                  Mandatory API Checks
                </h3>
                <div className="space-y-3">
                  {/* Social Registry Check */}
                  <div className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Social Registry Check</p>
                        <p className="text-sm text-gray-600">Verify applicant's social economic status</p>
                        {socialRegistryCheck.checkedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last checked: {new Date(socialRegistryCheck.checkedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {socialRegistryCheck.data && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setShowSocialRegistryModal(true)}
                            className="text-[#023F40] border-[#023F40]/30"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Data
                          </Button>
                        )}
                        <Button 
                          size="sm"
                          onClick={handleSocialRegistryCheck}
                          disabled={socialRegistryCheck.loading}
                          className="bg-[#023F40] hover:bg-[#035f60]"
                        >
                          {socialRegistryCheck.loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Pulling...
                            </>
                          ) : (
                            <>
                              <Database className="w-4 h-4 mr-1" />
                              {socialRegistryCheck.data ? 'Refresh' : 'Pull Data'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Additional Motorcycles Check */}
                  <div className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Additional Motorcycles Check (RURA/RRA)</p>
                        <p className="text-sm text-gray-600">Check if applicant owns other motorcycles</p>
                        {motorcyclesCheck.checkedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last checked: {new Date(motorcyclesCheck.checkedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {motorcyclesCheck.data && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setShowMotorcyclesModal(true)}
                            className="text-[#023F40] border-[#023F40]/30"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Data
                          </Button>
                        )}
                        <Button 
                          size="sm"
                          onClick={handleMotorcyclesCheck}
                          disabled={motorcyclesCheck.loading}
                          className="bg-[#023F40] hover:bg-[#035f60]"
                        >
                          {motorcyclesCheck.loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Pulling...
                            </>
                          ) : (
                            <>
                              <Database className="w-4 h-4 mr-1" />
                              {motorcyclesCheck.data ? 'Refresh' : 'Pull Data'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* NIDA Verification */}
                  <div className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">NIDA Verification</p>
                        <p className="text-sm text-gray-600">Verify national ID details with NIDA</p>
                        {nidaCheck.checkedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last checked: {new Date(nidaCheck.checkedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {nidaCheck.data && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setShowNidaModal(true)}
                            className="text-[#023F40] border-[#023F40]/30"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Data
                          </Button>
                        )}
                        <Button 
                          size="sm"
                          onClick={handleNidaCheck}
                          disabled={nidaCheck.loading}
                          className="bg-[#023F40] hover:bg-[#035f60]"
                        >
                          {nidaCheck.loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Pulling...
                            </>
                          ) : (
                            <>
                              <Database className="w-4 h-4 mr-1" />
                              {nidaCheck.data ? 'Refresh' : 'Pull Data'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* RURA Taxi License Check */}
                  <div className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">RURA Taxi License Verification</p>
                        <p className="text-sm text-gray-600">Verify taxi license validity with RURA</p>
                        {ruraCheck.checkedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last checked: {new Date(ruraCheck.checkedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {ruraCheck.data && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setShowRuraModal(true)}
                            className="text-[#023F40] border-[#023F40]/30"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Data
                          </Button>
                        )}
                        <Button 
                          size="sm"
                          onClick={handleRuraCheck}
                          disabled={ruraCheck.loading}
                          className="bg-[#023F40] hover:bg-[#035f60]"
                        >
                          {ruraCheck.loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Pulling...
                            </>
                          ) : (
                            <>
                              <Database className="w-4 h-4 mr-1" />
                              {ruraCheck.data ? 'Refresh' : 'Pull Data'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            )}
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader 
              className="bg-gradient-to-r from-[#6DB27F]/10 to-transparent cursor-pointer hover:bg-[#6DB27F]/15 transition-colors"
              onClick={() => toggleSection('vehicle')}
            >
              <CardTitle className="text-[#023F40] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Vehicle Information
                </div>
                {collapsedSections.vehicle ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                )}
              </CardTitle>
            </CardHeader>
            {!collapsedSections.vehicle && (
              <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Brand</p>
                  <p className="font-medium text-gray-900">{application.motorcycleBrand}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Model</p>
                  <p className="font-medium text-gray-900">{application.motorcycleModel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Chassis Number</p>
                  <p className="font-medium text-gray-900">{application.chassisNumber}</p>
                </div>
                {application.plateNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Plate Number</p>
                    <p className="font-medium text-gray-900">{application.plateNumber}</p>
                  </div>
                )}
                {application.batteryCapacity && (
                  <div>
                    <p className="text-sm text-gray-600">Battery Capacity</p>
                    <p className="font-medium text-gray-900">{application.batteryCapacity}</p>
                  </div>
                )}
                {application.yearOfManufacture && (
                  <div>
                    <p className="text-sm text-gray-600">Year of Manufacture</p>
                    <p className="font-medium text-gray-900">{application.yearOfManufacture}</p>
                  </div>
                )}
                {application.vehicleColor && (
                  <div>
                    <p className="text-sm text-gray-600">Color</p>
                    <p className="font-medium text-gray-900">{application.vehicleColor}</p>
                  </div>
                )}
                {application.registrationDate && (
                  <div>
                    <p className="text-sm text-gray-600">Registration Date</p>
                    <p className="font-medium text-gray-900">{new Date(application.registrationDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
            )}
          </Card>

          {/* Loan Information */}
          <Card>
            <CardHeader 
              className="bg-gradient-to-r from-[#6DB27F]/10 to-transparent cursor-pointer hover:bg-[#6DB27F]/15 transition-colors"
              onClick={() => toggleSection('financing')}
            >
              <CardTitle className="text-[#023F40] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Loan Information
                </div>
                {collapsedSections.financing ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                )}
              </CardTitle>
            </CardHeader>
            {!collapsedSections.financing && (
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {application.purchasePrice && (
                  <div>
                    <p className="text-sm text-gray-600">Purchase Price</p>
                    <p className="text-lg font-semibold text-[#023F40]">{formatCurrency(application.purchasePrice)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Loan Amount</p>
                  <p className="text-lg font-semibold text-[#023F40]">{formatCurrency(application.loanAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rebate Amount</p>
                  <p className="text-lg font-semibold text-[#6DB27F]">{formatCurrency(application.rebateAmount)}</p>
                </div>
                {application.downPayment && (
                  <div>
                    <p className="text-sm text-gray-600">Down Payment</p>
                    <p className="font-medium text-gray-900">{formatCurrency(application.downPayment)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Interest Rate</p>
                  <p className="font-medium text-gray-900">{application.interestRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Loan Term</p>
                  <p className="font-medium text-gray-900">{application.loanTerm} months</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly Repayment</p>
                  <p className="font-medium text-gray-900">{formatCurrency(application.monthlyRepayment)}</p>
                </div>
                {application.processingFee && (
                  <div>
                    <p className="text-sm text-gray-600">Processing Fee</p>
                    <p className="font-medium text-gray-900">{formatCurrency(application.processingFee)}</p>
                  </div>
                )}
                {application.insuranceFee && (
                  <div>
                    <p className="text-sm text-gray-600">Insurance Fee</p>
                    <p className="font-medium text-gray-900">{formatCurrency(application.insuranceFee)}</p>
                  </div>
                )}
                {application.totalLoanCost && (
                  <div className="md:col-span-3">
                    <p className="text-sm text-gray-600">Total Loan Cost</p>
                    <p className="text-xl font-bold text-[#023F40]">{formatCurrency(application.totalLoanCost)}</p>
                  </div>
                )}
              </div>
            </CardContent>
            )}
          </Card>

          {/* Repayment Schedule */}
          {application.repaymentSchedule && application.repaymentSchedule.length > 0 && (
            <Card>
              <CardHeader 
                className="bg-gradient-to-r from-[#6DB27F]/10 to-transparent cursor-pointer hover:bg-[#6DB27F]/15 transition-colors"
                onClick={() => toggleSection('repayment')}
              >
                <CardTitle className="text-[#023F40] flex items-center justify-between">
                  <span>Repayment Schedule</span>
                  {collapsedSections.repayment ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  )}
                </CardTitle>
                {!collapsedSections.repayment && (
                  <CardDescription>Month-by-month breakdown of loan repayments</CardDescription>
                )}
              </CardHeader>
              {!collapsedSections.repayment && (
                <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#6DB27F]/10">
                        <TableHead className="font-semibold">Month</TableHead>
                        <TableHead className="font-semibold text-right">Payment</TableHead>
                        <TableHead className="font-semibold text-right">Principal</TableHead>
                        <TableHead className="font-semibold text-right">Interest</TableHead>
                        <TableHead className="font-semibold text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {application.repaymentSchedule.slice(0, 12).map((payment, i) => (
                        <TableRow key={i} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{payment.month}</TableCell>
                          <TableCell className="text-right">{formatCurrency(payment.payment)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(payment.principal)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(payment.interest)}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(payment.balance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {application.repaymentSchedule.length > 12 && (
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Showing first 12 of {application.repaymentSchedule.length} months
                  </p>
                )}
              </CardContent>
              )}
            </Card>
          )}

          {/* Documents */}
          {application.documents && application.documents.length > 0 && (
            <Card>
              <CardHeader 
                className="bg-gradient-to-r from-[#6DB27F]/10 to-transparent cursor-pointer hover:bg-[#6DB27F]/15 transition-colors"
                onClick={() => toggleSection('documents')}
              >
                <CardTitle className="text-[#023F40] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Uploaded Documents
                  </div>
                  {collapsedSections.documents ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  )}
                </CardTitle>
              </CardHeader>
              {!collapsedSections.documents && (
                <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.documents.map((doc, i) => (
                    <div key={i} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#6DB27F]/10 rounded flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[#6DB27F]" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.verified && (
                          <Badge variant="default" className="bg-[#6DB27F]">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              )}
            </Card>
          )}

          {/* Review History */}
          {application.reviewHistory && application.reviewHistory.length > 0 && (
            <Card>
              <CardHeader 
                className="bg-gradient-to-r from-[#6DB27F]/10 to-transparent cursor-pointer hover:bg-[#6DB27F]/15 transition-colors"
                onClick={() => toggleSection('reviewHistory')}
              >
                <CardTitle className="text-[#023F40] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Review History
                  </div>
                  {collapsedSections.reviewHistory ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  )}
                </CardTitle>
                {!collapsedSections.reviewHistory && (
                  <CardDescription>Timeline of all reviews for this application</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {application.reviewHistory.map((review, i) => (
                    <div key={i} className="flex items-start gap-4 border-l-2 border-[#6DB27F] pl-4 pb-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#6DB27F]/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-[#6DB27F]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{review.reviewerName}</p>
                          <Badge variant="outline" className="text-xs">{review.reviewerRole}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={review.decision === 'Approved' ? 'default' : 'destructive'} className={review.decision === 'Approved' ? 'bg-[#6DB27F]' : ''}>
                            {review.decision}
                          </Badge>
                          <p className="text-sm text-gray-500">
                            {new Date(review.reviewedAt).toLocaleString()}
                          </p>
                        </div>
                        {review.notes && (
                          <p className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded">
                            "{review.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Criteria Checklist */}
        <div className="hidden lg:block w-96 border-l bg-white overflow-y-auto shadow-xl">
          <div className="sticky top-0 bg-gradient-to-r from-[#023F40] to-[#035f60] text-white px-6 py-4 z-10">
            <h3 className="font-semibold text-lg">Eligibility Criteria</h3>
            <p className="text-sm text-white/80 mt-1">
              Mark YES or NO for each criterion
            </p>
          </div>

          <div className="p-6 space-y-4">{criteria.map((criterion, index) => (
              <CriterionCardEnhanced
                key={criterion.id}
                criterion={criterion}
                index={index}
                evaluation={evaluations[criterion.id]}
                comment={enhancedEvaluations[criterion.id]?.comment}
                documents={enhancedEvaluations[criterion.id]?.documents}
                onEvaluationChange={(value) => handleCriterionChange(criterion.id, value)}
                onCommentChange={(comment) => setEnhancedEvaluations(prev => ({
                  ...prev,
                  [criterion.id]: {
                    ...prev[criterion.id],
                    passed: evaluations[criterion.id],
                    comment
                  }
                }))}
                onDocumentsChange={(docs) => setEnhancedEvaluations(prev => ({
                  ...prev,
                  [criterion.id]: {
                    ...prev[criterion.id],
                    passed: evaluations[criterion.id],
                    documents: docs
                  }
                }))}
                isReadOnly={isReadOnly}
              />
            ))}

            {/* Assessment Section - NEW */}
            {!isReadOnly && (
              <Card className="mt-6 border-[#023F40]">
                <CardHeader className="bg-gradient-to-r from-[#023F40]/5 to-transparent">
                  <CardTitle className="text-[#023F40] text-base">Assessment</CardTitle>
                  <CardDescription className="text-xs">Provide your analysis and decision rationale</CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Mandatory Explanation */}
                  <div>
                    <Label htmlFor="assessment-explanation" className="text-sm font-medium">
                      Explanation <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-gray-500 mt-1 mb-2">
                      Explain your reasoning for the decision (minimum 50 characters)
                    </p>
                    <Textarea
                      id="assessment-explanation"
                      value={assessmentExplanation}
                      onChange={(e) => setAssessmentExplanation(e.target.value)}
                      placeholder="Example: After thorough review of all documents and eligibility criteria, the applicant meets all requirements. Income verification confirmed via mobile money statements, and all mandatory documents are authentic. Social Registry check passed successfully..."
                      rows={5}
                      className="text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {assessmentExplanation.length} / 50 minimum characters
                      {assessmentExplanation.length > 0 && assessmentExplanation.length < 50 && (
                        <span className="text-amber-600 ml-2">
                          • Need {50 - assessmentExplanation.length} more characters
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Optional Comments */}
                  <div>
                    <Label htmlFor="assessment-comments" className="text-sm font-medium">
                      Additional Comments (Optional)
                    </Label>
                    <p className="text-xs text-gray-500 mt-1 mb-2">
                      Any issues, concerns, or follow-up notes
                    </p>
                    <Textarea
                      id="assessment-comments"
                      value={assessmentComments}
                      onChange={(e) => setAssessmentComments(e.target.value)}
                      placeholder="Example: Recommend follow-up verification of employment status after 3 months. Applicant borderline on income requirements but meets minimum threshold..."
                      rows={3}
                      className="text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Documents Upload Section - NEW */}
            {!isReadOnly && (
              <Card className="mt-6 border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent">
                  <CardTitle className="text-[#023F40] text-base flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Additional Documents
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Add documents beyond what the applicant submitted (investigation reports, verification certificates, etc.)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <DocumentUploadField
                    documents={additionalDocuments}
                    onDocumentsChange={setAdditionalDocuments}
                    label="Upload Additional Documents"
                    multiple={true}
                    maxFiles={10}
                  />
                </CardContent>
              </Card>
            )}

            {/* Notes Section */}
            {!isReadOnly && (
              <Card className="mt-6">
                <CardContent className="p-4">
                  <Label htmlFor="notes" className="text-sm font-medium">Review Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional comments or observations..."
                    rows={6}
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Floating Review Button - Mobile Only */}
      {!isReadOnly && (
        <button
          onClick={() => setShowMobileCriteria(true)}
          className="lg:hidden fixed bottom-6 right-6 bg-[#023F40] text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-2 z-40 hover:bg-[#035f60] transition-all active:scale-95"
        >
          <ClipboardCheck className="w-5 h-5" />
          <span className="font-semibold">Review</span>
        </button>
      )}

      {/* Mobile Criteria Slide-in Panel */}
      {showMobileCriteria && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setShowMobileCriteria(false)}
          />
          
          {/* Slide-in Panel */}
          <div className={`fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white z-50 shadow-2xl transform transition-transform duration-300 lg:hidden ${
            showMobileCriteria ? 'translate-x-0' : 'translate-x-full'
          }`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#023F40] to-[#035f60] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Eligibility Criteria</h3>
                <p className="text-sm text-white/80 mt-1">
                  Mark YES or NO for each criterion
                </p>
              </div>
              <button
                onClick={() => setShowMobileCriteria(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Criteria List - Scrollable */}
            <div className="overflow-y-auto h-full pb-32 p-6 space-y-4">
              {criteria.map((criterion, index) => (
                <CriterionCardEnhanced
                  key={criterion.id}
                  criterion={criterion}
                  index={index}
                  evaluation={evaluations[criterion.id]}
                  comment={enhancedEvaluations[criterion.id]?.comment}
                  documents={enhancedEvaluations[criterion.id]?.documents}
                  onEvaluationChange={(value) => handleCriterionChange(criterion.id, value)}
                  onCommentChange={(comment) => setEnhancedEvaluations(prev => ({
                    ...prev,
                    [criterion.id]: {
                      ...prev[criterion.id],
                      passed: evaluations[criterion.id],
                      comment
                    }
                  }))}
                  onDocumentsChange={(docs) => setEnhancedEvaluations(prev => ({
                    ...prev,
                    [criterion.id]: {
                      ...prev[criterion.id],
                      passed: evaluations[criterion.id],
                      documents: docs
                    }
                  }))}
                  isReadOnly={isReadOnly}
                />
              ))}

              {/* Assessment Section - NEW */}
              {!isReadOnly && (
                <Card className="mt-6 border-[#023F40]">
                  <CardHeader className="bg-gradient-to-r from-[#023F40]/5 to-transparent">
                    <CardTitle className="text-[#023F40] text-base">Assessment</CardTitle>
                    <CardDescription className="text-xs">Provide your analysis and decision rationale</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <Label htmlFor="assessment-explanation-mobile" className="text-sm font-medium">
                        Explanation <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-xs text-gray-500 mt-1 mb-2">
                        Explain your reasoning for the decision (minimum 50 characters)
                      </p>
                      <Textarea
                        id="assessment-explanation-mobile"
                        value={assessmentExplanation}
                        onChange={(e) => setAssessmentExplanation(e.target.value)}
                        placeholder="After thorough review..."
                        rows={5}
                        className="text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {assessmentExplanation.length} / 50 minimum
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="assessment-comments-mobile" className="text-sm font-medium">
                        Additional Comments (Optional)
                      </Label>
                      <Textarea
                        id="assessment-comments-mobile"
                        value={assessmentComments}
                        onChange={(e) => setAssessmentComments(e.target.value)}
                        placeholder="Any issues, concerns..."
                        rows={3}
                        className="text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Documents Upload Section - NEW */}
              {!isReadOnly && (
                <Card className="mt-6 border-blue-200">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent">
                    <CardTitle className="text-[#023F40] text-base flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Additional Documents
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Add documents beyond what the applicant submitted
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <DocumentUploadField
                      documents={additionalDocuments}
                      onDocumentsChange={setAdditionalDocuments}
                      label="Upload Additional Documents"
                      multiple={true}
                      maxFiles={10}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Notes Section */}
              {!isReadOnly && (
                <Card className="mt-6">
                  <CardContent className="p-4">
                    <Label htmlFor="notes-mobile-drawer" className="text-sm font-medium">Review Notes</Label>
                    <Textarea
                      id="notes-mobile-drawer"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any additional comments or observations..."
                      rows={6}
                      className="mt-2"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this application and send it to QA review?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-[#6DB27F]/10 rounded-lg">
              <p className="text-sm font-medium">Application Summary</p>
              <p className="text-sm text-gray-600 mt-1">Applicant: {application.applicantName}</p>
              <p className="text-sm text-gray-600">Rebate Amount: {formatCurrency(application.rebateAmount)}</p>
              <p className="text-sm text-gray-600">Eligibility Score: {score}%</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handleComplete('approve')}
                disabled={saving}
                className="bg-[#6DB27F] hover:bg-[#5da170]"
              >
                {saving ? 'Approving...' : 'Confirm Approval'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a clear reason for rejecting this application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a detailed reason for rejection (e.g., missing documents, insufficient income, etc.)..."
                rows={5}
                className="mt-2"
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handleComplete('reject')}
                disabled={saving || !rejectionReason.trim()}
                variant="destructive"
              >
                {saving ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clarification Request Dialog */}
      <Dialog open={showClarificationDialog} onOpenChange={setShowClarificationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#023F40]">
              <MessageCircle className="w-5 h-5" />
              Request Clarification from Asset Financier
            </DialogTitle>
            <DialogDescription>
              Send a message to the Asset Financier requesting additional information or clarification on specific criteria.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="clarificationMessage">Clarification Message *</Label>
              <Textarea
                id="clarificationMessage"
                value={clarificationMessage}
                onChange={(e) => setClarificationMessage(e.target.value)}
                placeholder="Example: Please provide additional documentation for the motorcycle ownership verification. The chassis number provided doesn't match our records..."
                rows={6}
                className="mt-2"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Be specific about what information is needed. The application will be put on hold until the financier responds.
              </p>
            </div>

            {/* Show failed criteria */}
            {Object.values(evaluations).some(v => v === false) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-900 mb-2">Criteria marked as NO:</p>
                <ul className="list-disc list-inside space-y-1">
                  {criteria
                    .filter(c => evaluations[c.id] === false)
                    .map(c => (
                      <li key={c.id} className="text-sm text-yellow-800">{c.text}</li>
                    ))}
                </ul>
                <p className="text-xs text-yellow-700 mt-2">These criteria will be included in the clarification request.</p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setShowClarificationDialog(false);
                setClarificationMessage('');
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleRequestClarification}
                disabled={saving || !clarificationMessage.trim()}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                {saving ? 'Sending...' : 'Send Clarification Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forward to M&E Dialog */}
      <ForwardToMEDialog
        open={showForwardToMEDialog}
        onOpenChange={setShowForwardToMEDialog}
        applicationId={application.id}
        onForward={async (forwardData) => {
          toast.success('Application forwarded to M&E for investigation');
          setShowForwardToMEDialog(false);
          onBack();
        }}
      />

      {/* API Data View Modals */}
      {/* Social Registry Modal */}
      <Dialog open={showSocialRegistryModal} onOpenChange={setShowSocialRegistryModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#023F40]" />
              Social Registry Data
            </DialogTitle>
            <DialogDescription>
              Retrieved data from Social Registry API
            </DialogDescription>
          </DialogHeader>
          {socialRegistryCheck.data && (
            <div className="space-y-4">
              {socialRegistryCheck.data.found ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Income Level</p>
                    <p className="font-medium">{socialRegistryCheck.data.incomeLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Household Size</p>
                    <p className="font-medium">{socialRegistryCheck.data.householdSize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ubudehe Category</p>
                    <p className="font-medium">{socialRegistryCheck.data.ubudeheCategory}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{socialRegistryCheck.data.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Registered Date</p>
                    <p className="font-medium">{new Date(socialRegistryCheck.data.registeredDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Checked At</p>
                    <p className="font-medium">{new Date(socialRegistryCheck.data.checkedAt).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-900">{socialRegistryCheck.data.reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Motorcycles Modal */}
      <Dialog open={showMotorcyclesModal} onOpenChange={setShowMotorcyclesModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="w-5 h-5 text-[#023F40]" />
              Additional Motorcycles Data
            </DialogTitle>
            <DialogDescription>
              Retrieved data from RURA/RRA motorcycle registry
            </DialogDescription>
          </DialogHeader>
          {motorcyclesCheck.data && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Motorcycles</p>
                  <p className="font-medium text-lg">{motorcyclesCheck.data.totalCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium">{motorcyclesCheck.data.message}</p>
                </div>
              </div>
              
              <div>
                <p className="font-semibold mb-2">Registered Motorcycles:</p>
                <div className="space-y-2">
                  {motorcyclesCheck.data.motorcycles.map((moto: any, i: number) => (
                    <div key={i} className="border rounded-lg p-3 bg-white">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Plate Number</p>
                          <p className="font-medium">{moto.plateNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Brand/Model</p>
                          <p className="font-medium">{moto.brand} {moto.model}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status</p>
                          <Badge variant={moto.status === 'Active' ? 'default' : 'secondary'}>
                            {moto.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* NIDA Modal */}
      <Dialog open={showNidaModal} onOpenChange={setShowNidaModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-[#023F40]" />
              NIDA Verification Data
            </DialogTitle>
            <DialogDescription>
              Retrieved data from NIDA national ID database
            </DialogDescription>
          </DialogHeader>
          {nidaCheck.data && (
            <div className="space-y-4">
              {nidaCheck.data.verified ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{nidaCheck.data.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">{new Date(nidaCheck.data.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium">{nidaCheck.data.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Province</p>
                    <p className="font-medium">{nidaCheck.data.province}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">District</p>
                    <p className="font-medium">{nidaCheck.data.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Checked At</p>
                    <p className="font-medium">{new Date(nidaCheck.data.checkedAt).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-900">{nidaCheck.data.reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* RURA License Modal */}
      <Dialog open={showRuraModal} onOpenChange={setShowRuraModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#023F40]" />
              RURA Taxi License Data
            </DialogTitle>
            <DialogDescription>
              Retrieved data from RURA taxi license database
            </DialogDescription>
          </DialogHeader>
          {ruraCheck.data && (
            <div className="space-y-4">
              {ruraCheck.data.valid ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">License Number</p>
                    <p className="font-medium">{ruraCheck.data.licenseNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">License Type</p>
                    <p className="font-medium">{ruraCheck.data.licenseType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Issue Date</p>
                    <p className="font-medium">{new Date(ruraCheck.data.issueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expiry Date</p>
                    <p className="font-medium">{new Date(ruraCheck.data.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Province</p>
                    <p className="font-medium">{ruraCheck.data.province}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge variant="default" className="bg-[#6DB27F]">{ruraCheck.data.status}</Badge>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-900">{ruraCheck.data.reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
