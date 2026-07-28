import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  CheckCircle,
  XCircle,
  Phone,
  Shield,
  FileText,
  Clock,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { TableSkeleton } from '../ui/skeletons';
import { formatDisplayDate } from '../../utils/dateFormat';

interface InternalUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'ASSET_FINANCIER_STAFF' | 'ASSET_FINANCIER_OFFICER' | 'CLAIMS_OFFICER';
  permissions: string[];
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  applicationCount?: number;
  pendingCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
  applications?: any[];
}

interface InternalUserManagementProps {
  organizationId: string;
}

const AF_REBATE_TEAM_ROLES = [
  { value: 'ASSET_FINANCIER_OFFICER' as const, label: 'AF Decision Maker – Submit Rebates' },
  { value: 'ASSET_FINANCIER_STAFF' as const, label: 'AF Staff – Propose Rebates' },
  { value: 'CLAIMS_OFFICER' as const, label: 'External Individuals – Propose Rebates' },
];

type AfRebateTeamRole = (typeof AF_REBATE_TEAM_ROLES)[number]['value'];

function getAfRebateTeamRoleLabel(role: string): string {
  return AF_REBATE_TEAM_ROLES.find((r) => r.value === role)?.label ?? role;
}

const ASSET_FINANCIER_PERMISSIONS = [
  { code: 'AF_SUBMIT_APPLICATIONS', label: 'Submit Applications', description: 'Submit new rebate applications' },
  { code: 'AF_VIEW_OWN_APPLICATIONS', label: 'View Applications', description: 'View submitted applications' },
  { code: 'AF_EDIT_OWN_APPLICATIONS', label: 'Edit Applications', description: 'Edit draft applications' },
  { code: 'AF_UPLOAD_DOCUMENTS', label: 'Upload Documents', description: 'Upload and manage documents' },
  { code: 'AF_RESPOND_TO_INFO_REQUESTS', label: 'Respond to Requests', description: 'Respond to analyst feedback' },
];

export function InternalUserManagement({ organizationId }: InternalUserManagementProps) {
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'workload'>('list');

  useEffect(() => {
    fetchUsers();
  }, [organizationId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // MOCK DATA for displaying UI functionality
      setTimeout(() => {
        setUsers([
          {
            id: 'staff-1',
            name: 'Sarah Kimondo',
            email: 'sarah.k@financecorp.rw',
            phoneNumber: '+250 788 123 456',
            role: 'ASSET_FINANCIER_OFFICER',
            permissions: ['AF_SUBMIT_APPLICATIONS', 'AF_VIEW_OWN_APPLICATIONS', 'AF_EDIT_OWN_APPLICATIONS', 'AF_UPLOAD_DOCUMENTS', 'AF_RESPOND_TO_INFO_REQUESTS'],
            createdAt: new Date().toISOString(),
            createdBy: 'admin-1',
            isActive: true,
            applicationCount: 145,
            pendingCount: 22,
            approvedCount: 118,
            rejectedCount: 5,
            applications: [
              { id: 'app-1', applicationNumber: 'APP-2024-1001', status: 'approved', riderName: 'Jean Claude Ndayisaba', vehicleBrand: 'Ampersand', vehicleModel: 'E-Moto V2', submittedAt: '2024-03-01', rebateAmount: 1500000 },
              { id: 'app-2', applicationNumber: 'APP-2024-1002', status: 'under_review', riderName: 'Marie Claire Uwimana', vehicleBrand: 'TVS', vehicleModel: 'Electric XL', submittedAt: '2024-03-10', rebateAmount: 1200000 },
              { id: 'app-3', applicationNumber: 'APP-2024-1005', status: 'info_requested', riderName: 'Eric Habimana', vehicleBrand: 'Spiro', vehicleModel: 'Commuter Base', submittedAt: '2024-03-11', rebateAmount: 1100000 },
            ]
          },
          {
            id: 'staff-2',
            name: 'David Mugisha',
            email: 'david.m@financecorp.rw',
            phoneNumber: '+250 788 654 321',
            role: 'ASSET_FINANCIER_STAFF',
            permissions: ['AF_SUBMIT_APPLICATIONS', 'AF_VIEW_OWN_APPLICATIONS', 'AF_UPLOAD_DOCUMENTS'],
            createdAt: new Date().toISOString(),
            createdBy: 'admin-1',
            isActive: true,
            applicationCount: 42,
            pendingCount: 18,
            approvedCount: 20,
            rejectedCount: 4,
            applications: [
              { id: 'app-4', applicationNumber: 'APP-2024-1023', status: 'submitted', riderName: 'Emmanuel Hakizimana', vehicleBrand: 'Spiro', vehicleModel: 'Commuter Pro', submittedAt: '2024-03-12', rebateAmount: 1400000 },
              { id: 'app-5', applicationNumber: 'APP-2024-1025', status: 'pending_lease', riderName: 'Alice Mutoni', vehicleBrand: 'Ampersand', vehicleModel: 'E-Moto V2', submittedAt: '2024-03-13', rebateAmount: 1500000 },
            ]
          },
          {
            id: 'staff-3',
            name: 'Grace Iradukunda',
            email: 'grace.i@financecorp.rw',
            phoneNumber: '+250 788 987 654',
            role: 'ASSET_FINANCIER_STAFF',
            permissions: ['AF_VIEW_OWN_APPLICATIONS'],
            createdAt: new Date().toISOString(),
            createdBy: 'admin-1',
            isActive: false,
            applicationCount: 12,
            pendingCount: 0,
            approvedCount: 11,
            rejectedCount: 1,
            applications: [
              { id: 'app-6', applicationNumber: 'APP-2024-0980', status: 'approved', riderName: 'Patrick Ndagijimana', vehicleBrand: 'TVS', vehicleModel: 'Electric XL', submittedAt: '2024-01-15', rebateAmount: 1200000 },
            ]
          }
        ]);
        setLoading(false);
      }, 800);
      
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(error.message || 'Failed to load Rebate Team members');
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenPermissions = (user: InternalUser) => {
    setSelectedUser(user);
    setShowPermissionsModal(true);
  };

  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      'draft': { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
      'submitted': { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
      'under_review': { label: 'Under Review', color: 'bg-purple-100 text-purple-700' },
      'info_requested': { label: 'Info Requested', color: 'bg-yellow-100 text-yellow-700' },
      'approved': { label: 'Approved', color: 'bg-green-100 text-green-700' },
      'rejected': { label: 'Rejected', color: 'bg-red-100 text-red-700' },
      'pending_lease': { label: 'Pending Lease', color: 'bg-orange-100 text-orange-700' },
      'awaiting_payment': { label: 'Awaiting Payment', color: 'bg-indigo-100 text-indigo-700' }
    };

    const config = statusConfig[status] || statusConfig['submitted'];
    return <Badge className={`${config.color} border-0`}>{config.label}</Badge>;
  };

  // Calculate totals for workload view
  const totalApplications = users.reduce((sum, user) => sum + (user.applicationCount || 0), 0);
  const totalPending = users.reduce((sum, user) => sum + (user.pendingCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#023F40]">Rebate Team Management</h2>
            <p className="text-gray-600 mt-1">
              Designate the people within the Asset Financier organisation who are authorised to submit rebates to Rwanda Green Fund and the individuals authorised to propose rebate applications to AF Decision Makers.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#023F40] hover:bg-[#035f60] w-full sm:w-auto"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* View Mode Toggle & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white border rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-[#023F40] text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Rebate Team List
          </button>
          <button
            onClick={() => setViewMode('workload')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'workload'
                ? 'bg-[#023F40] text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Rebate Team Workload Overview
          </button>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#023F40]">{users.length}</p>
            <p className="text-xs text-gray-600">Total Rebate Team</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{totalApplications}</p>
            <p className="text-xs text-gray-600">Applications</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{totalPending}</p>
            <p className="text-xs text-gray-600">Pending</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content */}
      {loading ? (
        <TableSkeleton />
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No Rebate Team members found matching your search' : 'No Rebate Team members yet'}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#023F40] hover:bg-[#035f60]"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add
            </Button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredUsers.map((user) => {
            const isExpanded = expandedUsers.has(user.id);
            return (
              <div key={user.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* User Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 h-12 w-12 bg-[#023F40]/10 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-[#023F40]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <Badge
                            className={
                              user.role === 'ASSET_FINANCIER_OFFICER'
                                ? 'bg-blue-100 text-blue-700 border-0'
                                : user.role === 'CLAIMS_OFFICER'
                                  ? 'bg-purple-100 text-purple-700 border-0'
                                  : 'bg-gray-100 text-gray-700 border-0'
                            }
                          >
                            {getAfRebateTeamRoleLabel(user.role)}
                          </Badge>
                          {user.isActive ? (
                            <span className="flex items-center gap-1 text-green-600 text-xs">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600 text-xs">
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {user.phoneNumber}
                          </span>
                          <button
                            onClick={() => handleOpenPermissions(user)}
                            className="flex items-center gap-1 text-[#023F40] hover:underline"
                          >
                            <Shield className="w-3 h-3" />
                            {user.permissions.length} permissions
                          </button>
                        </div>

                        {/* Application Stats */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">
                              {user.applicationCount || 0} Applications
                            </span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-900">
                              {user.pendingCount || 0} Pending
                            </span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-900">
                              {user.approvedCount || 0} Approved
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenPermissions(user)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Permissions
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleUserExpanded(user.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Applications List */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Applications by {user.name.split(' ')[0]}</h4>
                    {user.applications && user.applications.length > 0 ? (
                      <div className="space-y-2">
                        {user.applications.map((app: any) => (
                          <div key={app.id} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-gray-900">{app.applicationNumber}</p>
                                {getStatusBadge(app.status)}
                              </div>
                              <p className="text-sm text-gray-600">
                                {app.riderName} • {app.vehicleBrand} {app.vehicleModel}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Submitted {formatDisplayDate(app.submittedAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-[#023F40]">
                                RWF {app.rebateAmount?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-4">No applications submitted yet</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Workload View
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#023F40]" />
              Rebate Team Workload Overview
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => {
              const totalApps = user.applicationCount || 0;
              const pending = user.pendingCount || 0;
              const approved = user.approvedCount || 0;
              const rejected = user.rejectedCount || 0;
              const pendingPercent = totalApps > 0 ? (pending / totalApps) * 100 : 0;
              const approvedPercent = totalApps > 0 ? (approved / totalApps) * 100 : 0;

              return (
                <div key={user.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#023F40]">{totalApps}</p>
                      <p className="text-xs text-gray-500">Total Applications</p>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">Pending</span>
                        <span className="font-medium text-orange-600">{pending} ({pendingPercent.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all"
                          style={{ width: `${pendingPercent}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">Approved</span>
                        <span className="font-medium text-green-600">{approved} ({approvedPercent.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${approvedPercent}%` }}
                        />
                      </div>
                    </div>

                    {rejected > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">Rejected</span>
                          <span className="font-medium text-red-600">{rejected}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setViewMode('list');
                        toggleUserExpanded(user.id);
                      }}
                      className="text-sm text-[#023F40] hover:underline"
                    >
                      View all applications →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          organizationId={organizationId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchUsers();
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedUser && (
        <PermissionsModal
          user={selectedUser}
          onClose={() => {
            setShowPermissionsModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            fetchUsers();
            setShowPermissionsModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

function CreateUserModal({ 
  organizationId, 
  onClose, 
  onSuccess 
}: { 
  organizationId: string; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: 'ASSET_FINANCIER_STAFF' as AfRebateTeamRole
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phoneNumber) {
      toast.error('All fields are required');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/asset-financier/users/create`,
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
        throw new Error(error.error || 'Failed to create user');
      }

      toast.success('Rebate Team member created successfully. Welcome email sent.');
      onSuccess();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create Rebate Team member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-semibold mb-4 text-[#023F40]">Add Rebate Team Member</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professional Email *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Phone Number *
            </label>
            <Input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+250 XXX XXX XXX"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as AfRebateTeamRole,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#023F40]"
            >
              {AF_REBATE_TEAM_ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              AF Decision Makers submit rebates to RGF. AF Staff and External Individuals propose rebate applications to AF Decision Makers.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> A temporary password will be generated and emailed to the user. 
              They must change it on first login.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#023F40] hover:bg-[#035f60]"
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PermissionsModal({ 
  user, 
  onClose, 
  onSuccess 
}: { 
  user: InternalUser; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(user.permissions);
  const [loading, setLoading] = useState(false);

  const togglePermission = (permissionCode: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionCode)
        ? prev.filter(p => p !== permissionCode)
        : [...prev, permissionCode]
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/asset-financier/users/${user.id}/permissions`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ permissions: selectedPermissions })
        }
      );

      if (!response.ok) throw new Error('Failed to update permissions');

      toast.success('Permissions updated successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-2 text-[#023F40]">Manage Permissions</h3>
        <p className="text-gray-600 mb-6">
          {user.name} ({user.email})
        </p>

        <div className="space-y-3 mb-6">
          {ASSET_FINANCIER_PERMISSIONS.map((permission) => (
            <div
              key={permission.code}
              className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedPermissions.includes(permission.code)}
                onChange={() => togglePermission(permission.code)}
                className="mt-1 w-4 h-4 text-[#023F40] rounded focus:ring-[#023F40]"
              />
              <div className="flex-1">
                <label className="font-medium text-gray-900 cursor-pointer">
                  {permission.label}
                </label>
                <p className="text-sm text-gray-600 mt-0.5">{permission.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-[#023F40] hover:bg-[#035f60]"
          >
            {loading ? 'Saving...' : 'Save Permissions'}
          </Button>
        </div>
      </div>
    </div>
  );
}