import { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  User, 
  FileText, 
  Car, 
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../utils/api';
import { DocumentUploadSection, type AdditionalDocument } from './DocumentUploadSection';
import { calculateRebateAmount, generateTicketPreview, getRebateEligibilityLabel } from '../../utils/rebateCalculation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';


interface SubmitApplicationFormProps {
  organizationId: string;
  requireAssetFinancierSelection?: boolean;
  assetFinancierOptions?: Array<{ id: string; name: string }>;
  /** Marketing agents submit proposals to AF for review; AF users submit to RGF. */
  submissionMode?: 'rgf' | 'af-proposal';
  initialData?: Partial<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    isWoman: string;
    phoneNumber: string;
    email: string;
    tin: string;
    nationalId: string;
    driversLicense: string;
    identityDocuments: any;
    brand: string;
    model: string;
    retrofitAssembler: string;
    retrofitCost: string;
    yearOfManufacture: string;
    chassisNumber: string;
    purchasePrice: string;
    loanAmount: string;
    rebateAmount: string;
    loanTerm: string;
    repaymentFrequency: string;
    monthlyRepayment: string;
    isRetrofit: boolean;
    documents: any;
    additionalDocuments: AdditionalDocument[];
  }>;
  prefilledTicketNumber?: string;
  submittedBy?: string;
  onSaveUnfinished?: (formData: Record<string, unknown>, missingFields: string[], ticketNumber: string) => void;
  onSubmitted?: (ticketNumber: string) => void;
}

type ApplicationStep = 'identity' | 'vehicle' | 'documents' | 'review';

export function SubmitApplicationForm({
  organizationId,
  requireAssetFinancierSelection = false,
  assetFinancierOptions = [],
  submissionMode = 'rgf',
  initialData,
  prefilledTicketNumber,
  submittedBy = 'AF User',
  onSaveUnfinished,
  onSubmitted,
}: SubmitApplicationFormProps) {
  const isAfProposal = submissionMode === 'af-proposal';
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('identity');
  const [loading, setLoading] = useState(false);
  const [ticketNumber] = useState(() => prefilledTicketNumber || generateTicketPreview());
  const [showMissingDialog, setShowMissingDialog] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [selectedAssetFinancierId, setSelectedAssetFinancierId] = useState(organizationId);
  
  // Form data state
  const [formData, setFormData] = useState({
    // Identity
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    isWoman: '',
    phoneNumber: '',
    email: '',
    tin: '',
    nationalId: '',
    driversLicense: '',
    identityDocuments: {} as any,
    // Vehicle
    brand: '',
    model: '',
    retrofitAssembler: '',
    retrofitCost: '',
    yearOfManufacture: '',
    chassisNumber: '',
    purchasePrice: '',
    loanAmount: '',
    rebateAmount: '',
    loanTerm: '',
    repaymentFrequency: 'daily',
    monthlyRepayment: '',
    // Documents
    isRetrofit: false,
    documents: {} as any,
    additionalDocuments: [] as AdditionalDocument[],
  });

  const steps: { key: ApplicationStep; label: string; icon: any }[] = [
    { key: 'identity', label: 'Individual Information', icon: User },
    { key: 'documents', label: 'Documentation', icon: Upload },
    { key: 'vehicle', label: 'Vehicle Financing', icon: Car },
    { key: 'review', label: 'Review & Submit', icon: FileText }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  const rebatePreview = useMemo(() => {
    const baseAmount = formData.isRetrofit
      ? parseFloat(formData.retrofitCost) || 0
      : parseFloat(formData.purchasePrice) || 0;
    return calculateRebateAmount(baseAmount, {
      isWoman: formData.isWoman === 'yes',
      isRetrofit: formData.isRetrofit,
    });
  }, [formData.purchasePrice, formData.retrofitCost, formData.isWoman, formData.isRetrofit]);

  useEffect(() => {
    if (rebatePreview > 0) {
      setFormData((prev) => ({ ...prev, rebateAmount: String(rebatePreview) }));
    }
  }, [rebatePreview]);

  useEffect(() => {
    if (!initialData) return;
    setFormData((prev) => ({
      ...prev,
      ...initialData,
      identityDocuments: { ...prev.identityDocuments, ...(initialData.identityDocuments || {}) },
      documents: { ...prev.documents, ...(initialData.documents || {}) },
      additionalDocuments: initialData.additionalDocuments ?? prev.additionalDocuments,
    }));
  }, [initialData]);

  const getMissingMandatoryFields = (): string[] => {
    const missing: string[] = [];
    if (!formData.firstName.trim()) missing.push('First Name');
    if (!formData.lastName.trim()) missing.push('Last Name');
    if (!formData.nationalId.trim()) missing.push('National ID');
    if (!formData.dateOfBirth) missing.push('Date of Birth');
    if (!formData.isWoman) missing.push('Gender (dropdown)');
    if (!formData.identityDocuments?.nationalIdDoc?.uploaded) missing.push('National ID Document');
    if (!formData.identityDocuments?.driversLicenseDoc?.uploaded) missing.push("Motorcycle Driver's License Document");
    if (!formData.identityDocuments?.dobDoc?.uploaded) missing.push('Date of Birth Document');
    if (!formData.driversLicense.trim()) missing.push('Motorcycle License');
    if (!formData.brand) missing.push('E-Moto Supplier');
    if (!formData.model) missing.push('E-Moto Model');
    if (formData.isRetrofit && !formData.retrofitAssembler.trim()) {
      missing.push('Retrofit Assembler');
    }
    if (formData.isRetrofit && !formData.retrofitCost) missing.push('Retrofit Cost (RWF)');
    if (!formData.isRetrofit && !formData.purchasePrice) missing.push('Retail E-Moto Price (RWF)');
    if (!formData.documents?.signedLease?.uploaded) missing.push('Signed Lease');
    if (!formData.documents?.affidavit?.uploaded) missing.push('Individual Affidavit (Financial Need)');
    if (!formData.documents?.afFinancialNeed?.uploaded) missing.push('AF Confirmation of Financial Need');
    if (formData.isRetrofit && !formData.documents?.retrofitSuitability?.uploaded) {
      missing.push('Signed Retrofit Suitability Statement');
    }
    if (formData.isRetrofit && !formData.documents?.iceDisposalAgreement?.uploaded) {
      missing.push('ICE-Engine Disposal Agreement');
    }
    return missing;
  };

  const DUPLICATE_NATIONAL_IDS = ['1199080012345678', '1199570087654321'];
  const isPotentialDuplicate = () => DUPLICATE_NATIONAL_IDS.includes(formData.nationalId.trim());

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].key);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].key);
    }
  };

  const handleDocumentUpload = (docType: string, file: { name: string }) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: {
          uploaded: true,
          uploadedAt: new Date().toISOString(),
          name: file.name
        }
      }
    }));
  };

  const handleDocumentRemove = (docType: string) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: {
          uploaded: false
        }
      }
    }));
  };

  const handleAdditionalDocumentsChange = (docs: AdditionalDocument[]) => {
    setFormData((prev) => ({ ...prev, additionalDocuments: docs }));
  };

  const handleIdentityDocUpload = (docType: string, file: { name: string }) => {
    setFormData(prev => ({
      ...prev,
      identityDocuments: {
        ...prev.identityDocuments,
        [docType]: {
          uploaded: true,
          uploadedAt: new Date().toISOString(),
          name: file.name,
        },
      },
    }));
  };

  const handleIdentityDocRemove = (docType: string) => {
    setFormData(prev => ({
      ...prev,
      identityDocuments: {
        ...prev.identityDocuments,
        [docType]: { uploaded: false },
      },
    }));
  };

  const saveUnfinishedDraft = () => {
    const missing = getMissingMandatoryFields();
    onSaveUnfinished?.(formData, missing, ticketNumber);
    toast.success('Saved as unfinished application', {
      description: isAfProposal
        ? `${ticketNumber} is saved in your pipeline. Complete Step 4 to send it to your Asset Financier for review.`
        : `${ticketNumber} is in Rebate Pipeline Dev. Complete Step 4 SUBMIT when ready.`,
    });
  };

  const handleSaveProgress = () => {
    saveUnfinishedDraft();
  };

  const handleSubmit = async () => {
    if (requireAssetFinancierSelection && !selectedAssetFinancierId) {
      toast.error('Please select an Asset Financier first');
      return;
    }
    const missing = getMissingMandatoryFields();
    if (missing.length > 0) {
      setMissingFields(missing);
      saveUnfinishedDraft();
      setShowMissingDialog(true);
      return;
    }
    if (isPotentialDuplicate()) {
      setShowDuplicateDialog(true);
      return;
    }

    try {
      setLoading(true);
      
      // Prepare application data
      const applicantName = `${formData.firstName || 'Sample'} ${formData.lastName || 'Rider'}`.trim();
      const applicationData = {
        organizationId: selectedAssetFinancierId || organizationId,
        applicantName: applicantName || 'Sample Rider',
        nationalId: formData.nationalId || '1198780012345678',
        driversLicense: formData.driversLicense || '',
        phoneNumber: formData.phoneNumber || '+250788123456',
        dateOfBirth: formData.dateOfBirth || '',
        email: formData.email || '',
        tin: formData.tin || '',
        identityDocuments: formData.identityDocuments || {},
        motorcycleBrand: formData.brand || 'Opibus',
        motorcycleModel: formData.model || 'Moto',
        retrofitAssembler: formData.retrofitAssembler || '',
        retrofitCost: formData.retrofitCost || '',
        yearOfManufacture: formData.yearOfManufacture || '2024',
        chassisNumber: formData.chassisNumber || '',
        loanAmount: formData.loanAmount || '3000000',
        rebateAmount: formData.rebateAmount || String(rebatePreview) || '450000',
        loanTerm: formData.loanTerm || '24',
        repaymentFrequency: formData.repaymentFrequency || 'daily',
        monthlyRepayment: formData.monthlyRepayment || '4167',
        isRetrofit: formData.isRetrofit,
        isWoman: formData.isWoman === 'yes',
        ticketNumber,
        documents: formData.documents,
        additionalDocuments: formData.additionalDocuments,
        status: 'submitted'
      };

      await api.submitApplication(applicationData).catch(() => {
        // UI-only demo: still show success when backend unavailable
      });
      // Persist the completed application into the local pipeline, then apply submit status.
      onSaveUnfinished?.(formData, [], ticketNumber);
      if (isAfProposal) {
        toast.success('Rebate proposal submitted to Asset Financier', {
          description:
            'Your AF finance decision-makers will review this proposal and submit eligible rebates to RGF.',
        });
      } else {
        toast.success('Rebate requirements submitted to RGF Rebate Team', {
          description:
            'E-moto possession confirmation is optional at submit but required before drawing from your rebate escrow account.',
        });
      }
      onSubmitted?.(ticketNumber);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        isWoman: '',
        phoneNumber: '',
        email: '',
        tin: '',
        nationalId: '',
        driversLicense: '',
        identityDocuments: {},
        brand: '',
        model: '',
        retrofitAssembler: '',
        retrofitCost: '',
        yearOfManufacture: '',
        chassisNumber: '',
        purchasePrice: '',
        loanAmount: '',
        rebateAmount: '',
        loanTerm: '',
        repaymentFrequency: 'daily',
        monthlyRepayment: '',
        isRetrofit: false,
        documents: {},
        additionalDocuments: [],
      });
      setCurrentStep('identity');
    } catch (error: any) {
      console.error('Failed to submit application:', error);
      toast.error('Failed to submit application', {
        description: error.message || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mt-6">
        <h2 className="text-lg sm:text-xl text-[#023F40]">
          {isAfProposal ? 'Submit Rebate Proposal' : 'Submit Rebate Requirements'}
        </h2>
        <p className="text-gray-600 mt-1">
          {isAfProposal
            ? 'Complete the same rebate application steps used by Asset Financiers. Your submission goes to AF finance decision-makers for review — it is not sent to RGF until they approve and submit it.'
            : 'Submit leases with documentation for individuals who required financial support (rebates) to meet your e-moto financing requirements.'}
        </p>
        {requireAssetFinancierSelection && (
          <div className="mt-4 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asset Financier *
            </label>
            <Select value={selectedAssetFinancierId} onValueChange={setSelectedAssetFinancierId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Asset Financier" />
              </SelectTrigger>
              <SelectContent>
                {assetFinancierOptions.map((af) => (
                  <SelectItem key={af.id} value={af.id}>
                    {af.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="mt-3 inline-flex items-center gap-2 bg-[#023F40]/5 border border-[#023F40]/20 rounded-lg px-3 py-2 text-sm">
          <span className="text-gray-600">Ticket Number:</span>
          <span className="font-semibold text-[#023F40]">{ticketNumber}</span>
          <span className="text-xs text-gray-500">(assigned on submit)</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.key === currentStep;
            const isCompleted = index < currentStepIndex;

            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted
                        ? 'bg-green-600 text-white'
                        : isActive
                        ? 'bg-[#023F40] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 text-center ${
                      isActive ? 'text-[#023F40] font-medium' : 'text-gray-600'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      index < currentStepIndex ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {currentStep === 'identity' && (
          <IdentityStep
            formData={formData}
            setFormData={setFormData}
            onIdentityDocUpload={handleIdentityDocUpload}
            onIdentityDocRemove={handleIdentityDocRemove}
          />
        )}
        {currentStep === 'vehicle' && <VehicleStep formData={formData} setFormData={setFormData} />}
        {currentStep === 'documents' && (
          <DocumentsStep
            isRetrofit={formData.isRetrofit}
            documents={formData.documents}
            additionalDocuments={formData.additionalDocuments}
            onDocumentUpload={handleDocumentUpload}
            onDocumentRemove={handleDocumentRemove}
            onAdditionalDocumentsChange={handleAdditionalDocumentsChange}
          />
        )}
        {currentStep === 'review' && (
          <ReviewStep
            formData={formData}
            ticketNumber={ticketNumber}
            rebatePreview={rebatePreview}
            isAfProposal={isAfProposal}
          />
        )}

        <Dialog open={showMissingDialog} onOpenChange={setShowMissingDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="w-5 h-5" />
                Missing required information
              </DialogTitle>
              <DialogDescription>
                {isAfProposal
                  ? 'This application was saved as unfinished in your pipeline. Fill in the missing items below, then hit SUBMIT on Step 4 to send it to your Asset Financier for review.'
                  : 'This application was saved as unfinished in your pipeline. Fill in the missing items below, then hit SUBMIT on Step 4 to send it to RGF.'}
              </DialogDescription>
            </DialogHeader>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              {missingFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
            <DialogFooter>
              <Button onClick={() => setShowMissingDialog(false)} className="bg-[#023F40] hover:bg-[#035f60]">
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                Possible duplicate rebate detected
              </DialogTitle>
              <DialogDescription>
                Another rebate appears to exist for this National ID. Please review before submitting to reduce duplicate rebate risk.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              National ID: <span className="font-semibold">{formData.nationalId || 'N/A'}</span>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>
                Go back
              </Button>
              <Button
                className="bg-red-700 hover:bg-red-800"
                onClick={async () => {
                  setShowDuplicateDialog(false);
                  toast.error('Submission blocked pending duplicate review');
                }}
              >
                Acknowledge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
          {currentStepIndex > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={loading}
            >
              Back
            </Button>
          )}
          <div className="flex-1" />
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveProgress}
            disabled={loading}
            className="border-gray-300"
          >
            Save Progress
          </Button>
          {currentStepIndex < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={loading}
              className="bg-[#023F40] hover:bg-[#035f60]"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#023F40] hover:bg-[#035f60]"
            >
              {isAfProposal ? 'SUBMIT TO AF' : 'SUBMIT'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function IdentityStep({
  formData,
  setFormData,
  onIdentityDocUpload,
  onIdentityDocRemove,
}: {
  formData: any;
  setFormData: any;
  onIdentityDocUpload: (docType: string, file: { name: string }) => void;
  onIdentityDocRemove: (docType: string) => void;
}) {
  const identityDocs = [
    { key: 'nationalIdDoc', label: 'National ID Document', description: 'Upload a copy of the national ID.' },
    {
      key: 'driversLicenseDoc',
      label: "Motorcycle Driver's License Document",
      description: 'Upload a copy of the motorcycle license.',
    },
    { key: 'dobDoc', label: 'Date of Birth Document', description: 'Supporting document confirming date of birth.' },
  ];

  const handleIdentityFileUpload = (docType: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      onIdentityDocUpload(docType, { name: file.name });
      toast.success('Document uploaded', { description: file.name });
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Step 1: Rider's Identity</h3>
      <p className="text-sm text-gray-600">
        Please provide the basic information on the individual who requires financial support to acquire an e-moto or retrofit their ICE-moto into an e-moto. The information is mandatory and needs to be filled in, including numbers for the national identification card and motorcycle license.
      </p>

      <div className="space-y-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Individual first name(s) *
            </label>
            <Input 
              type="text" 
              placeholder="Rider's first name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Individual last name(s) *
            </label>
            <Input 
              type="text" 
              placeholder="Rider's last name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender? *
            </label>
            <Select
              value={formData.isWoman}
              onValueChange={(value) => setFormData({ ...formData, isWoman: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Man or Woman" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">Man</SelectItem>
                <SelectItem value="yes">Woman</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <Input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Type? *
            </label>
            <Select
              value={formData.isRetrofit ? 'yes' : 'no'}
              onValueChange={(value) => setFormData({ ...formData, isRetrofit: value === 'yes' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select New E-Moto or Retrofit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">New E-Moto</SelectItem>
                <SelectItem value="yes">Retrofit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <Input
              type="tel"
              placeholder="+250 XXX XXX XXX"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (Optional)
            </label>
            <Input 
              type="email" 
              placeholder="rider@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            TIN (Tax Identification Number)
          </label>
          <Input 
            type="text" 
            placeholder="Optional"
            value={formData.tin}
            onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
          />
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900 mb-4">Identification Numbers</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                National ID *
              </label>
              <Input
                type="text"
                placeholder="1 XXXX X XXXXXXX X XX"
                maxLength={16}
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motorcycle Driver's License *
              </label>
              <Input
                type="text"
                placeholder="DL-YYYY-XXXXXX"
                value={formData.driversLicense}
                onChange={(e) => setFormData({ ...formData, driversLicense: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900 mb-1">Identification Documents</h4>
          <p className="text-xs text-gray-600 mb-3">Upload copies of the documents listed below.</p>
          <div className="space-y-2">
            {identityDocs.map((doc) => {
              const status = formData.identityDocuments?.[doc.key];
              const uploaded = status?.uploaded;
              return (
                <div
                  key={doc.key}
                  className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 bg-white"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {doc.label}
                      <span className="text-red-500 ml-0.5">*</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">{doc.description}</p>
                    {uploaded && status?.name && (
                      <p className="text-xs text-green-800 bg-green-50 border border-green-200 rounded px-2 py-1 mt-2 truncate">
                        {status.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {uploaded ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleIdentityFileUpload(doc.key)}>
                          Replace
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onIdentityDocRemove(doc.key)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleIdentityFileUpload(doc.key)}
                        className="bg-[#0a7d4b] hover:bg-[#0c6b42]"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1" />
                        Upload
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

function VehicleStep({ formData, setFormData }: { formData: any, setFormData: any }) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Step 3: Specify vehicle and costs</h3>
      <p className="text-sm text-gray-600">
        This page is to provide information on the vehicle the individual is financing and the cost. The amount of the rebate will be automatically calculated by the system. Men with financial needs to acquire a new e-moto are eligible for a rebate of 18% of the retail e-moto cost, and a rebate of 20% of the cost of retrofitting their ICE-moto to an e-moto. Women with financial needs to acquire an e-moto or retrofit their ICE-moto are eligible for a rebate covering 25% of the cost.
      </p>

      <div className="space-y-4 mt-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Vehicle Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-Moto Provider *
              </label>
              <Select onValueChange={(value) => setFormData({ ...formData, brand: value })} value={formData.brand}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ampersand">Ampersand</SelectItem>
                  <SelectItem value="Rem">Rem</SelectItem>
                  <SelectItem value="Safi">Safi</SelectItem>
                  <SelectItem value="Spiro">Spiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-Moto Model *
              </label>
              <Input
                type="text"
                placeholder="Enter e-moto model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
          </div>

          {formData.isRetrofit && (
            <div className="mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retrofit Assembler *
                </label>
                <Select
                  onValueChange={(value) => setFormData({ ...formData, retrofitAssembler: value })}
                  value={formData.retrofitAssembler}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select retrofit assembler" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rem">Rem</SelectItem>
                    <SelectItem value="Safi">Safi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <h4 className="font-medium text-gray-900 mb-4 mt-6">Financing Details</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.isRetrofit ? 'Retrofit Cost (RWF) *' : 'Retail E-Moto Price (RWF) *'}
              </label>
              <Input
                type="number"
                placeholder="1,000,000"
                value={formData.isRetrofit ? formData.retrofitCost : formData.purchasePrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ...(formData.isRetrofit
                      ? { retrofitCost: e.target.value }
                      : { purchasePrice: e.target.value }),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Contract Repayment Amount (RWF) *
              </label>
              <Input
                type="number"
                placeholder="2,550,000"
                value={formData.loanAmount}
                onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rebate Amount (RWF) — auto-calculated
              </label>
              <Input
                type="number"
                readOnly
                className="bg-gray-50 font-semibold text-[#023F40]"
                value={formData.rebateAmount}
              />
              <p className="text-xs text-[#023F40] mt-1">
                {getRebateEligibilityLabel({
                  isWoman: formData.isWoman === 'yes',
                  isRetrofit: formData.isRetrofit,
                })}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Term (months) *
              </label>
              <Input
                type="number"
                min="1"
                placeholder="24"
                value={formData.loanTerm}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value > 0 || e.target.value === '') {
                    setFormData({ ...formData, loanTerm: e.target.value });
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repayment Frequency *
              </label>
              <Select 
                value={formData.repaymentFrequency || 'daily'}
                onValueChange={(value: string) => setFormData({ ...formData, repaymentFrequency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repayment Amount (RWF) *
              </label>
              <Input
                type="number"
                placeholder="4,167"
                value={formData.monthlyRepayment}
                onChange={(e) => setFormData({ ...formData, monthlyRepayment: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.repaymentFrequency === 'weekly'
                  ? 'Weekly'
                  : formData.repaymentFrequency === 'monthly'
                    ? 'Monthly'
                    : 'Daily'}{' '}
                repayment amount
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentsStep({
  isRetrofit,
  documents,
  additionalDocuments,
  onDocumentUpload,
  onDocumentRemove,
  onAdditionalDocumentsChange,
}: {
  isRetrofit: boolean;
  documents: any;
  additionalDocuments: AdditionalDocument[];
  onDocumentUpload: (docType: string, file: { name: string }) => void;
  onDocumentRemove: (docType: string) => void;
  onAdditionalDocumentsChange: (docs: AdditionalDocument[]) => void;
}) {
  return (
    <DocumentUploadSection
      isRetrofit={isRetrofit}
      documents={documents}
      additionalDocuments={additionalDocuments}
      onDocumentUpload={onDocumentUpload}
      onDocumentRemove={onDocumentRemove}
      onAdditionalDocumentsChange={onAdditionalDocumentsChange}
    />
  );
}

function ReviewStep({
  formData,
  ticketNumber,
  rebatePreview,
  isAfProposal = false,
}: {
  formData: any;
  ticketNumber: string;
  rebatePreview: number;
  isAfProposal?: boolean;
}) {
  const display = (value?: string | number | null) =>
    value === undefined || value === null || value === '' ? '—' : String(value);

  const formatRwf = (value?: string | number | null) => {
    if (value === undefined || value === null || value === '') return '—';
    const n = Number(value);
    return Number.isNaN(n) ? '—' : `${n.toLocaleString()} RWF`;
  };

  const repaymentFrequencyLabel =
    formData.repaymentFrequency === 'weekly'
      ? 'Weekly'
      : formData.repaymentFrequency === 'monthly'
        ? 'Monthly'
        : formData.repaymentFrequency === 'daily'
          ? 'Daily'
          : '—';

  const SummaryRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between gap-4 border-b border-gray-200 pb-1.5">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Step 4: Review and Submit</h3>
      {isAfProposal ? (
        <>
          <p className="text-sm text-gray-600">
            Review the rebate proposal below. If all information and documents are correct, submit to your Asset
            Financier. AF finance decision-makers will assess eligibility and, when ready, submit the rebate to RGF.
          </p>
          <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded px-3 py-2">
            <strong>NOTE:</strong> This submission goes to your Asset Financier for internal review. It is{' '}
            <strong>not</strong> sent to RGF until AF decision-makers complete and submit it.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            This page is for reviewing the rebate application. If all the information and documents are correct, please submit to RGF. The RGF Rebate Team will review your submission and contact you with any issues. The RGF Rebate Quality Assurance Team approves rebate submission within 7 business days. If RGF has received confirmation of E-Moto Possession, RGF's CFO will review the rebate amount and provide authorization within 10 days to withdraw the rebate amount from the advance funds in your designated Rebate Bank Account.
          </p>
          <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded px-3 py-2">
            <strong>NOTE:</strong> RGF can verify and approve rebates <strong>without</strong> E-Moto Possession Confirmations. However, funds cannot be withdrawn from the Advance Funds in your Rebate Account until RGF has received and verified the E-Moto Possession Confirmation signed by your company and the client.
          </p>
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            E-moto possession confirmation is <strong>optional</strong> at initial submit. It is <strong>required</strong> before your AF draws rebate funds from the escrow account.
          </p>
        </>
      )}

      <div className="mt-6 space-y-4">
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 text-base">Rebate Submission Summary</h4>

          <div className="mb-6">
            <h5 className="text-sm font-semibold text-[#023F40] mb-3 uppercase tracking-wide">Ticket</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
              <SummaryRow label="Ticket Number" value={ticketNumber} />
            </div>
          </div>

          <div className="mb-6">
            <h5 className="text-sm font-semibold text-[#023F40] mb-3 uppercase tracking-wide">
              Individual Information
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
              <SummaryRow label="Individual first name(s)" value={display(formData.firstName)} />
              <SummaryRow label="Individual last name(s)" value={display(formData.lastName)} />
              <SummaryRow
                label="Gender?"
                value={
                  formData.isWoman === 'yes' ? 'Woman' : formData.isWoman === 'no' ? 'Man' : '—'
                }
              />
              <SummaryRow label="Date of Birth" value={display(formData.dateOfBirth)} />
              <SummaryRow
                label="Vehicle Type?"
                value={formData.isRetrofit ? 'Retrofit' : 'New E-Moto'}
              />
              <SummaryRow label="Phone Number" value={display(formData.phoneNumber)} />
              <SummaryRow label="Email (Optional)" value={display(formData.email)} />
              <SummaryRow label="TIN (Tax Identification Number)" value={display(formData.tin)} />
              <SummaryRow label="National ID" value={display(formData.nationalId)} />
              <SummaryRow
                label="Motorcycle Driver's License"
                value={display(formData.driversLicense)}
              />
            </div>
          </div>

          <div className="mb-6">
            <h5 className="text-sm font-semibold text-[#023F40] mb-3 uppercase tracking-wide">
              Vehicle and Financing
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
              <SummaryRow label="E-Moto Provider" value={display(formData.brand)} />
              <SummaryRow label="E-Moto Model" value={display(formData.model)} />
              {formData.isRetrofit && (
                <SummaryRow
                  label="Retrofit Assembler"
                  value={display(formData.retrofitAssembler)}
                />
              )}
              <SummaryRow
                label={formData.isRetrofit ? 'Retrofit Cost (RWF)' : 'Retail E-Moto Price (RWF)'}
                value={formatRwf(
                  formData.isRetrofit ? formData.retrofitCost : formData.purchasePrice
                )}
              />
              <SummaryRow
                label="Total Contract Repayment Amount (RWF)"
                value={formatRwf(formData.loanAmount)}
              />
              <SummaryRow
                label="Rebate Amount (RWF) — auto-calculated"
                value={rebatePreview > 0 ? `${rebatePreview.toLocaleString()} RWF` : '—'}
              />
              <SummaryRow
                label="Contract Term (months)"
                value={display(formData.loanTerm)}
              />
              <SummaryRow label="Repayment Frequency" value={repaymentFrequencyLabel} />
              <SummaryRow
                label="Repayment Amount (RWF)"
                value={formatRwf(formData.monthlyRepayment)}
              />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-300">
            <h5 className="text-sm font-semibold text-[#023F40] mb-3 uppercase tracking-wide">Mandatory Documents</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {[
                { label: 'Signed Financing Agreement with Retail Cost of E-Moto', uploaded: !!formData.documents?.signedLease?.uploaded },
                { label: 'Individual Affidavit of Financial Need', uploaded: !!formData.documents?.affidavit?.uploaded },
                { label: 'AF Confirmation of Financial Need', uploaded: !!formData.documents?.afFinancialNeed?.uploaded },
                { label: 'National ID Document', uploaded: !!formData.identityDocuments?.nationalIdDoc?.uploaded },
                { label: "Motorcycle Driver's License Document", uploaded: !!formData.identityDocuments?.driversLicenseDoc?.uploaded },
                { label: 'Date of Birth Document', uploaded: !!formData.identityDocuments?.dobDoc?.uploaded },
                ...(formData.isRetrofit
                  ? [
                      { label: 'Signed Retrofit Suitability Statement', uploaded: !!formData.documents?.retrofitSuitability?.uploaded },
                      { label: 'ICE-Engine Disposal Agreement (if Retrofit)', uploaded: !!formData.documents?.iceDisposalAgreement?.uploaded },
                    ]
                  : []),
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  {item.uploaded ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                  <span className={item.uploaded ? 'text-gray-700' : 'text-amber-700'}>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Optional (can be submitted later)</p>
              <div className="flex items-center gap-2 text-sm">
                {formData.documents?.possessionConfirmation?.uploaded ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" />
                )}
                <span className={formData.documents?.possessionConfirmation?.uploaded ? 'text-gray-700' : 'text-gray-500'}>
                  AF and Client Confirmation of E-Moto Possession
                </span>
              </div>
            </div>

            {formData.additionalDocuments?.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Additional Supporting Documents
                </p>
                <div className="space-y-1.5 text-sm">
                  {formData.additionalDocuments.map((doc: AdditionalDocument) => (
                    <div key={doc.id} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">
                        {doc.label}
                        <span className="text-gray-500"> — {doc.fileName}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}