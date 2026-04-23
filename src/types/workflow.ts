export type StageType = 'Analyst' | 'QA Officer' | 'Finance Approver' | 'Manager' | 'Auditor';

export interface WorkflowStage {
  id: string;
  name: string;
  type: StageType;
  slaHours: number;
  isMandatory: boolean;
  allowedRoles: string[];
  description?: string;
}

export interface WorkflowRule {
  id: string;
  name: string;
  field: string;
  operator: string;
  value: string;
  action: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  programName: string;
  effectiveFrom: string;
  effectiveTo?: string;
  stages: WorkflowStage[];
  rules: WorkflowRule[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}
