import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner@2.0.3';
import { ArrowLeft, Save, CheckCircle, XCircle, FileText, AlertCircle } from 'lucide-react';
import { User } from '../../utils/auth';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface Application {
  id: string;
  companyName: string;
  registrationNumber: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  rebateAmount: string;
  projectDescription: string;
  vehicleCount?: string;
  emissionReduction?: string;
  documents?: {
    businessLicense?: { name: string; url: string };
    financialStatements?: { name: string; url: string };
    emissionCertificate?: { name: string; url: string };
  };
  status: string;
  createdAt: string;
}

interface Criterion {
  id: string;
  text: string;
  enabled: boolean;
  order: number;
}

interface CriteriaEvaluation {
  [criterionId: string]: boolean | null;
}

interface ApplicationReviewProps {
  application: Application;
  user: User;
  onBack: () => void;
}

export function ApplicationReview({ application, user, onBack }: ApplicationReviewProps) {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [evaluations, setEvaluations] = useState<CriteriaEvaluation>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

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

    setSaving(true);
    try {
      const score = calculateScore();
      await api.completeEvaluation(application.id.replace('application:', ''), {
        decision,
        criteriaEvaluations: evaluations,
        notes,
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
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Queue
            </Button>
            <div>
              <h2 className="text-xl font-bold">{application.companyName}</h2>
              <p className="text-sm text-gray-600">Registration: {application.registrationNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Score Display */}
            <div className="text-center px-6 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">{score}%</div>
              <div className="text-xs text-gray-600">Eligibility Score</div>
              <div className="text-xs text-gray-500 mt-1">
                {evaluatedCount} / {criteria.length} evaluated
              </div>
            </div>

            {!isReadOnly && (
              <>
                <Button variant="outline" onClick={handleSaveProgress} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Progress
                </Button>
                <Button variant="destructive" onClick={() => setShowRejectDialog(true)} disabled={saving}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={() => setShowApproveDialog(true)} disabled={saving}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Application Details & Documents */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Application Details</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Company Name</label>
                      <p className="mt-1">{application.companyName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Registration Number</label>
                      <p className="mt-1">{application.registrationNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Contact Person</label>
                      <p className="mt-1">{application.contactPerson}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="mt-1">{application.contactEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="mt-1">{application.contactPhone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Rebate Amount Requested</label>
                      <p className="mt-1 text-lg font-semibold text-blue-600">
                        ${parseFloat(application.rebateAmount).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {application.vehicleCount && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Number of Vehicles</label>
                        <p className="mt-1">{application.vehicleCount}</p>
                      </div>
                    )}
                    {application.emissionReduction && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Emission Reduction</label>
                        <p className="mt-1">{application.emissionReduction}%</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Project Description</label>
                    <p className="mt-2 whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {application.projectDescription}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Submitted</label>
                    <p className="mt-1">
                      {new Date(application.createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <div className="space-y-4">
                {application.documents?.businessLicense && (
                  <DocumentViewer
                    title="Business License"
                    document={application.documents.businessLicense}
                  />
                )}
                {application.documents?.financialStatements && (
                  <DocumentViewer
                    title="Financial Statements"
                    document={application.documents.financialStatements}
                  />
                )}
                {application.documents?.emissionCertificate && (
                  <DocumentViewer
                    title="Emission Certificate"
                    document={application.documents.emissionCertificate}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Criteria Checklist */}
        <div className="w-96 border-l bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
            <h3 className="font-semibold">Eligibility Criteria</h3>
            <p className="text-sm text-gray-600 mt-1">
              Mark YES or NO for each criterion
            </p>
          </div>

          <div className="p-6 space-y-4">
            {criteria.map((criterion, index) => (
              <Card key={criterion.id} className={evaluations[criterion.id] !== undefined && evaluations[criterion.id] !== null ? 'border-blue-200' : ''}>
                <CardContent className="p-4">
                  <div className="flex gap-2 mb-3">
                    <span className="text-gray-500 font-medium">{index + 1}.</span>
                    <p className="flex-1 text-sm">{criterion.text}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={evaluations[criterion.id] === true ? 'default' : 'outline'}
                      onClick={() => handleCriterionChange(criterion.id, true)}
                      className="flex-1"
                      disabled={isReadOnly}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      YES
                    </Button>
                    <Button
                      size="sm"
                      variant={evaluations[criterion.id] === false ? 'destructive' : 'outline'}
                      onClick={() => handleCriterionChange(criterion.id, false)}
                      className="flex-1"
                      disabled={isReadOnly}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      NO
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Notes Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Review Notes</CardTitle>
                <CardDescription>
                  Document your reasoning and observations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter your analysis notes here..."
                  rows={6}
                  disabled={isReadOnly}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Application?</AlertDialogTitle>
            <AlertDialogDescription>
              This application will be sent to the QA team for secondary review. The eligibility score is <strong>{score}%</strong>.
              <br /><br />
              Make sure all criteria are properly evaluated and your notes are complete.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleComplete('approve')}>
              Approve & Send to QA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Application?</AlertDialogTitle>
            <AlertDialogDescription>
              This application will be marked as rejected. The applicant will be notified of the decision.
              <br /><br />
              Please ensure your review notes clearly explain the reasons for rejection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleComplete('reject')}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Application
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface DocumentViewerProps {
  title: string;
  document: { name: string; url: string };
}

function DocumentViewer({ title, document }: DocumentViewerProps) {
  const isPDF = document.name.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif)$/i.test(document.name);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {title}
        </CardTitle>
        <CardDescription>{document.name}</CardDescription>
      </CardHeader>
      <CardContent>
        {isPDF ? (
          <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <iframe
              src={document.url}
              className="w-full h-full"
              title={title}
            />
          </div>
        ) : isImage ? (
          <div className="border rounded-lg overflow-hidden">
            <img
              src={document.url}
              alt={title}
              className="w-full"
            />
          </div>
        ) : (
          <div className="p-6 text-center border rounded-lg">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600 mb-4">Preview not available</p>
            <Button asChild variant="outline">
              <a href={document.url} target="_blank" rel="noopener noreferrer">
                Open Document
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}