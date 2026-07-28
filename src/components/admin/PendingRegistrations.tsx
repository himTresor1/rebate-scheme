import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Eye,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { formatDisplayDate } from '../../utils/dateFormat';

interface Organization {
  id: string;
  companyLegalName: string;
  companyAddress: string;
  companyRegistrationNumber: string;
  companyPhoneNumber: string;
  companyEmail: string;
  companyLogo?: string;
  companyType: string;
  status: string;
  submittedAt: string;
}

interface PendingUser {
  name: string;
  email: string;
  phoneNumber: string;
  position: string;
  organizationId: string;
}

export function PendingRegistrations() {
  const [pendingOrgs, setPendingOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [pendingUser, setPendingUser] = useState<PendingUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/financier/pending`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        setPendingOrgs(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch pending registrations:', error);
      toast.error('Failed to load pending registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (org: Organization) => {
    setSelectedOrg(org);
    // Fetch the pending user associated with this org (mock for now)
    // In real implementation, add an endpoint to get pending user by orgId
  };

  const handleApprove = async (orgId: string) => {
    if (!confirm('Are you sure you want to approve this organization?')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/financier/approve/${orgId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Approval failed');
      }

      toast.success('Organization approved successfully!');
      setSelectedOrg(null);
      fetchPendingRegistrations();
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error(error.message || 'Failed to approve organization');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedOrg) return;

    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/financier/reject/${selectedOrg.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ reason: rejectionReason })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Rejection failed');
      }

      toast.success('Organization rejected');
      setSelectedOrg(null);
      setShowRejectModal(false);
      setRejectionReason('');
      fetchPendingRegistrations();
    } catch (error: any) {
      console.error('Rejection error:', error);
      toast.error(error.message || 'Failed to reject organization');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#023F40] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending registrations...</p>
        </div>
      </div>
    );
  }

  if (selectedOrg) {
    return (
      <div className="space-y-6">
        {/* Header with responsive layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-[#023F40]">Review Registration</h2>
          <Button onClick={() => setSelectedOrg(null)} variant="outline" className="w-full sm:w-auto">
            Back to List
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* Organization Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Building2 className="w-5 h-5 text-[#023F40]" />
              <h3 className="text-[#023F40]">Organization Details</h3>
            </div>

            {selectedOrg.companyLogo && (
              <div>
                <img
                  src={selectedOrg.companyLogo}
                  alt="Company Logo"
                  className="h-16 object-contain"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="Legal Name" value={selectedOrg.companyLegalName} />
              <InfoField label="Company Type" value={selectedOrg.companyType} />
              <InfoField label="Registration Number" value={selectedOrg.companyRegistrationNumber} />
              <InfoField label="Phone" value={selectedOrg.companyPhoneNumber} icon={<Phone className="w-4 h-4" />} />
              <InfoField label="Email" value={selectedOrg.companyEmail} icon={<Mail className="w-4 h-4" />} />
              <InfoField label="Submitted" value={formatDisplayDate(selectedOrg.submittedAt)} />
            </div>

            <InfoField label="Address" value={selectedOrg.companyAddress} fullWidth />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
            <Button
              onClick={() => handleApprove(selectedOrg.id)}
              disabled={actionLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {actionLoading ? 'Approving...' : 'Approve Organization'}
            </Button>
            <Button
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Organization
            </Button>
          </div>
        </div>

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4">
              <h3 className="text-[#023F40]">Reject Registration</h3>
              <p className="text-gray-600">
                Please provide a reason for rejecting this organization's registration:
              </p>
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#023F40]"
                  placeholder="Enter detailed reason for rejection..."
                />
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectionReason.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
                <Button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  disabled={actionLoading}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mt-6">
        <h2 className="text-lg sm:text-xl text-[#023F40]">Pending Asset Financier Registrations</h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Review and approve partnership applications
        </p>
      </div>

      {pendingOrgs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">No Pending Registrations</h3>
          <p className="text-gray-600">
            There are no pending Asset Financier registrations at this time.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingOrgs.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {org.companyLogo && (
                      <img
                        src={org.companyLogo}
                        alt="Logo"
                        className="h-10 w-10 object-contain"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{org.companyLegalName}</h3>
                      <p className="text-sm text-gray-600">{org.companyType}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{org.companyEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{org.companyPhoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>Reg: {org.companyRegistrationNumber}</span>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-500">
                    Submitted: {new Date(org.submittedAt).toLocaleString()}
                  </div>
                </div>

                <Button
                  onClick={() => handleViewDetails(org)}
                  className="bg-[#023F40] hover:bg-[#035f60]"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Review
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoField({ 
  label, 
  value, 
  icon, 
  fullWidth = false 
}: { 
  label: string; 
  value: string; 
  icon?: React.ReactNode; 
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <Label className="text-gray-600 text-sm">{label}</Label>
      <div className="flex items-center gap-2 mt-1">
        {icon}
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}