import { useState, useEffect } from 'react';
import { authService, User } from '../utils/auth';
import { SystemPermissions } from '../utils/permissions';

export function usePermissions(user: User | null) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // If user already has permissions loaded
      if (user.permissions) {
        setPermissions(user.permissions);
        setLoading(false);
      } else {
        // Fetch permissions
        loadPermissions();
      }
    } else {
      setPermissions([]);
      setLoading(false);
    }
  }, [user]);

  const loadPermissions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const perms = await authService.getUserPermissions(user.id);
      setPermissions(perms);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(perm => permissions.includes(perm));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(perm => permissions.includes(perm));
  };

  const canView = (entity: 'applications' | 'verification' | 'financial' | 'reporting' | 'system'): boolean => {
    const permissionMap = {
      applications: SystemPermissions.VIEW_APPLICATIONS,
      verification: SystemPermissions.VIEW_VERIFICATION,
      financial: SystemPermissions.VIEW_FINANCIAL,
      reporting: SystemPermissions.VIEW_DASHBOARD,
      system: SystemPermissions.MANAGE_USERS
    };

    return hasPermission(permissionMap[entity]);
  };

  const canEdit = (entity: 'applications' | 'criteria' | 'users' | 'roles' | 'permissions'): boolean => {
    const permissionMap = {
      applications: SystemPermissions.EDIT_APPLICATION,
      criteria: SystemPermissions.MANAGE_CRITERIA,
      users: SystemPermissions.MANAGE_USERS,
      roles: SystemPermissions.MANAGE_ROLES,
      permissions: SystemPermissions.MANAGE_PERMISSIONS
    };

    return hasPermission(permissionMap[entity]);
  };

  const canApprove = (entity: 'verification' | 'disbursement'): boolean => {
    const permissionMap = {
      verification: SystemPermissions.APPROVE_VERIFICATION,
      disbursement: SystemPermissions.APPROVE_DISBURSEMENT
    };

    return hasPermission(permissionMap[entity]);
  };

  const canInitiatePayment = (): boolean => {
    return hasPermission(SystemPermissions.INITIATE_PAYMENT);
  };

  const canAuthorizePayment = (): boolean => {
    return hasPermission(SystemPermissions.AUTHORIZE_PAYMENT);
  };

  const canExportReports = (): boolean => {
    return hasPermission(SystemPermissions.EXPORT_REPORTS);
  };

  const canViewAuditLogs = (): boolean => {
    return hasPermission(SystemPermissions.VIEW_AUDIT_LOGS);
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canView,
    canEdit,
    canApprove,
    canInitiatePayment,
    canAuthorizePayment,
    canExportReports,
    canViewAuditLogs,
    refresh: loadPermissions
  };
}
