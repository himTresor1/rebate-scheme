// Audit Log Types
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ASSIGN = 'ASSIGN',
  ACTIVATE = 'ACTIVATE',
  DEACTIVATE = 'DEACTIVATE',
  GRANT = 'GRANT',
  REVOKE = 'REVOKE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export enum AuditEntityType {
  USER = 'USER',
  ROLE = 'ROLE',
  PERMISSION = 'PERMISSION',
  APPLICATION = 'APPLICATION',
  EVALUATION = 'EVALUATION',
  DISBURSEMENT = 'DISBURSEMENT',
  CRITERIA = 'CRITERIA',
  SYSTEM_SETTING = 'SYSTEM_SETTING',
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  userId: string;
  userName: string;
  userRole: string;
  changes?: Record<string, any>; // Before/after values
  metadata?: Record<string, any>; // Additional context
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface AuditLogCreate {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  userId: string;
  userName: string;
  userRole: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}
