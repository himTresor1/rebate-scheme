// Permission Categories
export enum PermissionCategory {
  APPLICATIONS = 'Applications',
  VERIFICATION = 'Verification',
  FINANCIAL = 'Financial',
  REPORTING = 'Reporting',
  SYSTEM = 'System',
}

// Permission Actions
export enum PermissionAction {
  VIEW = 'VIEW',
  SUBMIT = 'SUBMIT',
  EDIT = 'EDIT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  REQUEST_INFO = 'REQUEST_INFO',
  ASSIGN = 'ASSIGN',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  INITIATE_PAYMENT = 'INITIATE_PAYMENT',
  AUTHORIZE_PAYMENT = 'AUTHORIZE_PAYMENT',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_ROLES = 'MANAGE_ROLES',
  MANAGE_PERMISSIONS = 'MANAGE_PERMISSIONS',
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
}

// Permission Interface
export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
  category: PermissionCategory;
  action: PermissionAction;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Role Interface
export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  permissions: string[]; // Array of permission IDs
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// User Permission Override
export interface UserPermissionOverride {
  userId: string;
  permissionId: string;
  isGranted: boolean; // true = grant, false = revoke
  grantedBy: string;
  grantedAt: string;
  reason?: string;
}

// Pre-defined System Roles
export const SystemRoles = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  REBATE_ANALYST: 'REBATE_ANALYST',
  QA_TEAM: 'QA_TEAM',
  FINANCE_OFFICER: 'FINANCE_OFFICER',
  REBATE_MANAGER: 'REBATE_MANAGER',
  M_E_OFFICER: 'M_E_OFFICER',
  CLAIMS_OFFICER: 'CLAIMS_OFFICER',
  ASSET_FINANCIER_ADMIN: 'ASSET_FINANCIER_ADMIN',
} as const;

// Pre-defined Permissions
export const SystemPermissions = {
  // Applications
  VIEW_APPLICATIONS: 'applications.view',
  SUBMIT_APPLICATION: 'applications.submit',
  EDIT_APPLICATION: 'applications.edit',
  ASSIGN_APPLICATION: 'applications.assign',
  DELETE_APPLICATION: 'applications.delete',
  REQUEST_APPLICATION_INFO: 'applications.request_info',
  
  // Verification
  VIEW_VERIFICATION: 'verification.view',
  PERFORM_NIDA_CHECK: 'verification.nida_check',
  PERFORM_RURA_CHECK: 'verification.rura_check',
  VERIFY_DOCUMENTS: 'verification.documents',
  APPROVE_VERIFICATION: 'verification.approve',
  REJECT_VERIFICATION: 'verification.reject',
  
  // Financial
  VIEW_FINANCIAL: 'financial.view',
  INITIATE_PAYMENT: 'financial.initiate_payment',
  AUTHORIZE_PAYMENT: 'financial.authorize_payment',
  APPROVE_DISBURSEMENT: 'financial.approve_disbursement',
  REJECT_DISBURSEMENT: 'financial.reject_disbursement',
  VIEW_PAYMENT_HISTORY: 'financial.payment_history',
  
  // Reporting
  VIEW_DASHBOARD: 'reporting.view_dashboard',
  VIEW_ANALYTICS: 'reporting.view_analytics',
  EXPORT_REPORTS: 'reporting.export',
  VIEW_ALL_APPLICATIONS: 'reporting.view_all',
  
  // System
  MANAGE_USERS: 'system.manage_users',
  MANAGE_ROLES: 'system.manage_roles',
  MANAGE_PERMISSIONS: 'system.manage_permissions',
  VIEW_AUDIT_LOGS: 'system.view_audit_logs',
  MANAGE_CRITERIA: 'system.manage_criteria',
  SYSTEM_SETTINGS: 'system.settings',
} as const;

// Default Permission Sets for Each Role
export const RolePermissionDefaults: Record<string, string[]> = {
  [SystemRoles.SYSTEM_ADMIN]: [
    // Full access to everything
    SystemPermissions.VIEW_APPLICATIONS,
    SystemPermissions.SUBMIT_APPLICATION,
    SystemPermissions.EDIT_APPLICATION,
    SystemPermissions.ASSIGN_APPLICATION,
    SystemPermissions.DELETE_APPLICATION,
    SystemPermissions.REQUEST_APPLICATION_INFO,
    SystemPermissions.VIEW_VERIFICATION,
    SystemPermissions.PERFORM_NIDA_CHECK,
    SystemPermissions.PERFORM_RURA_CHECK,
    SystemPermissions.VERIFY_DOCUMENTS,
    SystemPermissions.APPROVE_VERIFICATION,
    SystemPermissions.REJECT_VERIFICATION,
    SystemPermissions.VIEW_FINANCIAL,
    SystemPermissions.INITIATE_PAYMENT,
    SystemPermissions.AUTHORIZE_PAYMENT,
    SystemPermissions.APPROVE_DISBURSEMENT,
    SystemPermissions.REJECT_DISBURSEMENT,
    SystemPermissions.VIEW_PAYMENT_HISTORY,
    SystemPermissions.VIEW_DASHBOARD,
    SystemPermissions.VIEW_ANALYTICS,
    SystemPermissions.EXPORT_REPORTS,
    SystemPermissions.VIEW_ALL_APPLICATIONS,
    SystemPermissions.MANAGE_USERS,
    SystemPermissions.MANAGE_ROLES,
    SystemPermissions.MANAGE_PERMISSIONS,
    SystemPermissions.VIEW_AUDIT_LOGS,
    SystemPermissions.MANAGE_CRITERIA,
    SystemPermissions.SYSTEM_SETTINGS,
  ],
  
  [SystemRoles.REBATE_ANALYST]: [
    SystemPermissions.VIEW_APPLICATIONS,
    SystemPermissions.EDIT_APPLICATION,
    SystemPermissions.REQUEST_APPLICATION_INFO,
    SystemPermissions.VIEW_VERIFICATION,
    SystemPermissions.PERFORM_NIDA_CHECK,
    SystemPermissions.PERFORM_RURA_CHECK,
    SystemPermissions.VERIFY_DOCUMENTS,
    SystemPermissions.APPROVE_VERIFICATION,
    SystemPermissions.REJECT_VERIFICATION,
    SystemPermissions.VIEW_DASHBOARD,
  ],
  
  [SystemRoles.QA_TEAM]: [
    SystemPermissions.VIEW_APPLICATIONS,
    SystemPermissions.EDIT_APPLICATION,
    SystemPermissions.REQUEST_APPLICATION_INFO,
    SystemPermissions.VIEW_VERIFICATION,
    SystemPermissions.APPROVE_VERIFICATION,
    SystemPermissions.REJECT_VERIFICATION,
    SystemPermissions.VIEW_DASHBOARD,
  ],
  
  [SystemRoles.FINANCE_OFFICER]: [
    SystemPermissions.VIEW_APPLICATIONS,
    SystemPermissions.VIEW_FINANCIAL,
    SystemPermissions.INITIATE_PAYMENT,
    SystemPermissions.VIEW_PAYMENT_HISTORY,
    SystemPermissions.VIEW_DASHBOARD,
  ],
  
  [SystemRoles.REBATE_MANAGER]: [
    SystemPermissions.VIEW_APPLICATIONS,
    SystemPermissions.ASSIGN_APPLICATION,
    SystemPermissions.REQUEST_APPLICATION_INFO,
    SystemPermissions.VIEW_VERIFICATION,
    SystemPermissions.APPROVE_VERIFICATION,
    SystemPermissions.REJECT_VERIFICATION,
    SystemPermissions.VIEW_FINANCIAL,
    SystemPermissions.AUTHORIZE_PAYMENT,
    SystemPermissions.APPROVE_DISBURSEMENT,
    SystemPermissions.REJECT_DISBURSEMENT,
    SystemPermissions.VIEW_PAYMENT_HISTORY,
    SystemPermissions.VIEW_DASHBOARD,
    SystemPermissions.VIEW_ANALYTICS,
    SystemPermissions.EXPORT_REPORTS,
    SystemPermissions.VIEW_ALL_APPLICATIONS,
  ],
  
  [SystemRoles.M_E_OFFICER]: [
    SystemPermissions.VIEW_APPLICATIONS,
    SystemPermissions.VIEW_DASHBOARD,
    SystemPermissions.VIEW_ANALYTICS,
    SystemPermissions.EXPORT_REPORTS,
    SystemPermissions.VIEW_ALL_APPLICATIONS,
  ],
  
  [SystemRoles.CLAIMS_OFFICER]: [
    SystemPermissions.VIEW_APPLICATIONS,
    SystemPermissions.SUBMIT_APPLICATION,
    SystemPermissions.EDIT_APPLICATION,
    SystemPermissions.VIEW_DASHBOARD,
  ],
  
  [SystemRoles.ASSET_FINANCIER_ADMIN]: [
    SystemPermissions.VIEW_APPLICATIONS,
    SystemPermissions.SUBMIT_APPLICATION,
    SystemPermissions.EDIT_APPLICATION,
    SystemPermissions.VIEW_DASHBOARD,
    SystemPermissions.VIEW_PAYMENT_HISTORY,
  ],
};

// Helper function to check if user has permission
export function hasPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  return userPermissions.includes(requiredPermission);
}

// Helper function to check if user has any of the permissions
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.some(perm => userPermissions.includes(perm));
}

// Helper function to check if user has all permissions
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.every(perm => userPermissions.includes(perm));
}
