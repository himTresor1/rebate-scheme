import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  FileText,
  ExternalLink,
  Users,
  Shield,
  CreditCard,
  FileCheck,
  Bike,
  AlertTriangle,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import {
  mockSocialRegistryCheck,
  mockRuraRraCheck,
  mockNationalIdCheck,
  mockTaxiLicenseCheck,
  mockAdditionalMotorcyclesCheck,
  mockDocumentAuthentication,
  simulateApiCall
} from '../../utils/mockApiResponses';
import { DocumentUploadField } from './DocumentUploadField';

interface EligibilityCheckerModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: any;
  onSaveEligibility: (eligibilityData: any) => void;
}

export function EligibilityCheckerModalEnhanced({
  open,
  onOpenChange,
  application,
  onSaveEligibility
}: EligibilityCheckerModalEnhancedProps) {
  // Existing checks
  const [socialRegistryCheck, setSocialRegistryCheck] = useState<any>(
    application?.eligibilityCheck?.socialRegistryCheck || { status: 'pending' }
  );
  const [ruraRraCheck, setRuraRraCheck] = useState<any>(
    application?.eligibilityCheck?.ruraRraCheck || { status: 'pending' }
  );
  const [nationalIdCheck, setNationalIdCheck] = useState<any>(
    application?.eligibilityCheck?.nationalIdCheck || { status: 'pending' }
  );
  const [taxiLicenseCheck, setTaxiLicenseCheck] = useState<any>(
    application?.eligibilityCheck?.taxiLicenseCheck || { status: 'pending' }
  );

  // NEW: Additional Motorcycles Check
  const [motorcyclesCheck, setMotorcyclesCheck] = useState<any>(
    application?.eligibilityCheck?.motorcyclesCheck || { status: 'pending' }
  );

  // NEW: Social Registry Document Upload
  const [socialRegistryDocuments, setSocialRegistryDocuments] = useState<any[]>(
    application?.eligibilityCheck?.socialRegistryDocuments || []
  );

  // NEW: Document Authentication States
  const [documentAuthentication, setDocumentAuthentication] = useState<any>(
    application?.eligibilityCheck?.documentAuthentication || {}
  );
  const [authenticatingDoc, setAuthenticatingDoc] = useState<string | null>(null);

  const [analystNotes, setAnalystNotes] = useState(
    application?.eligibilityCheck?.analystNotes || ''
  );
  const [overallStatus, setOverallStatus] = useState<'not-checked' | 'eligible' | 'ineligible'>(
    application?.eligibilityCheck?.overallStatus || 'not-checked'
  );

  const [loadingSocialRegistry, setLoadingSocialRegistry] = useState(false);
  const [loadingRuraRra, setLoadingRuraRra] = useState(false);
  const [loadingNationalId, setLoadingNationalId] = useState(false);
  const [loadingTaxiLicense, setLoadingTaxiLicense] = useState(false);
  const [loadingMotorcycles, setLoadingMotorcycles] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCheckSocialRegistry = async () => {
    setLoadingSocialRegistry(true);
    const result = await simulateApiCall(
      mockSocialRegistryCheck(application.applicantName),
      2000
    );
    setSocialRegistryCheck(result);
    setLoadingSocialRegistry(false);
    toast.success('Social Registry check completed');
  };

  const handleCheckRuraRra = async () => {
    setLoadingRuraRra(true);
    const result = await simulateApiCall(
      mockRuraRraCheck(application.applicantName),
      2000
    );
    setRuraRraCheck(result);
    setLoadingRuraRra(false);
    toast.success('RURA/RRA check completed');
  };

  const handleCheckNationalId = async () => {
    setLoadingNationalId(true);
    const result = await simulateApiCall(
      mockNationalIdCheck(application.nationalId || '1198780012345678'),
      1500
    );
    setNationalIdCheck(result);
    setLoadingNationalId(false);
    toast.success('National ID check completed');
  };

  const handleCheckTaxiLicense = async () => {
    setLoadingTaxiLicense(true);
    const result = await simulateApiCall(
      mockTaxiLicenseCheck(application.taxiLicenseNumber || 'TX-KGL-12345'),
      1500
    );
    setTaxiLicenseCheck(result);
    setLoadingTaxiLicense(false);
    toast.success('Taxi License check completed');
  };

  // NEW: Additional Motorcycles Check Handler
  const handleCheckMotorcycles = async () => {
    setLoadingMotorcycles(true);
    const result = await simulateApiCall(
      mockAdditionalMotorcyclesCheck(application.nationalId || '1198780012345678'),
      2500
    );
    setMotorcyclesCheck(result);
    setLoadingMotorcycles(false);
    toast.success('Motorcycles check completed');
  };

  // NEW: Document Authentication Handler
  const handleAuthenticateDocument = async (docType: string, docId: string) => {
    setAuthenticatingDoc(docId);
    const result = await simulateApiCall(
      mockDocumentAuthentication(docType, docId),
      1500
    );
    
    setDocumentAuthentication((prev: any) => ({
      ...prev,
      [docId]: result
    }));
    
    setAuthenticatingDoc(null);
    
    if (result.verified) {
      toast.success(`${docType} verified successfully`);
    } else {
      toast.error(`${docType} verification failed`);
    }
  };

  const handleMarkAsEligible = () => {
    setOverallStatus('eligible');
    toast.success('Application marked as eligible');
  };

  const handleMarkAsIneligible = () => {
    setOverallStatus('ineligible');
    toast.warning('Application marked as ineligible');
  };

  const handleSave = async () => {
    // Validate mandatory checks
    if (socialRegistryCheck.status === 'pending') {
      toast.error('Social Registry check is mandatory');
      return;
    }

    if (motorcyclesCheck.status === 'pending') {
      toast.error('Additional Motorcycles check is mandatory');
      return;
    }

    // Validate Social Registry document upload
    if (socialRegistryDocuments.length === 0) {
      toast.error('Please upload Social Registry response document');
      return;
    }

    if (overallStatus === 'not-checked') {
      toast.error('Please mark the application as eligible or ineligible');
      return;
    }

    setSaving(true);
    
    const eligibilityData = {
      socialRegistryCheck,
      socialRegistryDocuments, // NEW
      motorcyclesCheck, // NEW
      ruraRraCheck,
      nationalIdCheck,
      taxiLicenseCheck,
      documentAuthentication, // NEW
      analystNotes,
      overallStatus,
      performedAt: new Date().toISOString()
    };

    await onSaveEligibility(eligibilityData);
    setSaving(false);
    onOpenChange(false);
  };

  const documents = application?.documents || {};
  const mandatoryDocs = [
    { key: 'affidavit', label: 'Signed Affidavit', docType: 'Affidavit' },
    { key: 'nationalId', label: 'National ID', docType: 'National ID' },
    { key: 'taxiLicense', label: 'Taxi License (RURA)', docType: 'Taxi License' },
    { key: 'coopOrReference', label: 'Coop Membership OR Reference Letter', docType: 'Reference' }
  ];

  if (application?.isRetrofit) {
    mandatoryDocs.push(
      { key: 'retrofitCompanyLetter', label: 'E-Moto Company Letter', docType: 'Company Letter' },
      { key: 'retrofitOwnerLetter', label: 'Engine Disposal Agreement', docType: 'Agreement' }
    );
  }

  const renderApiCheckCard = (
    title: string,
    icon: any,
    checkData: any,
    loading: boolean,
    onCheck: () => void,
    isMandatory: boolean = false
  ) => {
    const Icon = icon;
    const isPending = checkData.status === 'pending';
    const isCompleted = checkData.status === 'completed';
    const isPass = checkData.status === 'pass';
    const isFail = checkData.status === 'fail';
    const isVerified = isPass || isCompleted;

    return (
      <div className={`border rounded-lg p-4 ${
        isVerified ? 'bg-green-50 border-green-200' :
        isFail ? 'bg-red-50 border-red-200' :
        'bg-white border-gray-200'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${
              isVerified ? 'text-green-600' :
              isFail ? 'text-red-600' :
              'text-gray-400'
            }`} />
            <h4 className="font-semibold text-gray-900">{title}</h4>
            {isMandatory && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Mandatory
              </Badge>
            )}
          </div>
          {!isPending && (
            <Badge className={
              isVerified ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }>
              {isVerified ? '✓ VERIFIED' : '✗ FAILED'}
            </Badge>
          )}
        </div>

        {isPending ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Not checked yet</p>
            <Button
              onClick={onCheck}
              disabled={loading}
              size="sm"
              className="bg-[#023F40] hover:bg-[#035f60]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Check {title}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm">
              <p className="text-gray-600 mb-2">
                <strong>Checked:</strong> {new Date(checkData.checkedAt).toLocaleString()}
              </p>
              
              {/* Social Registry Results */}
              {checkData.found !== undefined && (
                <div className="bg-white border rounded p-3 space-y-1">
                  {checkData.found ? (
                    <>
                      <p className="text-green-800 font-semibold">✓ Applicant found in Social Registry</p>
                      <p className="text-gray-700">Income Level: {checkData.incomeLevel}</p>
                      <p className="text-gray-700">Household Size: {checkData.householdSize} members</p>
                      <p className="text-gray-700">Ubudehe Category: {checkData.ubudeheCategory}</p>
                      <p className="text-gray-700">Location: {checkData.location}</p>
                      <p className="text-gray-600 text-xs mt-2">Registered: {new Date(checkData.registeredDate).toLocaleDateString()}</p>
                    </>
                  ) : (
                    <p className="text-red-800 font-semibold">{checkData.reason}</p>
                  )}
                </div>
              )}

              {/* Additional Motorcycles Results - NEW */}
              {checkData.motorcycles !== undefined && (
                <div className="bg-white border rounded p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">
                      Total Motorcycles Registered: {checkData.totalCount}
                    </p>
                    {checkData.hasMultiple && (
                      <Badge className="bg-amber-100 text-amber-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Multiple Found
                      </Badge>
                    )}
                  </div>
                  <p className={checkData.hasMultiple ? 'text-amber-800 font-medium' : 'text-green-800 font-medium'}>
                    {checkData.message}
                  </p>
                  <div className="space-y-2 mt-2">
                    {checkData.motorcycles.map((moto: any, idx: number) => (
                      <div key={idx} className={`border rounded p-2 ${
                        moto.status === 'Pending Registration' 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-sm font-semibold">{moto.plateNumber}</p>
                          <Badge variant="outline" className="text-xs">
                            {moto.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-700 mt-1">
                          {moto.brand} {moto.model} • {moto.year}
                        </p>
                        <p className="text-xs text-gray-500">
                          Registered: {new Date(moto.registeredDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RURA/RRA Results */}
              {checkData.totalMotorcycles !== undefined && (
                <div className="bg-white border rounded p-3 space-y-2">
                  <p className="font-semibold text-gray-900">
                    Total Motorcycles: {checkData.totalMotorcycles}
                  </p>
                  {checkData.additionalMotos.length > 0 ? (
                    <>
                      <p className="text-amber-800">{checkData.message}</p>
                      <div className="space-y-2 mt-2">
                        {checkData.additionalMotos.map((moto: any, idx: number) => (
                          <div key={idx} className="bg-amber-50 border border-amber-200 rounded p-2">
                            <p className="font-mono text-sm font-semibold">{moto.plate}</p>
                            <p className="text-xs text-gray-700">
                              {moto.type} • {moto.registeredYear} • {moto.status}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-green-800">✓ {checkData.message}</p>
                  )}
                </div>
              )}

              {/* National ID Results */}
              {checkData.verified !== undefined && (
                <div className="bg-white border rounded p-3 space-y-1">
                  {checkData.verified ? (
                    <>
                      <p className="text-green-800 font-semibold">✓ National ID Verified</p>
                      <p className="text-gray-700">Name: {checkData.name}</p>
                      <p className="text-gray-700">Date of Birth: {checkData.dateOfBirth}</p>
                      <p className="text-gray-700">Gender: {checkData.gender}</p>
                      <p className="text-gray-700">Location: {checkData.district}, {checkData.province}</p>
                    </>
                  ) : (
                    <p className="text-red-800 font-semibold">{checkData.reason}</p>
                  )}
                </div>
              )}

              {/* Taxi License Results */}
              {checkData.licenseNumber !== undefined && (
                <div className="bg-white border rounded p-3 space-y-1">
                  {checkData.valid ? (
                    <>
                      <p className="text-green-800 font-semibold">✓ Taxi License Valid</p>
                      <p className="text-gray-700">License: {checkData.licenseNumber}</p>
                      <p className="text-gray-700">Type: {checkData.licenseType}</p>
                      <p className="text-gray-700">Status: {checkData.status}</p>
                      <p className="text-gray-700">Expires: {new Date(checkData.expiryDate).toLocaleDateString()}</p>
                    </>
                  ) : (
                    <p className="text-red-800 font-semibold">{checkData.reason}</p>
                  )}
                </div>
              )}
            </div>

            <Button
              onClick={onCheck}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Re-checking...
                </>
              ) : (
                'Re-check'
              )}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#023F40]">🔍 Enhanced Eligibility Verification</DialogTitle>
          <DialogDescription>
            Application: {application?.id?.split(':')[1] || 'N/A'} • {application?.applicantName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mandatory Notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-900">
                <p className="font-medium mb-1">Mandatory Checks Required</p>
                <p className="text-red-800">
                  You must complete Social Registry check with document upload AND Additional Motorcycles check before saving.
                </p>
              </div>
            </div>
          </div>

          {/* MANDATORY API CHECKS */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-red-600" />
              Mandatory API Checks
            </h3>
            <div className="space-y-3">
              {renderApiCheckCard(
                'Social Registry Check',
                Users,
                socialRegistryCheck,
                loadingSocialRegistry,
                handleCheckSocialRegistry,
                true
              )}

              {/* Social Registry Document Upload - MANDATORY */}
              {socialRegistryCheck.status !== 'pending' && (
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Upload className="w-5 h-5 text-red-600" />
                    <Label className="font-semibold text-gray-900">
                      Upload Social Registry Response Document <span className="text-red-600">*</span>
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload the official Social Registry API response or verification document
                  </p>
                  <DocumentUploadField
                    documents={socialRegistryDocuments}
                    onDocumentsChange={setSocialRegistryDocuments}
                    label="Upload Social Registry Document"
                    multiple={false}
                    maxFiles={1}
                    acceptedFileTypes=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              )}

              {renderApiCheckCard(
                'Additional Registered Motorcycles',
                Bike,
                motorcyclesCheck,
                loadingMotorcycles,
                handleCheckMotorcycles,
                true
              )}

              {renderApiCheckCard(
                'RURA/RRA Records Check',
                FileCheck,
                ruraRraCheck,
                loadingRuraRra,
                handleCheckRuraRra,
                true
              )}
            </div>
          </div>

          {/* OPTIONAL VERIFICATION */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-gray-400" />
              Optional Verification
            </h3>
            <div className="space-y-3">
              {renderApiCheckCard(
                'National ID Authentication',
                Shield,
                nationalIdCheck,
                loadingNationalId,
                handleCheckNationalId,
                false
              )}
              {renderApiCheckCard(
                'Taxi License Verification',
                CreditCard,
                taxiLicenseCheck,
                loadingTaxiLicense,
                handleCheckTaxiLicense,
                false
              )}
            </div>
          </div>

          {/* OPTIONAL DOCUMENT AUTHENTICATION - NEW */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Optional Document Authentication via APIs
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Verify submitted documents through external API integrations (NIDA, RURA, RRA, Banks)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mandatoryDocs.map(doc => {
                const docStatus = documents[doc.key];
                const isUploaded = docStatus?.uploaded;
                const authStatus = documentAuthentication[doc.key];
                
                return (
                  <div
                    key={doc.key}
                    className={`flex items-center justify-between gap-2 p-3 rounded-lg border ${
                      authStatus?.verified 
                        ? 'bg-green-50 border-green-200'
                        : authStatus?.verified === false
                        ? 'bg-red-50 border-red-200'
                        : isUploaded
                        ? 'bg-white border-gray-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {authStatus?.verified ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : authStatus?.verified === false ? (
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      ) : isUploaded ? (
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-gray-900">{doc.label}</span>
                        {authStatus && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {authStatus.message}
                          </p>
                        )}
                      </div>
                    </div>
                    {isUploaded && !authStatus && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAuthenticateDocument(doc.docType, doc.key)}
                        disabled={authenticatingDoc === doc.key}
                        className="flex-shrink-0"
                      >
                        {authenticatingDoc === doc.key ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Verify'
                        )}
                      </Button>
                    )}
                    {authStatus && (
                      <Badge className={authStatus.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {authStatus.verified ? '✓ Verified' : '✗ Failed'}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Analyst Notes */}
          <div>
            <Label htmlFor="analyst-notes" className="font-semibold">Analyst Notes</Label>
            <Textarea
              id="analyst-notes"
              value={analystNotes}
              onChange={(e) => setAnalystNotes(e.target.value)}
              placeholder="Add any observations, concerns, or notes from the eligibility verification..."
              className="mt-2 min-h-[100px]"
            />
          </div>

          {/* Overall Status */}
          <div className="border-t pt-4">
            <Label className="font-semibold mb-3 block">Overall Eligibility Status</Label>
            <div className="flex gap-3">
              <Button
                onClick={handleMarkAsEligible}
                variant={overallStatus === 'eligible' ? 'default' : 'outline'}
                className={overallStatus === 'eligible' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark as Eligible
              </Button>
              <Button
                onClick={handleMarkAsIneligible}
                variant={overallStatus === 'ineligible' ? 'default' : 'outline'}
                className={overallStatus === 'ineligible' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Mark as Ineligible
              </Button>
            </div>
            {overallStatus !== 'not-checked' && (
              <div className={`mt-3 p-3 rounded-lg ${
                overallStatus === 'eligible' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                <p className="text-sm font-medium">
                  {overallStatus === 'eligible' 
                    ? '✓ Application marked as ELIGIBLE for rebate program'
                    : '✗ Application marked as INELIGIBLE for rebate program'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#023F40] hover:bg-[#035f60]"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Eligibility Check'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
