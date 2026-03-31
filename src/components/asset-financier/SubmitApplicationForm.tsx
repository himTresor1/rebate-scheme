import { useState } from 'react';
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
import { toast } from 'sonner@2.0.3';
import { vehicleBrands, getModelsByBrand, VehicleModel } from '../../utils/vehicleDatabase';
import { api } from '../../utils/api';
import { DocumentUploadSection } from './DocumentUploadSection';


interface SubmitApplicationFormProps {
  organizationId: string;
}

type ApplicationStep = 'identity' | 'vehicle' | 'documents' | 'review';

export function SubmitApplicationForm({ organizationId }: SubmitApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('identity');
  const [loading, setLoading] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    // Identity
    firstName: '',
    lastName: '',
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

  const canProceed = () => {
    // Allow proceeding from all steps without validation
    return true;
  };

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
        rebateAmount: formData.rebateAmount || '450000',
        loanTerm: formData.loanTerm || '24',
        repaymentFrequency: formData.repaymentFrequency || 'daily',
        monthlyRepayment: formData.monthlyRepayment || '4167',
        isRetrofit: formData.isRetrofit,
        documents: formData.documents,
        status: 'submitted'
      };

      await api.createApplication(applicationData);
      toast.success('Application submitted successfully!');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
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
        <h2 className="text-lg sm:text-xl text-[#023F40]">Submit Rebate Application</h2>
        <p className="text-gray-600 mt-1">
          Complete all steps to submit a new rider rebate application
        </p>
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
        {currentStep === 'review' && <ReviewStep />}

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
              Submit Application
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
              First Name *
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
              Last Name *
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
  };

  const handleModelChange = (value: string) => {
    setModel(value);
    const found = models.find(m => m.model === value);
    setSelectedModel(found || null);
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
                Purchase Price (RWF) *
              </label>
              <Input
                type="number"
                placeholder="3,000,000"
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
                Proposed Rebate Amount (RWF) *
              </label>
              <Input
                type="number"
                placeholder="450,000"
                value={formData.rebateAmount}
                onChange={(e) => setFormData({ ...formData, rebateAmount: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Typically in the range of 5–25% of retail e-Moto price
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
                onValueChange={(value) => setFormData({ ...formData, repaymentFrequency: value })}
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

function ReviewStep() {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Step 4: Review & Submit</h3>
      <p className="text-sm text-gray-600">
        Review all information before submitting the application.
      </p>

      <div className="mt-6 space-y-4">
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 text-base">Application Summary</h4>
          
          {/* Rider Information */}
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-[#023F40] mb-3 uppercase tracking-wide">Rider Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Full Name:</span>
                <span className="font-medium">John Doe</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">National ID:</span>
                <span className="font-medium">1 XXXX X XXXXXXX X XX</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Phone Number:</span>
                <span className="font-medium">+250 XXX XXX XXX</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Driver's License:</span>
                <span className="font-medium">DL-2024-XXXXXX</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">rider@example.com</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">TIN:</span>
                <span className="font-medium">123456789</span>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-[#023F40] mb-3 uppercase tracking-wide">Vehicle Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">E-Moto Brand:</span>
                <span className="font-medium">Ampersand</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium">Moto</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Chassis Number:</span>
                <span className="font-medium">CH-123456789</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Year of Manufacture:</span>
                <span className="font-medium">2024</span>
              </div>
            </div>
          </div>

          {/* Financing Details */}
          <div>
            <h5 className="text-sm font-semibold text-[#023F40] mb-3 uppercase tracking-wide">Financing Details</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Purchase Price:</span>
                <span className="font-medium">3,000,000 RWF</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Total Contract Repayment:</span>
                <span className="font-medium">2,550,000 RWF</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Proposed Rebate Amount:</span>
                <span className="font-medium text-green-600">450,000 RWF (15%)</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Contract Term:</span>
                <span className="font-medium">24 months</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Repayment Frequency:</span>
                <span className="font-medium">Daily</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-600">Repayment Amount:</span>
                <span className="font-medium">4,167 RWF</span>
              </div>
            </div>
          </div>

          {/* Documents Status */}
          <div className="mt-6 pt-6 border-t border-gray-300">
            <h5 className="text-sm font-semibold text-[#023F40] mb-3 uppercase tracking-wide">Documents Status</h5>
            
            {/* Identity Documents */}
            <div className="mb-4">
              <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Identity Documents</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">National ID Document</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Driver's License Document</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Taxi License (RURA) - Optional</span>
                </div>
              </div>
            </div>

            {/* Application Documents */}
            <div>
              <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Application Documents</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Signed Affidavit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Coop Membership / Reference Letter</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Mobile Money Statements (Optional)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}