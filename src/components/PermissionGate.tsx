import { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { User } from '../utils/auth';

interface PermissionGateProps {
  user: User;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean; // If true, requires all permissions. If false, requires any.
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * PermissionGate - Conditionally renders children based on user permissions
 * 
 * Usage:
 * <PermissionGate user={user} permission="applications.view">
 *   <ViewApplicationsButton />
 * </PermissionGate>
 * 
 * <PermissionGate user={user} permissions={["applications.edit", "applications.delete"]} requireAll={false}>
 *   <EditOrDeleteButton />
 * </PermissionGate>
 */
export function PermissionGate({ 
  user, 
  permission, 
  permissions, 
  requireAll = false,
  fallback = null,
  children 
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions(user);

  if (loading) {
    return null; // or a loading spinner
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions) 
      : hasAnyPermission(permissions);
  } else {
    // No permission specified, allow access
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
