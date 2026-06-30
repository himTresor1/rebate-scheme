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
import { vehicleBrands, getModelsByBrand, VehicleModel } from '../../utils/vehicleDatabase';
import { api } from '../../utils/api';
import { DocumentUploadSection } from './DocumentUploadSection';
import { calculateRebateAmount, generateTicketPreview, getRebateRateLabel } from '../../utils/rebateCalculation';
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
}

type ApplicationStep = 'identity' | 'vehicle' | 'documents' | 'review';

export function SubmitApplicationForm({ organizationId }: SubmitApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('identity');
  const [loading, setLoading] = useState(false);
  const [ticketNumber] = useState(() => generateTicketPreview());
  const [showMissingDialog, setShowMissingDialog] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    // Identity
    firstName: '',
    lastName: '',
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
    documents: {} as any
  });

  const steps: { key: ApplicationStep; label: string; icon: any }[] = [
    { key: 'identity', label: 'Rider Identity', icon: User },
    { key: 'vehicle', label: 'Vehicle & Financing', icon: Car },
    { key: 'documents', label: 'Documents', icon: Upload },
    { key: 'review', label: 'Review & Submit', icon: FileText }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  const rebatePreview = useMemo(() => {
    const retail = parseFloat(formData.purchasePrice) || 0;
    return calculateRebateAmount(retail, {
      isWoman: formData.isWoman === 'yes',
      isRetrofit: formData.isRetrofit,
    });
  }, [formData.purchasePrice, formData.isWoman, formData.isRetrofit]);

  useEffect(() => {
    if (rebatePreview > 0) {
      setFormData((prev) => ({ ...prev, rebateAmount: String(rebatePreview) }));
    }
  }, [rebatePreview]);

  const getMissingMandatoryFields = (): string[] => {
    const missing: string[] = [];
    if (!formData.firstName.trim()) missing.push('First Name');
    if (!formData.lastName.trim()) missing.push('Last Name');
    if (!formData.nationalId.trim()) missing.push('National ID');
    if (!formData.isWoman) missing.push('Woman? (dropdown)');
    if (!formData.driversLicense.trim()) missing.push('Motorcycle License');
    if (!formData.brand) missing.push('E-Moto Supplier');
    if (!formData.model) missing.push('E-Moto Model');
    if (!formData.purchasePrice) missing.push('Retail Cost of E-Moto (RWF)');
    if (!formData.documents?.signedLease?.uploaded) missing.push('Signed Lease');
    if (!formData.documents?.affidavit?.uploaded) missing.push('Individual Affidavit (Financial Need)');
    if (!formData.documents?.afFinancialNeed?.uploaded) missing.push('AF Confirmation of Financial Need');
    if (formData.isRetrofit && !formData.documents?.iceDisposalAgreement?.uploaded) {
      missing.push('ICE-Moto Engine Disposal Agreement');
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

  const handleRetrofitToggle = (value: boolean) => {
    setFormData(prev => ({
      ...prev,
      isRetrofit: value
    }));
  };

  const handleSubmit = async () => {
    const missing = getMissingMandatoryFields();
    if (missing.length > 0) {
      setMissingFields(missing);
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
        organizationId,
        applicantName: applicantName || 'Sample Rider',
        nationalId: formData.nationalId || '1198780012345678',
        driversLicense: formData.driversLicense || '',
        phoneNumber: formData.phoneNumber || '+250788123456',
        email: formData.email || '',
        tin: formData.tin || '',
        identityDocuments: formData.identityDocuments || {},
        motorcycleBrand: formData.brand || 'Opibus',
        motorcycleModel: formData.model || 'Moto',
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
        status: 'submitted'
      };

      await api.createApplication(applicationData);
      toast.success('Application submitted successfully!');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        isWoman: '',
        phoneNumber: '',
        email: '',
        tin: '',
        nationalId: '',
        driversLicense: '',
        identityDocuments: {},
        brand: '',
        model: '',
        yearOfManufacture: '',
        chassisNumber: '',
        purchasePrice: '',
        loanAmount: '',
        rebateAmount: '',
        loanTerm: '',
        repaymentFrequency: 'daily',
        monthlyRepayment: '',
        isRetrofit: false,
        documents: {}
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
        <h2 className="text-lg sm:text-xl text-[#023F40]">Submit Rebate Requirements</h2>
        <p className="text-gray-600 mt-1">
          Submit leases with documentation for individuals who required financial support (rebates) to meet your e-moto financing requirements.
        </p>
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
        {currentStep === 'identity' && <IdentityStep formData={formData} setFormData={setFormData} />}
        {currentStep === 'vehicle' && <VehicleStep formData={formData} setFormData={setFormData} />}
        {currentStep === 'documents' && (
          <DocumentsStep 
            isRetrofit={formData.isRetrofit}
            documents={formData.documents}
            onDocumentUpload={handleDocumentUpload}
            onDocumentRemove={handleDocumentRemove}
            onRetrofitToggle={handleRetrofitToggle}
          />
        )}
        {currentStep === 'review' && (
          <ReviewStep
            formData={formData}
            ticketNumber={ticketNumber}
            rebatePreview={rebatePreview}
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
                Please fill in the following mandatory fields and documents, then hit SUBMIT again.
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
              SUBMIT
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function IdentityStep({ formData, setFormData }: { formData: any, setFormData: any }) {
  const handleIdentityDocUpload = (docType: string, file: File) => {
    setFormData((prev: any) => ({
      ...prev,
      identityDocuments: {
        ...prev.identityDocuments,
        [docType]: {
          uploaded: true,
          uploadedAt: new Date().toISOString(),
          name: file.name,
          size: file.size
        }
      }
    }));
    toast.success(`${file.name} uploaded successfully`);
  };

  const handleIdentityDocRemove = (docType: string) => {
    setFormData((prev: any) => ({
      ...prev,
      identityDocuments: {
        ...prev.identityDocuments,
        [docType]: {
          uploaded: false
        }
      }
    }));
    toast.success('Document removed');
  };

  const renderDocumentUpload = (
    docType: string,
    label: string,
    required: boolean = true
  ) => {
    const doc = formData.identityDocuments?.[docType];
    const isUploaded = doc?.uploaded;

    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <label className="text-sm font-medium text-gray-900">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {!required && (
              <span className="text-xs text-gray-500 ml-1">(Optional)</span>
            )}
          </div>
          {isUploaded && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
        </div>

        {isUploaded ? (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Upload className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-green-900 truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs text-green-700">
                    Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleIdentityDocRemove(docType)}
                className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <input
              type="file"
              id={`identity-${docType}`}
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleIdentityDocUpload(docType, file);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />
            <label
              htmlFor={`identity-${docType}`}
              className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-[#023F40] hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Click to upload or drag and drop
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              PDF, JPG, or PNG (max 10MB)
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Step 1: Rider's Identity</h3>
      <p className="text-sm text-gray-600">
        Enter the rider's personal and identification information.
      </p>

      <div className="space-y-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name(s) *
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
              Last Name(s) *
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
              Woman? *
            </label>
            <Select
              value={formData.isWoman}
              onValueChange={(value) => setFormData({ ...formData, isWoman: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Retrofit? *
            </label>
            <Select
              value={formData.isRetrofit ? 'yes' : 'no'}
              onValueChange={(value) => setFormData({ ...formData, isRetrofit: value === 'yes' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No — New E-Moto</SelectItem>
                <SelectItem value="yes">Yes — Retrofit</SelectItem>
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
                Driver's License *
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
          <h4 className="font-medium text-gray-900 mb-4">Upload Identification Documents</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderDocumentUpload('nationalIdDoc', 'National ID Document', true)}
            {renderDocumentUpload('driversLicenseDoc', 'Driver\'s License Document', true)}
          </div>
          <div className="mt-4">
            {renderDocumentUpload('taxiLicense', 'Taxi License (RURA)', false)}
          </div>
        </div>
      </div>
    </div>
  );
}

function VehicleStep({ formData, setFormData }: { formData: any, setFormData: any }) {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [models, setModels] = useState<VehicleModel[]>([]);

  const handleBrandChange = (value: string) => {
    setBrand(value);
    setModels(getModelsByBrand(value));
    setModel('');
    setSelectedModel(null);
    setFormData((prev: any) => ({ ...prev, brand: value, model: '' }));
  };

  const handleModelChange = (value: string) => {
    setModel(value);
    const found = models.find(m => m.model === value);
    setSelectedModel(found || null);
    setFormData((prev: any) => ({ ...prev, model: value }));
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Step 2: Vehicle & Financing</h3>
      <p className="text-sm text-gray-600">
        Enter the e-motorcycle details and financing terms.
      </p>

      <div className="space-y-4 mt-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Vehicle Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-Moto Brand *
              </label>
              <Select onValueChange={handleBrandChange} value={brand}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Brand" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleBrands.map((brandName) => (
                    <SelectItem key={brandName} value={brandName}>
                      {brandName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model *
              </label>
              <Select onValueChange={handleModelChange} value={model} disabled={!brand || brand === 'Other'}>
                <SelectTrigger>
                  <SelectValue placeholder={brand === 'Other' ? 'Enter manually below' : 'Select Model'} />
                </SelectTrigger>
                <SelectContent>
                  {models.map((vehicleModel) => (
                    <SelectItem key={vehicleModel.id} value={vehicleModel.model}>
                      {vehicleModel.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {brand === 'Other' && (
                <Input type="text" placeholder="Enter model name" className="mt-2" />
              )}
            </div>
          </div>

          {selectedModel && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600">Battery Capacity:</span>
                  <span className="ml-2 font-medium text-gray-900">{selectedModel.batteryCapacity}</span>
                </div>
                <div>
                  <span className="text-gray-600">Year:</span>
                  <span className="ml-2 font-medium text-gray-900">{selectedModel.yearOfManufacture}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chassis Number *
              </label>
              <Input 
                type="text" 
                placeholder="Enter chassis number"
                value={formData.chassisNumber}
                onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year of Manufacture *
              </label>
              <Input 
                type="text" 
                placeholder={selectedModel?.yearOfManufacture || '2024'} 
                defaultValue={selectedModel?.yearOfManufacture}
                readOnly={!!selectedModel}
                value={formData.yearOfManufacture}
                onChange={(e) => setFormData({ ...formData, yearOfManufacture: e.target.value })}
              />
            </div>
          </div>

          <h4 className="font-medium text-gray-900 mb-4 mt-6">Financing Details</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retail Cost of E-Moto / Retrofit (RWF) *
              </label>
              <Input
                type="number"
                placeholder="1,000,000"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
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
              <p className="text-xs text-gray-500 mt-1">
                {getRebateRateLabel({
                  isWoman: formData.isWoman === 'yes',
                  isRetrofit: formData.isRetrofit,
                })} of retail cost
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
                {formData.repaymentFrequency === 'weekly' ? 'Weekly' : 'Daily'} repayment amount
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentsStep({ isRetrofit, documents, onDocumentUpload, onDocumentRemove, onRetrofitToggle }: { isRetrofit: boolean, documents: any, onDocumentUpload: any, onDocumentRemove: any, onRetrofitToggle: any }) {
  return (
    <DocumentUploadSection
      isRetrofit={isRetrofit}
      documents={documents}
      onDocumentUpload={onDocumentUpload}
      onDocumentRemove={onDocumentRemove}
      onRetrofitToggle={onRetrofitToggle}
    />
  );
}

function ReviewStep({
  formData,
  ticketNumber,
  rebatePreview,
}: {
  formData: any;
  ticketNumber: string;
  rebatePreview: number;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Review & Submit</h3>
      <p className="text-sm text-gray-600">
        Review all lease and rebate information before submitting to RGF.
      </p>

      <div className="mt-6 space-y-4">
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 text-base">Rebate Submission Summary</h4>
          
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-[#023F40] mb-3 uppercase tracking-wide">Ticket & Applicant</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Ticket Number:</span>
                <span className="font-medium text-[#023F40]">{ticketNumber}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">National ID:</span>
                <span className="font-medium">{formData.nationalId || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Woman:</span>
                <span className="font-medium">{formData.isWoman === 'yes' ? 'Yes' : formData.isWoman === 'no' ? 'No' : '—'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Retrofit:</span>
                <span className="font-medium">{formData.isRetrofit ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h5 className="text-sm font-semibold text-[#023F40] mb-3 uppercase tracking-wide">E-Moto & Rebate</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">E-Moto Supplier:</span>
                <span className="font-medium">{formData.brand || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium">{formData.model || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Retail Cost:</span>
                <span className="font-medium">{formData.purchasePrice ? `${Number(formData.purchasePrice).toLocaleString()} RWF` : '—'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Rebate Amount:</span>
                <span className="font-semibold text-[#023F40]">{rebatePreview > 0 ? `${rebatePreview.toLocaleString()} RWF` : '—'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-300">
            <h5 className="text-sm font-semibold text-[#023F40] mb-3 uppercase tracking-wide">Mandatory Documents</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {['signedLease', 'affidavit', 'afFinancialNeed', 'nationalId'].map((key) => (
                <div key={key} className="flex items-center gap-2">
                  {formData.documents?.[key]?.uploaded ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                  <span className={formData.documents?.[key]?.uploaded ? 'text-gray-700' : 'text-amber-700'}>
                    {key === 'signedLease' ? 'Signed Lease' :
                     key === 'affidavit' ? 'Individual Affidavit' :
                     key === 'afFinancialNeed' ? 'AF Financial Need Confirmation' : 'National ID'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}