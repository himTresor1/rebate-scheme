import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Building2, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { FormSkeleton } from '../ui/skeletons';

interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName?: string;
  swiftCode?: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface BankDetailsManagementProps {
  organizationId: string;
}

export function BankDetailsManagement({ organizationId }: BankDetailsManagementProps) {
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<BankDetails>({
    bankName: '',
    accountName: '',
    accountNumber: '',
    branchName: '',
    swiftCode: ''
  });

  useEffect(() => {
    fetchBankDetails();
  }, [organizationId]);

  const fetchBankDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/asset-financier/bank-details?organizationId=${organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.bankDetails) {
          setBankDetails(data.bankDetails);
          setFormData(data.bankDetails);
        }
      } else {
        const errorData = await response.json();
        console.error('Fetch bank details error response:', errorData);
        // Don't show error for 404 as it just means no bank details exist yet
        if (response.status !== 404) {
          toast.error(errorData.error || 'Failed to fetch bank details');
        }
      }
    } catch (error: any) {
      console.error('Error fetching bank details:', error);
      // Only show error if it's not a simple "not found" case
      if (error.message && !error.message.includes('404')) {
        toast.error('Failed to load bank details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.bankName || !formData.accountName || !formData.accountNumber) {
      toast.error('Bank name, account name, and account number are required');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/asset-financier/bank-details`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            organizationId,
            ...formData
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save bank details');
      }

      toast.success(
        bankDetails 
          ? 'Bank details updated. RGF Finance has been notified.' 
          : 'Bank details saved successfully'
      );
      
      await fetchBankDetails();
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving bank details:', error);
      toast.error(error.message || 'Failed to save bank details');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !bankDetails) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <p className="text-gray-600 text-center">Loading bank details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mt-6">
        <h2 className="text-[#023F40]">Bank Account Details</h2>
        <p className="text-gray-600 mt-1">
          Configure the bank account for receiving approved rebate disbursements
        </p>
      </div>

      {/* Warning if no bank details */}
      {!bankDetails && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900">Bank Details Required</p>
            <p className="text-sm text-yellow-700 mt-1">
              You must provide your organization's bank details before submitting any rebate applications. 
              This ensures approved funds are disbursed to the correct account.
            </p>
          </div>
        </div>
      )}

      {/* Bank Details Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#023F40]/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-[#023F40]" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Disbursement Account</h3>
              <p className="text-sm text-gray-600">
                Dedicated account for rebate program funds
              </p>
            </div>
          </div>
          {bankDetails && !isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              Edit Details
            </Button>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name *
              </label>
              <Input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="e.g., Bank of Kigali"
                disabled={!isEditing && !!bankDetails}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch Name
              </label>
              <Input
                type="text"
                value={formData.branchName}
                onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                placeholder="e.g., Kigali Main Branch"
                disabled={!isEditing && !!bankDetails}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Name (as appears on account) *
            </label>
            <Input
              type="text"
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              placeholder="Official organization name"
              disabled={!isEditing && !!bankDetails}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number *
              </label>
              <Input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="Full account number"
                disabled={!isEditing && !!bankDetails}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SWIFT Code (if applicable)
              </label>
              <Input
                type="text"
                value={formData.swiftCode}
                onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                placeholder="e.g., BKIGFRKA"
                disabled={!isEditing && !!bankDetails}
              />
            </div>
          </div>

          {(isEditing || !bankDetails) && (
            <div className="flex gap-3 pt-4">
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(bankDetails!);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-[#023F40] hover:bg-[#035f60]"
              >
                {loading ? 'Saving...' : bankDetails ? 'Update Bank Details' : 'Save Bank Details'}
              </Button>
            </div>
          )}

          {bankDetails && !isEditing && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>
                  Last updated {new Date(bankDetails.updatedAt!).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">🔒 Security Notice</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Only the Asset Financier Admin can view or modify these details</li>
          <li>Any changes will trigger an immediate notification to RGF Finance Department</li>
          <li>All modifications are logged in the audit trail</li>
          <li>Ensure the account is dedicated to the rebate program for proper fund tracking</li>
        </ul>
      </div>
    </div>
  );
}