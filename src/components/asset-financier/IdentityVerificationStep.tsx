import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Loader2, CheckCircle, AlertCircle, FileText, User, Calendar, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';
import { formatDisplayDate } from '../../utils/dateFormat';

interface IdentityVerificationStepProps {
  formData: any;
  setFormData: any;
}

export function IdentityVerificationStep({ formData, setFormData }: IdentityVerificationStepProps) {
  const [loading, setLoading] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [nidaData, setNidaData] = useState<any>(null);
  const [ruraData, setRuraData] = useState<any>(null);

  const generateMockData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock NIDA data
    const mockNIDAData = {
      verified: true,
      fullName: 'MUGISHA Jean Baptiste',
      firstName: 'Jean Baptiste',
      lastName: 'MUGISHA',
      dateOfBirth: '1987-03-15',
      gender: 'Man',
      nationalId: formData.nationalId || '1198780012345678',
      placeOfBirth: 'Kigali',
      residence: {
        province: 'Kigali City',
        district: 'Gasabo',
        sector: 'Remera',
        cell: 'Rukiri I',
        village: 'Amahoro'
      },
      maritalStatus: 'Married',
      fatherInfo: {
        name: 'MUGISHA Paul',
        nationalId: '1196550045612389',
        dateOfBirth: '1955-08-22'
      },
      motherInfo: {
        name: 'UWASE Marie',
        nationalId: '1196760034523456',
        dateOfBirth: '1960-12-10'
      },
      issuedDate: '2020-01-15',
      expiryDate: '2030-01-14',
      photoUrl: null
    };

    // Generate mock RURA data
    const mockRURAData = {
      verified: true,
      licenseNumber: formData.driversLicense || 'DL-2024-089456',
      fullName: 'MUGISHA Jean Baptiste',
      nationalId: formData.nationalId || '1198780012345678',
      licenseCategory: 'A (Motorcycle)',
      issueDate: '2022-06-10',
      expiryDate: '2027-06-09',
      status: 'Valid',
      endorsements: ['Commercial Motorcycle Operation'],
      vehiclesCurrent: [
        {
          plateNumber: 'RAD 567 D',
          vehicleType: 'Motorcycle - Electric',
          brand: 'Ampersand',
          model: 'Moto',
          registrationDate: '2023-09-15'
        }
      ],
      violations: [],
      pointsRemaining: 12
    };

    setNidaData(mockNIDAData);
    setRuraData(mockRURAData);
    setVerificationComplete(true);
    setLoading(false);
    
    toast.success('Verification data loaded successfully!');

    // Update form data with verified information
    setFormData({
      ...formData,
      applicantName: mockNIDAData.fullName,
      nidaData: mockNIDAData,
      ruraData: mockRURAData
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-900">Step 1: Rider Identity Verification</h3>
        <p className="text-sm text-gray-600 mt-1">
          Enter the rider's identification details and generate verification data from NIDA and RURA databases.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            National ID (NID)
            <span className="text-gray-500 text-xs ml-1">(Optional)</span>
          </label>
          <Input
            type="text"
            placeholder="1 XXXX X XXXXXXX X XX"
            maxLength={16}
            value={formData.nationalId}
            onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
            disabled={verificationComplete}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Driver's License Number *
          </label>
          <Input
            type="text"
            placeholder="DL-YYYY-XXXXXX"
            value={formData.driversLicense}
            onChange={(e) => setFormData({ ...formData, driversLicense: e.target.value })}
            disabled={verificationComplete}
          />
        </div>
      </div>

      {!verificationComplete && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={generateMockData}
            disabled={loading}
            className="bg-[#023F40] hover:bg-[#035f60]"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Verifying Identity...' : 'Verify Identity & Generate Data'}
          </Button>
        </div>
      )}

      {/* NIDA Data Display */}
      {nidaData && (
        <div className="border border-green-200 rounded-lg p-5 bg-green-50">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-900">NIDA Verification Results</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-lg p-4">
            {/* Personal Information */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Full Name</p>
                <p className="font-medium text-gray-900">{nidaData.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">National ID</p>
                <p className="font-medium text-gray-900">{nidaData.nationalId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Date of Birth</p>
                <p className="font-medium text-gray-900">{formatDisplayDate(nidaData.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Gender</p>
                <p className="font-medium text-gray-900">{nidaData.gender}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Place of Birth</p>
                <p className="font-medium text-gray-900">{nidaData.placeOfBirth}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Marital Status</p>
                <p className="font-medium text-gray-900">{nidaData.maritalStatus}</p>
              </div>
            </div>

            {/* Residence & Family */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Current Residence
                </p>
                <p className="font-medium text-gray-900 text-sm">
                  {nidaData.residence.village}, {nidaData.residence.cell}
                </p>
                <p className="text-sm text-gray-600">
                  {nidaData.residence.sector}, {nidaData.residence.district}
                </p>
                <p className="text-sm text-gray-600">{nidaData.residence.province}</p>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-2">
                  <Users className="w-3 h-3" />
                  Parents Information
                </p>
                <div className="space-y-2">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-xs font-medium text-gray-700">Father</p>
                    <p className="text-sm text-gray-900">{nidaData.fatherInfo.name}</p>
                    <p className="text-xs text-gray-600">ID: {nidaData.fatherInfo.nationalId}</p>
                    <p className="text-xs text-gray-600">DOB: {formatDisplayDate(nidaData.fatherInfo.dateOfBirth)}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-xs font-medium text-gray-700">Mother</p>
                    <p className="text-sm text-gray-900">{nidaData.motherInfo.name}</p>
                    <p className="text-xs text-gray-600">ID: {nidaData.motherInfo.nationalId}</p>
                    <p className="text-xs text-gray-600">DOB: {formatDisplayDate(nidaData.motherInfo.dateOfBirth)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  ID Card Validity
                </p>
                <p className="text-sm text-gray-900">Issued: {nidaData.issuedDate}</p>
                <p className="text-sm text-gray-900">Expires: {nidaData.expiryDate}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RURA Data Display */}
      {ruraData && (
        <div className="border border-blue-200 rounded-lg p-5 bg-blue-50">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">RURA Driver's License Verification</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-lg p-4">
            {/* License Information */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">License Number</p>
                <p className="font-medium text-gray-900">{ruraData.licenseNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">License Holder</p>
                <p className="font-medium text-gray-900">{ruraData.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">National ID</p>
                <p className="font-medium text-gray-900">{ruraData.nationalId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">License Category</p>
                <p className="font-medium text-gray-900">{ruraData.licenseCategory}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {ruraData.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Validity Period</p>
                <p className="text-sm text-gray-900">Issued: {ruraData.issueDate}</p>
                <p className="text-sm text-gray-900">Expires: {ruraData.expiryDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Points Remaining</p>
                <p className="font-medium text-gray-900">{ruraData.pointsRemaining} / 12</p>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Endorsements</p>
                <div className="space-y-1">
                  {ruraData.endorsements.map((endorsement: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-sm text-gray-900">{endorsement}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Registered Vehicles</p>
                <div className="space-y-2">
                  {ruraData.vehiclesCurrent.map((vehicle: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">{vehicle.plateNumber}</p>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {vehicle.vehicleType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{vehicle.brand} {vehicle.model}</p>
                      <p className="text-xs text-gray-600">Registered: {vehicle.registrationDate}</p>
                    </div>
                  ))}
                </div>
              </div>

              {ruraData.violations.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Traffic Violations</p>
                  <div className="space-y-1">
                    {ruraData.violations.map((violation: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        <span>{violation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ruraData.violations.length === 0 && (
                <div className="border-t pt-3">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">No traffic violations on record</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {verificationComplete && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-900 font-medium">Data Verified</p>
              <p className="text-sm text-gray-700 mt-1">
                Review the information above carefully. Click "Continue" when ready to proceed to the next step.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}