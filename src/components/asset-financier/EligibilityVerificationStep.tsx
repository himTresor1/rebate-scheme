import { useState } from 'react';
import { Button } from '../ui/button';
import { Loader2, CheckCircle, AlertCircle, MapPin, Users, Home } from 'lucide-react';
import { toast } from 'sonner';

interface EligibilityVerificationStepProps {
  formData: any;
}

export function EligibilityVerificationStep({ formData }: EligibilityVerificationStepProps) {
  const [loading, setLoading] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [socialRegistryData, setSocialRegistryData] = useState<any>(null);

  const fetchEligibilityData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Generate mock Social Registry data
    const mockSocialRegistryData = {
      verified: true,
      fullName: formData.nidaData?.fullName || 'MUGISHA Jean Baptiste',
      nationalId: formData.nationalId || '1198780012345678',
      imiberehoCategory: 'C',
      categoryDescription: 'Low Income - Eligible for Subsidy Programs',
      isEligible: true,
      householdInfo: {
        headOfHousehold: formData.nidaData?.fullName || 'MUGISHA Jean Baptiste',
        householdSize: 5,
        dependents: 3,
        monthlyIncome: 85000, // RWF
        incomeSource: 'Motorcycle Taxi Services'
      },
      location: {
        province: formData.nidaData?.residence.province || 'Kigali City',
        district: formData.nidaData?.residence.district || 'Gasabo',
        sector: formData.nidaData?.residence.sector || 'Remera',
        cell: formData.nidaData?.residence.cell || 'Rukiri I',
        village: formData.nidaData?.residence.village || 'Amahoro'
      },
      verificationDate: new Date().toISOString().split('T')[0],
      verifiedBy: 'Local Administrative Office - Gasabo District',
      socialBenefits: [
        'Ubudehe Category 2',
        'VUP Direct Support Program',
        'Community Health Insurance (Mutuelle de Santé) - Category 2'
      ],
      eligibilityNotes: 'Household qualifies for government subsidy programs based on verified income level and Ubudehe categorization.'
    };

    setSocialRegistryData(mockSocialRegistryData);
    setVerificationComplete(true);
    setLoading(false);
    
    toast.success('Eligibility data retrieved successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-900">Step 2: Eligibility Verification</h3>
        <p className="text-sm text-gray-600 mt-1">
          Verify the rider's eligibility for the rebate program based on Social Registry and Ubudehe categorization.
        </p>
      </div>

      {!verificationComplete && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 font-medium">Eligibility Check Required</p>
              <p className="text-sm text-blue-800 mt-1">
                Click the button below to retrieve eligibility data from the Social Registry and verify the rider's Ubudehe category.
              </p>
            </div>
          </div>
        </div>
      )}

      {!verificationComplete && (
        <div className="flex justify-center pt-2">
          <Button
            onClick={fetchEligibilityData}
            disabled={loading}
            className="bg-[#023F40] hover:bg-[#035f60]"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Retrieving Eligibility Data...' : 'Pull Eligibility Data'}
          </Button>
        </div>
      )}

      {/* Social Registry Data Display */}
      {socialRegistryData && (
        <div className={`border rounded-lg p-5 ${
          socialRegistryData.isEligible 
            ? 'border-green-200 bg-green-50' 
            : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            {socialRegistryData.isEligible ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Social Registry Verification - ELIGIBLE</h4>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-semibold text-red-900">Social Registry Verification - NOT ELIGIBLE</h4>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-lg p-4">
            {/* Applicant Confirmation */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Full Name (Confirmed)</p>
                <p className="font-medium text-gray-900">{socialRegistryData.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">National ID (Confirmed)</p>
                <p className="font-medium text-gray-900">{socialRegistryData.nationalId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Location (Confirmed)
                </p>
                <p className="text-sm text-gray-900">{socialRegistryData.location.village}, {socialRegistryData.location.cell}</p>
                <p className="text-sm text-gray-600">{socialRegistryData.location.sector}, {socialRegistryData.location.district}</p>
                <p className="text-sm text-gray-600">{socialRegistryData.location.province}</p>
              </div>
              
              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Verification Details</p>
                <p className="text-sm text-gray-900">Date: {socialRegistryData.verificationDate}</p>
                <p className="text-sm text-gray-600 mt-1">{socialRegistryData.verifiedBy}</p>
              </div>
            </div>

            {/* Eligibility Information */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Ubudehe / Imibereho Category</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    socialRegistryData.isEligible 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    Category {socialRegistryData.imiberehoCategory}
                  </span>
                  {socialRegistryData.isEligible && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{socialRegistryData.categoryDescription}</p>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-2">
                  <Home className="w-3 h-3" />
                  Household Information
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Head of Household:</span>
                    <span className="font-medium text-gray-900">{socialRegistryData.householdInfo.headOfHousehold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Household Size:</span>
                    <span className="font-medium text-gray-900">{socialRegistryData.householdInfo.householdSize} members</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dependents:</span>
                    <span className="font-medium text-gray-900">{socialRegistryData.householdInfo.dependents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Income:</span>
                    <span className="font-medium text-gray-900">{socialRegistryData.householdInfo.monthlyIncome.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Income Source:</span>
                    <span className="font-medium text-gray-900">{socialRegistryData.householdInfo.incomeSource}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Active Social Benefits</p>
                <div className="space-y-1">
                  {socialRegistryData.socialBenefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-900">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Eligibility Notes */}
          <div className="mt-4 bg-white rounded-lg p-3 border-l-4 border-blue-500">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Eligibility Notes</p>
            <p className="text-sm text-gray-700">{socialRegistryData.eligibilityNotes}</p>
          </div>
        </div>
      )}
    </div>
  );
}