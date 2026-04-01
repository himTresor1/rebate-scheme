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
  FileCheck
} from 'lucide-react';
import { toast } from 'sonner';
import {
  mockSocialRegistryCheck,
  mockRuraRraCheck,
  mockNationalIdCheck,
  mockTaxiLicenseCheck,
  simulateApiCall
} from '../../utils/mockApiResponses';

interface EligibilityCheckerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: any;
  onSaveEligibility: (eligibilityData: any) => void;
}

export function EligibilityCheckerModal({
  open,
  onOpenChange,
  application,
  onSaveEligibility
}: EligibilityCheckerModalProps) {
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

  const handleMarkAsEligible = () => {
    setOverallStatus('eligible');
    toast.success('Application marked as eligible');
  };

  const handleMarkAsIneligible = () => {
    setOverallStatus('ineligible');
    toast.warning('Application marked as ineligible');
  };

  const handleSave = async () => {
    if (overallStatus === 'not-checked') {
      toast.error('Please mark the application as eligible or ineligible');
      return;
    }

    // Check if mandatory checks are completed
    if (socialRegistryCheck.status === 'pending' || ruraRraCheck.status === 'pending') {
      toast.error('Please complete all mandatory API checks before saving');
      return;
    }

    setSaving(true);
    
    const eligibilityData = {
      socialRegistryCheck,
      ruraRraCheck,
      nationalIdCheck,
      taxiLicenseCheck,
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
    { key: 'affidavit', label: 'Signed Affidavit' },
    { key: 'nationalId', label: 'National ID' },
    { key: 'taxiLicense', label: 'Taxi License (RURA)' },
    { key: 'coopOrReference', label: 'Coop Membership OR Reference Letter' }
  ];

  if (application?.isRetrofit) {
    mandatoryDocs.push(
      { key: 'retrofitCompanyLetter', label: 'E-Moto Company Letter' },
      { key: 'retrofitOwnerLetter', label: 'Engine Disposal Agreement' }
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
    const isPass = checkData.status === 'pass';
    const isFail = checkData.status === 'fail';

    return (
      <div className={`border rounded-lg p-4 ${
        isPass ? 'bg-green-50 border-green-200' :
        isFail ? 'bg-red-50 border-red-200' :
        'bg-white border-gray-200'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${
              isPass ? 'text-green-600' :
              isFail ? 'text-red-600' :
              'text-gray-400'
            }`} />
            <h4 className="font-semibold text-gray-900">{title}</h4>
            {isMandatory && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Mandatory
              </Badge>
            )}
          </div>
          {!isPending && (
            <Badge className={
              isPass ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }>
              {isPass ? '✓ VERIFIED' : '✗ FAILED'}
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#023F40]">🔍 Eligibility Verification</DialogTitle>
          <DialogDescription>
            Application: {application?.id?.split(':')[1] || 'N/A'} • {application?.applicantName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Document Verification */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#023F40]" />
              Document Verification
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {mandatoryDocs.map(doc => {
                const docStatus = documents[doc.key];
                const isUploaded = docStatus?.uploaded;
                
                return (
                  <div
                    key={doc.key}
                    className={`flex items-center gap-2 p-3 rounded-lg border ${
                      isUploaded
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    {isUploaded ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium text-gray-900">{doc.label}</span>
                    {isUploaded && (
                      <Badge variant="outline" className="ml-auto bg-green-100 text-green-800 border-green-200">
                        Uploaded
                      </Badge>
                    )}
                  </div>
                );
              })}
              
              {/* Optional Document */}
              {documents.mobileMoneyStatements?.uploaded && (
                <div className="flex items-center gap-2 p-3 rounded-lg border bg-blue-50 border-blue-200">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">Mobile Money Statements</span>
                  <Badge variant="outline" className="ml-auto bg-blue-100 text-blue-800 border-blue-200">
                    Optional
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Required API Checks */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-[#023F40]" />
              Required API Checks
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

          {/* Optional Verification */}
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
                'Taxi License Authentication',
                CreditCard,
                taxiLicenseCheck,
                loadingTaxiLicense,
                handleCheckTaxiLicense,
                false
              )}
            </div>
          </div>

          {/* Analyst Notes */}
          <div>
            <Label htmlFor="analystNotes" className="text-base font-semibold text-gray-900 mb-2 block">
              📝 Analyst Notes
            </Label>
            <Textarea
              id="analystNotes"
              value={analystNotes}
              onChange={(e) => setAnalystNotes(e.target.value)}
              placeholder="Add your notes about the eligibility verification..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Overall Status */}
          <div className="border-t pt-4">
            <Label className="text-base font-semibold text-gray-900 mb-3 block">
              Overall Eligibility Status
            </Label>
            <div className="flex items-center gap-4">
              {overallStatus === 'not-checked' ? (
                <>
                  <Button
                    onClick={handleMarkAsIneligible}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Mark as Ineligible
                  </Button>
                  <Button
                    onClick={handleMarkAsEligible}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Mark as Eligible ✓
                  </Button>
                </>
              ) : (
                <div className={`flex-1 p-4 rounded-lg border-2 ${
                  overallStatus === 'eligible'
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">
                      {overallStatus === 'eligible' ? '✅ ELIGIBLE' : '❌ INELIGIBLE'}
                    </span>
                    <Button
                      onClick={() => setOverallStatus('not-checked')}
                      variant="ghost"
                      size="sm"
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || overallStatus === 'not-checked'}
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
