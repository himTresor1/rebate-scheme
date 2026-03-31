import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Power, PowerOff, Shield } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { authService } from '../../utils/auth';
import { Role } from '../../utils/permissions';
import { TableSkeleton } from '../ui/skeletons';
import { Pagination, usePagination } from '../ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface RoleManagementProps {
  onClose?: () => void;
}

export function RoleManagement({ onClose }: RoleManagementProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const token = await authService.getAccessToken();
      
      if (!token) {
        console.log('No authentication token available');
        setLoading(false);
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/roles`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      } else if (response.status === 401 || response.status === 403) {
        // Silently handle auth errors - user likely not logged in or lacks permissions
        console.log('Authentication required or insufficient permissions');
      }
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      const token = await authService.getAccessToken();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/roles`,
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
        setShowCreateModal(false);
        setFormData({ name: '', code: '', description: '' });
        loadRoles();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create role');
      }
    } catch (error) {
      console.error('Failed to create role:', error);
      alert('Failed to create role');
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;

    try {
      const token = await authService.getAccessToken();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/roles/${editingRole.code}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.ok) {
        setEditingRole(null);
        setFormData({ name: '', code: '', description: '' });
        loadRoles();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update role');
    }
  };

  const handleToggleStatus = async (role: Role) => {
    try {
      const token = await authService.getAccessToken();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/roles/${role.code}/toggle-status`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        loadRoles();
      }
    } catch (error) {
      console.error('Failed to toggle role status:', error);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      return;
    }

    try {
      const token = await authService.getAccessToken();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/roles/${role.code}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        loadRoles();
      }
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const {
    paginatedItems: paginatedRoles,
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    totalItems
  } = usePagination(filteredRoles, 10);

  return (
    <div className="p-6">
      <div className="mb-6 mt-6">
        <h2 className="text-lg sm:text-xl text-[#023F40] mb-2">Role Management</h2>
        <p className="text-xs sm:text-sm text-gray-600">Create and manage system roles with specific access levels</p>
      </div>

      {/* Search and Create */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023F40]"
          />
        </div>
        <button
          onClick={() => {
            setShowCreateModal(true);
            setFormData({ name: '', code: '', description: '' });
          }}
          className="w-full px-3 sm:px-4 py-2 text-sm bg-[#023F40] text-white rounded-lg hover:bg-[#035f61] flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Create Role</span>
        </button>
      </div>

      {/* Roles Table */}
      {loading ? (
        <TableSkeleton />
      ) : filteredRoles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? 'No roles found matching your search' : 'No roles created yet'}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-600 whitespace-nowrap">Role Name</th>
                  <th className="px-6 py-3 text-left text-gray-600 whitespace-nowrap">Code</th>
                  <th className="px-6 py-3 text-left text-gray-600 whitespace-nowrap">Description</th>
                  <th className="px-6 py-3 text-left text-gray-600 whitespace-nowrap">Permissions</th>
                  <th className="px-6 py-3 text-left text-gray-600 whitespace-nowrap">Status</th>
                  <th className="px-6 py-3 text-left text-gray-600 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRoles.map((role) => (
                  <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#023F40]" />
                        <span className="font-medium text-gray-900">{role.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                        {role.code}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {role.description || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {role.permissions?.length || 0} permissions
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {role.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingRole(role);
                            setFormData({
                              name: role.name,
                              code: role.code,
                              description: role.description || ''
                            });
                          }}
                          className="p-2 text-gray-600 hover:text-[#023F40] hover:bg-gray-100 rounded"
                          title="Edit role"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(role)}
                          className="p-2 text-gray-600 hover:text-[#023F40] hover:bg-gray-100 rounded"
                          title={role.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {role.isActive ? (
                            <PowerOff className="w-4 h-4" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Delete role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingRole) && (
        <Dialog open={showCreateModal || !!editingRole} onOpenChange={(open) => {
          if (!open) {
            setShowCreateModal(false);
            setEditingRole(null);
            setFormData({ name: '', code: '', description: '' });
          }
        }}>
          <DialogContent className="bg-white rounded-lg p-6 w-full max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#023F40] mb-4">
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </DialogTitle>
              <DialogDescription>
                {editingRole ? 'Update the details of the role' : 'Enter the details for the new role'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023F40]"
                  placeholder="e.g., Senior Analyst"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023F40]"
                  placeholder="e.g., SENIOR_ANALYST"
                  disabled={!!editingRole}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Code cannot be changed after creation
                </p>
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
                  placeholder="Describe the role and its responsibilities..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingRole(null);
                  setFormData({ name: '', code: '', description: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editingRole ? handleUpdateRole : handleCreateRole}
                disabled={!formData.name || !formData.code}
                className="flex-1 px-4 py-2 bg-[#023F40] text-white rounded-lg hover:bg-[#035f61] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {editingRole ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}