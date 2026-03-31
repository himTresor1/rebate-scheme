import { useState, useEffect } from 'react';
import { Search, Plus, Shield, CheckCircle, XCircle, User } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { authService } from '../../utils/auth';
import { Permission, Role, PermissionCategory, PermissionAction } from '../../utils/permissions';
import { Pagination, usePagination } from '../ui/pagination';

export function PermissionManagement() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showCreatePermission, setShowCreatePermission] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignType, setAssignType] = useState<'role' | 'user'>('role');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: 'Applications' as PermissionCategory,
    action: 'VIEW' as PermissionAction
  });

  const { currentPage, totalPages, handlePageChange } = usePagination(permissions, 10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await authService.getAccessToken();

      if (!token) {
        console.log('No authentication token available');
        setLoading(false);
        return;
      }

      // Load permissions
      const permResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/permissions`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (permResponse.ok) {
        const permData = await permResponse.json();
        setPermissions(permData);
      } else if (permResponse.status === 401 || permResponse.status === 403) {
        console.log('Authentication required or insufficient permissions for permissions');
      }

      // Load roles
      const roleResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/roles`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (roleResponse.ok) {
        const roleData = await roleResponse.json();
        setRoles(roleData);
      } else if (roleResponse.status === 401 || roleResponse.status === 403) {
        console.log('Authentication required or insufficient permissions for roles');
      }

      // Load users
      const userResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/users`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUsers(userData);
      } else if (userResponse.status === 401 || userResponse.status === 403) {
        console.log('Authentication required or insufficient permissions for users');
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePermission = async () => {
    try {
      const token = await authService.getAccessToken();

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/permissions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.ok) {
        setShowCreatePermission(false);
        setFormData({
          name: '',
          code: '',
          description: '',
          category: 'Applications',
          action: 'VIEW'
        });
        loadData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create permission');
      }
    } catch (error) {
      console.error('Failed to create permission:', error);
      alert('Failed to create permission');
    }
  };

  const handleAssignPermissionToRole = async (permissionCode: string, roleCode: string) => {
    try {
      const token = await authService.getAccessToken();

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/roles/${roleCode}/permissions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ permissionCode })
        }
      );

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Failed to assign permission:', error);
    }
  };

  const handleRemovePermissionFromRole = async (permissionCode: string, roleCode: string) => {
    try {
      const token = await authService.getAccessToken();

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/roles/${roleCode}/permissions/${permissionCode}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Failed to remove permission:', error);
    }
  };

  const handleGrantPermissionToUser = async (permissionCode: string, userId: string, reason: string) => {
    try {
      const token = await authService.getAccessToken();

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/users/${userId}/permissions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ permissionCode, reason })
        }
      );

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Failed to grant permission:', error);
    }
  };

  const hasPermission = (role: Role, permissionId: string) => {
    return role.permissions?.includes(permissionId) || false;
  };

  const filteredPermissions = permissions.filter(perm =>
    perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    perm.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    perm.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group permissions by category
  const groupedPermissions = filteredPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 mt-6">
        <h2 className="text-lg sm:text-xl text-[#023F40] mb-2">Permission Management</h2>
        <p className="text-xs sm:text-sm text-gray-600">Define and assign granular permissions to roles and users</p>
      </div>

      {/* Action Bar - Mobile Responsive */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023F40]"
          />
        </div>
        
        {/* Button Group - Stacked on Mobile */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            onClick={() => setShowCreatePermission(true)}
            className="w-full px-4 py-2 bg-[#023F40] text-white rounded-lg hover:bg-[#035f61] flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Create Permission
          </button>
          <button
            onClick={() => {
              setAssignType('role');
              setShowAssignModal(true);
            }}
            className="w-full px-4 py-2 border border-[#023F40] text-[#023F40] rounded-lg hover:bg-[#023F40] hover:text-white flex items-center justify-center gap-2 text-sm"
          >
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            Assign to Role
          </button>
          <button
            onClick={() => {
              setAssignType('user');
              setShowAssignModal(true);
            }}
            className="w-full px-4 py-2 border border-[#023F40] text-[#023F40] rounded-lg hover:bg-[#023F40] hover:text-white flex items-center justify-center gap-2 text-sm"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            Grant to User
          </button>
        </div>
      </div>

      {/* Permissions List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading permissions...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([category, perms]) => (
            <div key={category} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 sm:px-6 py-3 border-b border-gray-200">
                <h3 className="text-[#023F40]">{category}</h3>
              </div>
              {/* Add horizontal scroll wrapper for mobile */}
              <div className="overflow-x-auto">
                <div className="divide-y divide-gray-100 min-w-[600px]">
                  {perms.map((perm) => (
                    <div key={perm.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm sm:text-base">{perm.name}</span>
                            <code className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                              {perm.code}
                            </code>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {perm.action}
                            </span>
                          </div>
                          {perm.description && (
                            <p className="text-xs sm:text-sm text-gray-600">{perm.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {roles.map((role) => (
                            <button
                              key={role.id}
                              onClick={() => {
                                if (hasPermission(role, perm.id)) {
                                  handleRemovePermissionFromRole(perm.code, role.code);
                                } else {
                                  handleAssignPermissionToRole(perm.code, role.code);
                                }
                              }}
                              className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors ${
                                hasPermission(role, perm.id)
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              title={`${hasPermission(role, perm.id) ? 'Remove from' : 'Add to'} ${role.name}`}
                            >
                              {hasPermission(role, perm.id) ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              <span className="hidden sm:inline">{role.code}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Permission Modal */}
      {showCreatePermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-[#023F40] mb-4">Create New Permission</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permission Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023F40]"
                  placeholder="e.g., View Financial Reports"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permission Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s/g, '.') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023F40]"
                  placeholder="e.g., financial.view_reports"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as PermissionCategory })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023F40]"
                >
                  <option value="Applications">Applications</option>
                  <option value="Verification">Verification</option>
                  <option value="Financial">Financial</option>
                  <option value="Reporting">Reporting</option>
                  <option value="System">System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action *
                </label>
                <select
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value as PermissionAction })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023F40]"
                >
                  <option value="VIEW">VIEW</option>
                  <option value="SUBMIT">SUBMIT</option>
                  <option value="EDIT">EDIT</option>
                  <option value="APPROVE">APPROVE</option>
                  <option value="REJECT">REJECT</option>
                  <option value="REQUEST_INFO">REQUEST_INFO</option>
                  <option value="ASSIGN">ASSIGN</option>
                  <option value="DELETE">DELETE</option>
                  <option value="EXPORT">EXPORT</option>
                  <option value="INITIATE_PAYMENT">INITIATE_PAYMENT</option>
                  <option value="AUTHORIZE_PAYMENT">AUTHORIZE_PAYMENT</option>
                  <option value="MANAGE_USERS">MANAGE_USERS</option>
                  <option value="MANAGE_ROLES">MANAGE_ROLES</option>
                  <option value="MANAGE_PERMISSIONS">MANAGE_PERMISSIONS</option>
                  <option value="VIEW_AUDIT_LOGS">VIEW_AUDIT_LOGS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023F40]"
                  rows={3}
                  placeholder="Describe what this permission allows..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreatePermission(false);
                  setFormData({
                    name: '',
                    code: '',
                    description: '',
                    category: 'Applications',
                    action: 'VIEW'
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePermission}
                disabled={!formData.name || !formData.code || !formData.category || !formData.action}
                className="flex-1 px-4 py-2 bg-[#023F40] text-white rounded-lg hover:bg-[#035f61] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Create Permission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-[#023F40] mb-4">
              {assignType === 'role' ? 'Assign Permissions to Role' : 'Grant Permission to User'}
            </h3>

            {assignType === 'role' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role
                </label>
                <select
                  value={selectedRole?.code || ''}
                  onChange={(e) => {
                    const role = roles.find(r => r.code === e.target.value);
                    setSelectedRole(role || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023F40] mb-4"
                >
                  <option value="">-- Select a role --</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.code}>{role.name}</option>
                  ))}
                </select>

                {selectedRole && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-3">
                      {selectedRole.permissions?.length || 0} permissions currently assigned
                    </p>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {permissions.map(perm => (
                        <label key={perm.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasPermission(selectedRole, perm.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleAssignPermissionToRole(perm.code, selectedRole.code);
                              } else {
                                handleRemovePermissionFromRole(perm.code, selectedRole.code);
                              }
                            }}
                            className="w-4 h-4 text-[#023F40] focus:ring-[#023F40]"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{perm.name}</span>
                              <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                                {perm.category}
                              </span>
                            </div>
                            <code className="text-xs text-gray-500">{perm.code}</code>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <select
                  value={selectedUser?.id || ''}
                  onChange={(e) => {
                    const user = users.find(u => u.id === e.target.value);
                    setSelectedUser(user || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023F40] mb-4"
                >
                  <option value="">-- Select a user --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                  ))}
                </select>

                {selectedUser && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-3">
                      Base role: <span className="font-medium">{selectedUser.role}</span>
                    </p>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {permissions.map(perm => {
                        const [reason, setReasonState] = useState('');
                        
                        return (
                          <div key={perm.id} className="p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{perm.name}</span>
                                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                                    {perm.category}
                                  </span>
                                </div>
                                <code className="text-xs text-gray-500">{perm.code}</code>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Reason for granting permission..."
                                value={reason}
                                onChange={(e) => setReasonState(e.target.value)}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#023F40]"
                              />
                              <button
                                onClick={() => {
                                  if (reason.trim()) {
                                    handleGrantPermissionToUser(perm.code, selectedUser.id, reason);
                                    setReasonState('');
                                  }
                                }}
                                disabled={!reason.trim()}
                                className="px-3 py-1 text-sm bg-[#023F40] text-white rounded hover:bg-[#035f61] disabled:bg-gray-300"
                              >
                                Grant
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedRole(null);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}