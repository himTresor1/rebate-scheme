import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { User as UserIcon, Mail, Power, PowerOff } from 'lucide-react';
import { User } from '../../utils/auth';
import { TableSkeleton } from '../ui/skeletons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Pagination, usePagination } from '../ui/pagination';
import { projectId } from '../../utils/supabase/info';
import { authService } from '../../utils/auth';
import { formatDisplayDate } from '../../utils/dateFormat';

export function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error: any) {
      // Silently handle auth errors - don't show toast if it's a 401/403
      if (error?.status === 401 || error?.status === 403 || error?.message?.includes('Unauthorized') || error?.message?.includes('Admin access required')) {
        console.log('Authentication required or insufficient permissions');
      } else {
        toast.error('Failed to load users');
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = await authService.getAccessToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/users/${userId}/toggle-status`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (response.ok) {
        toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
        loadUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const roleColors: Record<string, string> = {
    applicant: 'secondary',
    admin: 'destructive',
    analyst: 'default',
    qa: 'default',
    cfo: 'default',
  };

  const roleLabels: Record<string, string> = {
    applicant: 'Applicant',
    admin: 'Administrator',
    analyst: 'Rebate Analyst',
    qa: 'QA Team',
    cfo: 'CFO',
  };

  // Use pagination
  const {
    paginatedItems,
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    totalItems
  } = usePagination(users, 10);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage all system users and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={8} columns={6} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          View and manage all system users and their roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span>{user.name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleColors[user.role] as any}>
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isActive !== false ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {user.createdAt ? formatDisplayDate(user.createdAt) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleUserStatus(user.id, user.isActive !== false)}
                      className="p-2 text-gray-600 hover:text-[#023F40] hover:bg-gray-100 rounded transition-colors"
                      title={user.isActive !== false ? 'Deactivate user' : 'Activate user'}
                    >
                      {user.isActive !== false ? (
                        <PowerOff className="w-4 h-4" />
                      ) : (
                        <Power className="w-4 h-4" />
                      )}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {users.length === 0 && (
          <p className="text-center text-gray-500 py-8">No users found</p>
        )}
        
        {users.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </CardContent>
    </Card>
  );
}