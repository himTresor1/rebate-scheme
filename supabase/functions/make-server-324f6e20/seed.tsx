import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

export async function seedDataLite() {
  try {
    console.log('🚀 Starting lite seed data operation...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const allPermissions = await kv.getByPrefix('permission:');
    const allRoles = await kv.getByPrefix('role:');
    const allUsers = await kv.getByPrefix('user:');
    const allApplications = await kv.getByPrefix('application:');
    const allOrganizations = await kv.getByPrefix('organization:');
    const allBankDetails = await kv.getByPrefix('bank:');

    for (const item of [...allPermissions, ...allRoles, ...allUsers, ...allApplications, ...allOrganizations, ...allBankDetails]) {
      if (item.id) await kv.del(item.id);
    }

    const knownDemoEmails = new Set([
      'admin@bankofkigali.rw',
      'af.finance@bankofkigali.rw',
      'marketing.agent@bankofkigali.rw',
    ]);
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    for (const user of authUsers?.users || []) {
      if (user.email && knownDemoEmails.has(user.email)) {
        await supabase.auth.admin.deleteUser(user.id);
      }
    }

    const permissionsToSeed = [
      { name: 'Submit Application', code: 'applications.submit', description: 'Submit new applications', category: 'Applications', action: 'SUBMIT' },
      { name: 'View Applications', code: 'applications.view', description: 'View application submissions', category: 'Applications', action: 'VIEW' },
      { name: 'Edit Application', code: 'applications.edit', description: 'Edit application details', category: 'Applications', action: 'EDIT' },
      { name: 'View Dashboard', code: 'reporting.view_dashboard', description: 'Access dashboard', category: 'Reporting', action: 'VIEW' },
      { name: 'AF Submit Applications', code: 'AF_SUBMIT_APPLICATIONS', description: 'Submit new rebate applications', category: 'Asset Financier', action: 'SUBMIT' },
      { name: 'AF View Own Applications', code: 'AF_VIEW_OWN_APPLICATIONS', description: 'View submitted applications', category: 'Asset Financier', action: 'VIEW' },
      { name: 'AF Edit Own Applications', code: 'AF_EDIT_OWN_APPLICATIONS', description: 'Edit draft applications', category: 'Asset Financier', action: 'EDIT' },
      { name: 'AF Upload Documents', code: 'AF_UPLOAD_DOCUMENTS', description: 'Upload and manage documents', category: 'Asset Financier', action: 'UPLOAD' },
      { name: 'AF Manage Rebate Team', code: 'AF_MANAGE_STAFF', description: 'Manage organization Rebate Team members', category: 'Asset Financier', action: 'MANAGE_USERS' },
    ];

    for (const perm of permissionsToSeed) {
      const permissionId = `permission:${perm.code}`;
      await kv.set(permissionId, { id: permissionId, ...perm, isActive: true, createdAt: new Date().toISOString() });
    }

    const rolesToSeed = [
      {
        name: 'Asset Financier Admin',
        code: 'ASSET_FINANCIER_ADMIN',
        description: 'Asset financing company administrator',
        permissions: [
          'permission:applications.view',
          'permission:applications.submit',
          'permission:applications.edit',
          'permission:reporting.view_dashboard',
          'permission:AF_SUBMIT_APPLICATIONS',
          'permission:AF_VIEW_OWN_APPLICATIONS',
          'permission:AF_EDIT_OWN_APPLICATIONS',
          'permission:AF_UPLOAD_DOCUMENTS',
          'permission:AF_MANAGE_STAFF',
        ]
      },
      {
        name: 'Asset Financier Rebate Team',
        code: 'ASSET_FINANCIER_STAFF',
        description: 'Marketing agent role',
        permissions: [
          'permission:applications.view',
          'permission:applications.submit',
          'permission:reporting.view_dashboard',
          'permission:AF_SUBMIT_APPLICATIONS',
          'permission:AF_VIEW_OWN_APPLICATIONS',
          'permission:AF_UPLOAD_DOCUMENTS',
        ]
      },
      {
        name: 'Asset Financier Officer',
        code: 'ASSET_FINANCIER_OFFICER',
        description: 'AF finance decision maker role',
        permissions: [
          'permission:applications.view',
          'permission:applications.submit',
          'permission:applications.edit',
          'permission:reporting.view_dashboard',
          'permission:AF_SUBMIT_APPLICATIONS',
          'permission:AF_VIEW_OWN_APPLICATIONS',
          'permission:AF_EDIT_OWN_APPLICATIONS',
          'permission:AF_UPLOAD_DOCUMENTS',
        ]
      },
    ];

    for (const role of rolesToSeed) {
      const roleId = `role:${role.code}`;
      await kv.set(roleId, { id: roleId, ...role, isActive: true, createdAt: new Date().toISOString() });
    }

    const orgId = `organization:${crypto.randomUUID()}`;
    await kv.set(orgId, {
      id: orgId,
      name: 'Bank of Kigali',
      type: 'BANK',
      registrationNumber: 'REG-BOK-DEMO',
      contactEmail: 'admin@bankofkigali.rw',
      contactPhone: '+250788890123',
      address: 'Kigali, Rwanda',
      isActive: true,
      createdAt: new Date().toISOString()
    });

    const demoUsers = [
      { email: 'admin@bankofkigali.rw', password: 'SecureBoK@2026', name: 'BoK Admin', role: 'ASSET_FINANCIER_ADMIN', phone: '+250788890123' },
      { email: 'af.finance@bankofkigali.rw', password: 'SecureBoKFinance@2026', name: 'BoK AF Finance Decision-Maker', role: 'ASSET_FINANCIER_OFFICER', phone: '+250788901111' },
      { email: 'marketing.agent@bankofkigali.rw', password: 'SecureBoKAgent@2026', name: 'BoK Marketing Agent', role: 'ASSET_FINANCIER_STAFF', phone: '+250788901112' },
    ];

    const createdUsers: Array<{ id: string; email?: string }> = [];
    for (const demoUser of demoUsers) {
      const { data } = await supabase.auth.admin.createUser({
        email: demoUser.email,
        password: demoUser.password,
        user_metadata: { name: demoUser.name, role: demoUser.role, organization: 'Bank of Kigali' },
        email_confirm: true
      });
      if (!data?.user) continue;

      await kv.set(`user:${data.user.id}:organization`, orgId);
      await kv.set(`user:${data.user.id}`, {
        id: data.user.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
        phoneNumber: demoUser.phone,
        organization: 'Bank of Kigali',
        organizationId: orgId,
        assetFinancierId: orgId,
        isActive: true,
        createdAt: new Date().toISOString()
      });
      createdUsers.push(data.user);
    }

    const getUserId = (email: string) => createdUsers.find(u => u.email === email)?.id;
    const marketingId = getUserId('marketing.agent@bankofkigali.rw');
    const officerId = getUserId('af.finance@bankofkigali.rw');
    const adminId = getUserId('admin@bankofkigali.rw');

    const now = new Date();
    const applications = [
      { applicantName: 'Jean M', status: 'submitted', submittedBy: marketingId, submittedByName: 'BoK Marketing Agent' },
      { applicantName: 'Aline U', status: 'under-review', submittedBy: marketingId, submittedByName: 'BoK Marketing Agent' },
      { applicantName: 'Patrick N', status: 'approved', submittedBy: officerId, submittedByName: 'BoK AF Finance Decision-Maker' },
      { applicantName: 'Claire K', status: 'awaiting-final-approval', submittedBy: officerId, submittedByName: 'BoK AF Finance Decision-Maker' },
      { applicantName: 'Eric B', status: 'disbursed', submittedBy: adminId, submittedByName: 'BoK Admin' },
    ];

    const applicationIds: string[] = [];
    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
      const appId = `application:${crypto.randomUUID()}`;
      applicationIds.push(appId);
      await kv.set(appId, {
        id: appId,
        ticketNumber: `AF-BOK-${String(101 + i)}`,
        companyName: 'Bank of Kigali',
        organizationId: orgId,
        applicantId: app.submittedBy,
        submittedBy: app.submittedBy,
        submittedByName: app.submittedByName,
        applicantName: app.applicantName,
        email: `${app.applicantName.toLowerCase().replace(/\s+/g, '.')}@demo.rw`,
        phoneNumber: `+25078890${1000 + i}`,
        nationalId: `11990${10000000000 + i}`,
        motorcycleBrand: ['Ampersand', 'Spiro', 'Bbox'][i % 3],
        motorcycleModel: `Demo Model ${i + 1}`,
        status: app.status,
        rebateAmount: `${450000 + i * 15000}`,
        submittedDate: new Date(now.getTime() - i * 86400000).toISOString(),
        createdAt: new Date(now.getTime() - i * 86400000).toISOString(),
        updatedAt: now.toISOString(),
      });
    }

    await kv.set(`organization:${orgId}:applications`, applicationIds);

    return {
      success: true,
      message: 'Lite demo data seeded successfully',
      stats: {
        permissions: permissionsToSeed.length,
        roles: rolesToSeed.length,
        users: createdUsers.length,
        organizations: 1,
        applications: applications.length
      }
    };
  } catch (error: any) {
    console.error('❌ FATAL ERROR IN LITE SEED DATA:', error);
    throw error;
  }
}

export async function seedData() {
  try {
    console.log('🚀 Starting seed data operation...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    console.log('🗑️  CLEARING ALL EXISTING DATA...');
  
  // ============ DELETE ALL EXISTING DATA ============
  // Get all keys and delete them
  const allPermissions = await kv.getByPrefix('permission:');
  const allRoles = await kv.getByPrefix('role:');
  const allUsers = await kv.getByPrefix('user:');
  const allCriteria = await kv.getByPrefix('criteria:');
  const allApplications = await kv.getByPrefix('application:');
  const allEvaluations = await kv.getByPrefix('evaluation:');
  const allDisbursements = await kv.getByPrefix('disbursement:');
  const allOrganizations = await kv.getByPrefix('organization:');
  const allBankDetails = await kv.getByPrefix('bank:');
  const allStaff = await kv.getByPrefix('staff:');
  
  console.log(`Found: ${allPermissions.length} permissions, ${allRoles.length} roles, ${allUsers.length} user records`);
  console.log(`Found: ${allCriteria.length} criteria, ${allApplications.length} applications`);
  console.log(`Found: ${allOrganizations.length} organizations, ${allBankDetails.length} bank details`);
  
  // Delete all KV store data
  for (const item of [...allPermissions, ...allRoles, ...allUsers, ...allCriteria, 
                       ...allApplications, ...allEvaluations, ...allDisbursements,
                       ...allOrganizations, ...allBankDetails, ...allStaff]) {
    if (item.id) {
      await kv.del(item.id);
    }
  }
  
  // Delete all Supabase Auth users
  console.log('🗑️  Deleting all Supabase Auth users...');
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (users) {
      for (const user of users) {
        await supabase.auth.admin.deleteUser(user.id);
      }
      console.log(`✅ Deleted ${users.length} auth users`);
    }
  } catch (error) {
    console.log('Note: Error deleting auth users (might be empty):', error);
  }
  
  console.log('✅ All existing data cleared!');
  console.log('');
  console.log('🌱 SEEDING NEW DATA...');
  
  // ============ SEED PERMISSIONS ============
  const permissionsToSeed = [
    // Applications
    { name: 'View Applications', code: 'applications.view', description: 'View application submissions', category: 'Applications', action: 'VIEW' },
    { name: 'Submit Application', code: 'applications.submit', description: 'Submit new applications', category: 'Applications', action: 'SUBMIT' },
    { name: 'Edit Application', code: 'applications.edit', description: 'Edit application details', category: 'Applications', action: 'EDIT' },
    { name: 'Assign Application', code: 'applications.assign', description: 'Assign applications to analysts', category: 'Applications', action: 'ASSIGN' },
    { name: 'Delete Application', code: 'applications.delete', description: 'Delete applications', category: 'Applications', action: 'DELETE' },
    { name: 'Request Application Info', code: 'applications.request_info', description: 'Request additional information', category: 'Applications', action: 'REQUEST_INFO' },
    
    // Verification
    { name: 'View Verification', code: 'verification.view', description: 'View verification details', category: 'Verification', action: 'VIEW' },
    { name: 'NIDA Check', code: 'verification.nida_check', description: 'Perform NIDA verification', category: 'Verification', action: 'APPROVE' },
    { name: 'RURA Check', code: 'verification.rura_check', description: 'Perform RURA verification', category: 'Verification', action: 'APPROVE' },
    { name: 'Verify Documents', code: 'verification.documents', description: 'Verify uploaded documents', category: 'Verification', action: 'APPROVE' },
    { name: 'Approve Verification', code: 'verification.approve', description: 'Approve verification stage', category: 'Verification', action: 'APPROVE' },
    { name: 'Reject Verification', code: 'verification.reject', description: 'Reject verification stage', category: 'Verification', action: 'REJECT' },
    
    // Financial
    { name: 'View Financial', code: 'financial.view', description: 'View financial information', category: 'Financial', action: 'VIEW' },
    { name: 'Initiate Payment', code: 'financial.initiate_payment', description: 'Initiate payment disbursement', category: 'Financial', action: 'INITIATE_PAYMENT' },
    { name: 'Authorize Payment', code: 'financial.authorize_payment', description: 'Authorize payment disbursement', category: 'Financial', action: 'AUTHORIZE_PAYMENT' },
    { name: 'Approve Disbursement', code: 'financial.approve_disbursement', description: 'Approve final disbursement', category: 'Financial', action: 'APPROVE' },
    { name: 'Reject Disbursement', code: 'financial.reject_disbursement', description: 'Reject disbursement', category: 'Financial', action: 'REJECT' },
    { name: 'View Payment History', code: 'financial.payment_history', description: 'View payment history', category: 'Financial', action: 'VIEW' },
    
    // Reporting
    { name: 'View Dashboard', code: 'reporting.view_dashboard', description: 'Access dashboard', category: 'Reporting', action: 'VIEW' },
    { name: 'View Analytics', code: 'reporting.view_analytics', description: 'View analytics and insights', category: 'Reporting', action: 'VIEW' },
    { name: 'Export Reports', code: 'reporting.export', description: 'Export reports and data', category: 'Reporting', action: 'EXPORT' },
    { name: 'View All Applications', code: 'reporting.view_all', description: 'View all applications system-wide', category: 'Reporting', action: 'VIEW' },
    
    // System
    { name: 'Manage Users', code: 'system.manage_users', description: 'Create and manage users', category: 'System', action: 'MANAGE_USERS' },
    { name: 'Manage Roles', code: 'system.manage_roles', description: 'Create and manage roles', category: 'System', action: 'MANAGE_ROLES' },
    { name: 'Manage Permissions', code: 'system.manage_permissions', description: 'Assign permissions', category: 'System', action: 'MANAGE_PERMISSIONS' },
    { name: 'View Audit Logs', code: 'system.view_audit_logs', description: 'View audit trail', category: 'System', action: 'VIEW_AUDIT_LOGS' },
    { name: 'Manage Criteria', code: 'system.manage_criteria', description: 'Manage eligibility criteria', category: 'System', action: 'MANAGE_USERS' },
    { name: 'System Settings', code: 'system.settings', description: 'Configure system settings', category: 'System', action: 'MANAGE_USERS' },
    
    // Asset Financier Specific
    { name: 'AF Submit Applications', code: 'AF_SUBMIT_APPLICATIONS', description: 'Submit new rebate applications', category: 'Asset Financier', action: 'SUBMIT' },
    { name: 'AF View Own Applications', code: 'AF_VIEW_OWN_APPLICATIONS', description: 'View submitted applications', category: 'Asset Financier', action: 'VIEW' },
    { name: 'AF Edit Own Applications', code: 'AF_EDIT_OWN_APPLICATIONS', description: 'Edit draft applications', category: 'Asset Financier', action: 'EDIT' },
    { name: 'AF Upload Documents', code: 'AF_UPLOAD_DOCUMENTS', description: 'Upload and manage documents', category: 'Asset Financier', action: 'UPLOAD' },
    { name: 'AF Respond to Info Requests', code: 'AF_RESPOND_TO_INFO_REQUESTS', description: 'Respond to analyst feedback', category: 'Asset Financier', action: 'RESPOND' },
    { name: 'AF View Bank Details', code: 'AF_VIEW_BANK_DETAILS', description: 'View organization bank account', category: 'Asset Financier', action: 'VIEW' },
    { name: 'AF Update Bank Details', code: 'AF_UPDATE_BANK_DETAILS', description: 'Update bank account information', category: 'Asset Financier', action: 'UPDATE' },
    { name: 'AF Record Repayments', code: 'AF_RECORD_REPAYMENTS', description: 'Record monthly rider repayments', category: 'Asset Financier', action: 'RECORD' },
    { name: 'AF Manage Rebate Team', code: 'AF_MANAGE_STAFF', description: 'Manage organization Rebate Team members', category: 'Asset Financier', action: 'MANAGE_USERS' },
  ];

  console.log('Seeding permissions...');
  for (const perm of permissionsToSeed) {
    const permissionId = `permission:${perm.code}`;
    await kv.set(permissionId, {
      id: permissionId,
      ...perm,
      isActive: true,
      createdAt: new Date().toISOString()
    });
  }
  console.log(`✅ Created ${permissionsToSeed.length} permissions`);

  // ============ SEED ROLES ============
  console.log('📋 Seeding roles...');
  const rolesToSeed = [
    {
      name: 'System Administrator',
      code: 'SYSTEM_ADMIN',
      description: 'Full system access with all permissions',
      permissions: permissionsToSeed.map(p => `permission:${p.code}`)
    },
    {
      name: 'Rebate Analyst',
      code: 'REBATE_ANALYST',
      description: 'Analyzes and verifies rebate applications',
      permissions: [
        'permission:applications.view',
        'permission:applications.edit',
        'permission:applications.request_info',
        'permission:verification.view',
        'permission:verification.nida_check',
        'permission:verification.rura_check',
        'permission:verification.documents',
        'permission:verification.approve',
        'permission:verification.reject',
        'permission:reporting.view_dashboard',
      ]
    },
    {
      name: 'Rebate Manager',
      code: 'REBATE_MANAGER',
      description: 'Reviews analyst evaluations and approved applications, reviews signed leases',
      permissions: [
        'permission:applications.view',
        'permission:applications.edit',
        'permission:applications.request_info',
        'permission:verification.view',
        'permission:verification.approve',
        'permission:verification.reject',
        'permission:reporting.view_dashboard',
        'permission:reporting.view_all',
      ]
    },

    {
      name: 'E-Moto Program Manager',
      code: 'E_MOTO_PROGRAM_MANAGER',
      description: 'Makes final approval decisions on rebate applications',
      permissions: [
        'permission:applications.view',
        'permission:applications.assign',
        'permission:applications.request_info',
        'permission:verification.view',
        'permission:verification.approve',
        'permission:verification.reject',
        'permission:financial.view',
        'permission:financial.authorize_payment',
        'permission:financial.approve_disbursement',
        'permission:financial.reject_disbursement',
        'permission:financial.payment_history',
        'permission:reporting.view_dashboard',
        'permission:reporting.view_analytics',
        'permission:reporting.export',
        'permission:reporting.view_all',
      ]
    },
    {
      name: 'Designated Finance Officer',
      code: 'DESIGNATED_FINANCE_OFFICER',
      description: 'Wires approved rebate funds to Asset Financiers',
      permissions: [
        'permission:applications.view',
        'permission:financial.view',
        'permission:financial.initiate_payment',
        'permission:financial.authorize_payment',
        'permission:financial.payment_history',
        'permission:reporting.view_dashboard',
      ]
    },
    {
      name: 'M&E Team',
      code: 'ME_TEAM',
      description: 'Monitoring & Evaluation - investigates applications when requested',
      permissions: [
        'permission:applications.view',
        'permission:reporting.view_dashboard',
        'permission:reporting.view_analytics',
        'permission:reporting.export',
        'permission:reporting.view_all',
      ]
    },
    {
      name: 'External Reviewer',
      code: 'EXTERNAL_REVIEWER',
      description: 'View-only access for auditors, consultants, senior management',
      permissions: [
        'permission:applications.view',
        'permission:reporting.view_dashboard',
        'permission:reporting.view_analytics',
        'permission:reporting.view_all',
      ]
    },
    {
      name: 'Claims Officer',
      code: 'CLAIMS_OFFICER',
      description: 'Submits and manages claims',
      permissions: [
        'permission:applications.view',
        'permission:applications.submit',
        'permission:applications.edit',
        'permission:reporting.view_dashboard',
      ]
    },
    {
      name: 'Asset Financier Admin',
      code: 'ASSET_FINANCIER_ADMIN',
      description: 'Asset financing company administrator',
      permissions: [
        'permission:applications.view',
        'permission:applications.submit',
        'permission:applications.edit',
        'permission:reporting.view_dashboard',
        'permission:financial.payment_history',
        'permission:AF_SUBMIT_APPLICATIONS',
        'permission:AF_VIEW_OWN_APPLICATIONS',
        'permission:AF_EDIT_OWN_APPLICATIONS',
        'permission:AF_UPLOAD_DOCUMENTS',
        'permission:AF_RESPOND_TO_INFO_REQUESTS',
        'permission:AF_VIEW_BANK_DETAILS',
        'permission:AF_UPDATE_BANK_DETAILS',
        'permission:AF_RECORD_REPAYMENTS',
        'permission:AF_MANAGE_STAFF',
      ]
    },
    {
      name: 'Asset Financier Rebate Team',
      code: 'ASSET_FINANCIER_STAFF',
      description: 'Asset financing company Rebate Team member',
      permissions: [
        'permission:applications.view',
        'permission:applications.submit',
        'permission:reporting.view_dashboard',
        'permission:AF_SUBMIT_APPLICATIONS',
        'permission:AF_VIEW_OWN_APPLICATIONS',
        'permission:AF_UPLOAD_DOCUMENTS',
      ]
    },
  ];

  console.log('Seeding roles...');
  for (const role of rolesToSeed) {
    const roleId = `role:${role.code}`;
    await kv.set(roleId, {
      id: roleId,
      ...role,
      isActive: true,
      createdAt: new Date().toISOString()
    });
  }
  console.log(`✅ Created ${rolesToSeed.length} roles`);
  
  // ============ CREATE DEMO USERS ============
  console.log('👥 Creating demo users...');
  const demoUsers = [
    // System Admin
    { email: 'admin@mfa.rw', password: 'SecureAdmin@2026', name: 'System Administrator', role: 'SYSTEM_ADMIN', phone: '+250788123456' },
    
    // Internal MFA Staff
    { email: 'analyst1@mfa.rw', password: 'SecureAnalyst@2026', name: 'Alice Mugisha', role: 'REBATE_ANALYST', phone: '+250788234567' },
    { email: 'analyst2@mfa.rw', password: 'SecureAnalyst@2026', name: 'Brian Nkusi', role: 'REBATE_ANALYST', phone: '+250788345678' },
    { email: 'manager1@mfa.rw', password: 'SecureManager@2026', name: 'Catherine Uwera', role: 'REBATE_MANAGER', phone: '+250788456789' },
    { email: 'manager2@mfa.rw', password: 'SecureManager@2026', name: 'David Habimana', role: 'REBATE_MANAGER', phone: '+250788567890' },
    { email: 'program.manager@mfa.rw', password: 'SecureProgram@2026', name: 'Tony Nsengimana', role: 'E_MOTO_PROGRAM_MANAGER', phone: '+250788567891' },
    { email: 'finance1@mfa.rw', password: 'SecureFinance@2026', name: 'Finance Officer 1', role: 'DESIGNATED_FINANCE_OFFICER', phone: '+250788678902' },
    { email: 'finance2@mfa.rw', password: 'SecureFinance@2026', name: 'Finance Officer 2', role: 'DESIGNATED_FINANCE_OFFICER', phone: '+250788678903' },
    { email: 'me1@mfa.rw', password: 'SecureME@2026', name: 'M&E Officer 1', role: 'ME_TEAM', phone: '+250788789012' },
    { email: 'me2@mfa.rw', password: 'SecureME@2026', name: 'M&E Officer 2', role: 'ME_TEAM', phone: '+250788789013' },
    { email: 'auditor@external.com', password: 'SecureAuditor@2026', name: 'External Auditor', role: 'EXTERNAL_REVIEWER', phone: '+250788890001' },
    
    // Asset Financier Admins (Banks & MFIs)
    { email: 'admin@bankofkigali.rw', password: 'SecureBoK@2026', name: 'Grace Mukandori', role: 'ASSET_FINANCIER_ADMIN', phone: '+250788890123', organization: 'Bank of Kigali' },
    { email: 'admin@equitybank.rw', password: 'SecureEquity@2026', name: 'Henry Ntirenganya', role: 'ASSET_FINANCIER_ADMIN', phone: '+250788901234', organization: 'Equity Bank Rwanda' },
    { email: 'admin@visionfinance.rw', password: 'SecureVision@2026', name: 'Irene Uwimana', role: 'ASSET_FINANCIER_ADMIN', phone: '+250788012345', organization: 'Vision Finance Company' },
    { email: 'admin@umurenge.rw', password: 'SecureUmurenge@2026', name: 'James Nshimiyimana', role: 'ASSET_FINANCIER_ADMIN', phone: '+250788123567', organization: 'Umurenge SACCO' },
    
    // E-Moto Companies (Claims Officers)
    { email: 'claims@ampersand.rw', password: 'SecureAmpersand@2026', name: 'Kevin Bizimana', role: 'CLAIMS_OFFICER', phone: '+250788234678', organization: 'Ampersand Rwanda' },
    { email: 'claims@evelectric.rw', password: 'SecureEV@2026', name: 'Linda Keza', role: 'CLAIMS_OFFICER', phone: '+250788345789', organization: 'EV Electric Rwanda' },
    { email: 'claims@opibus.rw', password: 'SecureOpibus@2026', name: 'Martin Uwizeye', role: 'CLAIMS_OFFICER', phone: '+250788456890', organization: 'Opibus Rwanda' },
  ];

  const createdUsers: any[] = [];
  const organizationIds: Map<string, string> = new Map();
  
  console.log(`Creating ${demoUsers.length} demo users...`);
  for (const demoUser of demoUsers) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: demoUser.email,
        password: demoUser.password,
        user_metadata: { 
          name: demoUser.name, 
          role: demoUser.role,
          organization: demoUser.organization 
        },
        email_confirm: true
      });
      
      if (data?.user) {
        // Create organization for Asset Financier Admins first
        let orgId = null;
        if (demoUser.role === 'ASSET_FINANCIER_ADMIN' && demoUser.organization) {
          orgId = `organization:${crypto.randomUUID()}`;
          organizationIds.set(demoUser.organization, orgId);
          
          await kv.set(orgId, {
            id: orgId,
            name: demoUser.organization,
            type: demoUser.organization.includes('Bank') ? 'BANK' : demoUser.organization.includes('SACCO') ? 'MFI' : 'EMOTO_COMPANY',
            registrationNumber: `REG-${Math.random().toString(36).substring(7).toUpperCase()}`,
            adminUserId: data.user.id,
            contactEmail: demoUser.email,
            contactPhone: demoUser.phone,
            address: 'Kigali, Rwanda',
            isActive: true,
            createdAt: new Date().toISOString()
          });
          
          // Link user to organization
          await kv.set(`user:${data.user.id}:organization`, orgId);
        }
        
        await kv.set(`user:${data.user.id}`, {
          id: data.user.id,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
          phoneNumber: demoUser.phone,
          organization: demoUser.organization,
          organizationId: orgId, // Add organizationId to user profile
          assetFinancierId: orgId, // Also add assetFinancierId for consistency
          createdAt: new Date().toISOString()
        });
        
        createdUsers.push(data.user);
        
        console.log(`✅ Created user: ${demoUser.email}`);
      }
    } catch (error) {
      console.log(`❌ Failed to create user ${demoUser.email}:`, error);
    }
  }
  console.log(`✅ Created ${createdUsers.length} users`);

  // ============ CREATE BANK DETAILS FOR ASSET FINANCIERS ============
  console.log('🏦 Creating bank details...');
  let bankDetailsCount = 0;
  for (const [orgName, orgId] of organizationIds.entries()) {
    const bankId = `bank:${orgId}`;
    await kv.set(bankId, {
      id: bankId,
      organizationId: orgId,
      bankName: orgName.includes('Bank') ? orgName : 'Bank of Kigali',
      accountName: orgName,
      accountNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      branchName: 'Kigali Main Branch',
      swiftCode: `BKRW${Math.random().toString(36).substring(7).toUpperCase()}`,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    bankDetailsCount++;
  }
  console.log(`✅ Created ${bankDetailsCount} bank account configurations`);

  // ============ CREATE STAFF MEMBERS FOR ASSET FINANCIERS ============
  console.log('👔 Creating staff members...');
  const staffUsersCreated: any[] = [];
  
  for (const [orgName, orgId] of organizationIds.entries()) {
    // Create 2-3 staff members per organization  
    const staffMembers = [
      { 
        name: `${orgName.split(' ')[0]} Rebate Team Member 1`, 
        email: `staff1@${orgName.toLowerCase().replace(/\s+/g, '')}.rw`,
        password: `Secure${orgName.split(' ')[0]}@2026`,
        role: 'ASSET_FINANCIER_STAFF',
        phone: `+250788${Math.floor(100000 + Math.random() * 900000)}`
      },
      { 
        name: `${orgName.split(' ')[0]} Rebate Team Member 2`, 
        email: `staff2@${orgName.toLowerCase().replace(/\s+/g, '')}.rw`,
        password: `Secure${orgName.split(' ')[0]}@2026`,
        role: 'ASSET_FINANCIER_OFFICER',
        phone: `+250788${Math.floor(100000 + Math.random() * 900000)}`
      },
      { 
        name: `${orgName.split(' ')[0]} Rebate Team Member 3`, 
        email: `staff3@${orgName.toLowerCase().replace(/\s+/g, '')}.rw`,
        password: `Secure${orgName.split(' ')[0]}@2026`,
        role: 'ASSET_FINANCIER_STAFF',
        phone: `+250788${Math.floor(100000 + Math.random() * 900000)}`
      },
    ];
    
    for (const staff of staffMembers) {
      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email: staff.email,
          password: staff.password,
          user_metadata: { 
            name: staff.name, 
            role: staff.role,
            organization: orgName
          },
          email_confirm: true
        });
        
        if (data?.user) {
          await kv.set(`user:${data.user.id}`, {
            id: data.user.id,
            email: staff.email,
            name: staff.name,
            role: staff.role,
            phoneNumber: staff.phone,
            organization: orgName,
            assetFinancierId: orgId,
            permissions: [
              'AF_SUBMIT_APPLICATIONS',
              'AF_VIEW_OWN_APPLICATIONS',
              'AF_UPLOAD_DOCUMENTS',
              'AF_RESPOND_TO_INFO_REQUESTS'
            ],
            isActive: true,
            createdAt: new Date().toISOString(),
            createdBy: 'System'
          });
          
          staffUsersCreated.push({ ...data.user, orgId, orgName });
          console.log(`✅ Created staff user: ${staff.email}`);
        }
      } catch (error) {
        console.log(`❌ Failed to create staff user ${staff.email}:`, error);
      }
    }
  }
  console.log(`✅ Created ${staffUsersCreated.length} staff members`);

  // ============ CREATE ELIGIBILITY CRITERIA ============
  console.log('✅ Creating eligibility criteria...');
  const criteria = [
    { text: 'Applicant must be a registered business in Rwanda with valid TIN', level: 'ANALYST' },
    { text: 'Minimum 12 months of operational history in e-mobility sector', level: 'ANALYST' },
    { text: 'Valid business license and tax compliance certificate (current fiscal year)', level: 'ANALYST' },
    { text: 'E-motorcycle must be brand new and locally assembled or imported with proper documentation', level: 'ANALYST' },
    { text: 'Motorcycle must meet Rwanda Standards Board (RSB) certification requirements', level: 'QA' },
    { text: 'Battery capacity must be minimum 3.5 kWh for passenger motorcycles', level: 'QA' },
    { text: 'Proof of insurance coverage for the motorcycle (minimum 1 year)', level: 'ANALYST' },
    { text: 'Loan agreement or financing contract with registered financial institution', level: 'CFO' },
    { text: 'Rider must have valid motorcycle driving license (Class A)', level: 'ANALYST' },
    { text: 'No outstanding rebate claims or unresolved compliance issues', level: 'QA' },
    { text: 'Environmental impact assessment for high-volume applications (>10 units)', level: 'CFO' },
    { text: 'Commitment to monthly rider repayment tracking and reporting', level: 'ALL' }
  ];

  const criteriaIds: string[] = [];
  console.log(`Saving ${criteria.length} criteria to database...`);
  for (let i = 0; i < criteria.length; i++) {
    const criterionId = `criteria:${crypto.randomUUID()}`;
    await kv.set(criterionId, {
      id: criterionId,
      text: criteria[i].text,
      enabled: true,
      approvalLevel: criteria[i].level,
      order: i,
      category: i < 4 ? 'Business Eligibility' : i < 8 ? 'Vehicle Requirements' : 'Compliance',
      createdAt: new Date().toISOString()
    });
    criteriaIds.push(criterionId);
  }
  console.log(`✅ Created ${criteria.length} eligibility criteria`);

  // ============ CREATE DEMO APPLICATIONS ============
  console.log('📝 Creating demo applications...');
  const applications = [
    // Bank of Kigali applications - MORE DATA FOR DEMO
    {
      companyName: 'Bank of Kigali',
      applicantName: 'John Mutesi',
      nationalId: '1199080012345678',
      phoneNumber: '+250788111111',
      email: 'john.mutesi@gmail.com',
      motorcycleBrand: 'Ampersand',
      motorcycleModel: 'E-Moto Gen 2',
      chassisNumber: 'AMP2024KGL001',
      batteryCapacity: '4.8 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3500000',
      loanAmount: '3000000',
      interestRate: '12.5',
      loanTerm: '24',
      monthlyRepayment: '141500',
      rebateAmount: '500000',
      status: 'approved',
      organizationId: organizationIds.get('Bank of Kigali'),
      applicantId: createdUsers.find(u => u.email === 'admin@bankofkigali.rw')?.id,
      isRetrofit: false,
      documents: {
        affidavit: { uploaded: true, uploadedAt: '2026-01-10T09:00:00Z', name: 'affidavit_signed.pdf' },
        nationalId: { uploaded: true, uploadedAt: '2026-01-10T09:05:00Z', name: 'national_id_copy.pdf' },
        taxiLicense: { uploaded: true, uploadedAt: '2026-01-10T09:10:00Z', name: 'rura_taxi_license.pdf' },
        coopOrReference: { uploaded: true, uploadedAt: '2026-01-10T09:15:00Z', name: 'coop_membership_letter.pdf' }
      },
      eligibilityCheck: {
        performedBy: createdUsers.find(u => u.email === 'analyst1@mfa.rw')?.id,
        performedByName: 'Alice Uwera',
        performedAt: '2026-01-11T14:30:00Z',
        socialRegistryCheck: {
          status: 'pass',
          found: true,
          incomeLevel: 'Low (<RWF 105,000/month)',
          householdSize: 5,
          ubudeheCategory: 'Category 1',
          location: 'Kigali - Gasabo',
          registeredDate: '2023-01-15',
          checkedAt: '2026-01-11T14:30:00Z'
        },
        ruraRraCheck: {
          status: 'pass',
          additionalMotos: [],
          totalMotorcycles: 1,
          message: 'No additional motorcycles found',
          checkedAt: '2026-01-11T14:32:00Z'
        },
        analystNotes: 'Applicant verified in Social Registry. Low income confirmed. No additional motorcycles registered. Eligible for rebate program.',
        overallStatus: 'eligible'
      }
    },
    {
      companyName: 'Bank of Kigali',
      applicantName: 'Sarah Uwase',
      nationalId: '1198575012345679',
      phoneNumber: '+250788222222',
      email: 'sarah.uwase@gmail.com',
      motorcycleBrand: 'Opibus',
      motorcycleModel: 'Opibus Moto',
      chassisNumber: 'OPI2024KGL002',
      batteryCapacity: '5.2 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3800000',
      loanAmount: '3300000',
      interestRate: '11.5',
      loanTerm: '36',
      monthlyRepayment: '108000',
      rebateAmount: '550000',
      status: 'manager-review',
      organizationId: organizationIds.get('Bank of Kigali'),
      applicantId: createdUsers.find(u => u.email === 'admin@bankofkigali.rw')?.id,
      assignedTo: createdUsers.find(u => u.email === 'manager1@mfa.rw')?.id,
      isRetrofit: true,
      documents: {
        affidavit: { uploaded: true, uploadedAt: '2026-01-15T10:00:00Z', name: 'affidavit.pdf' },
        nationalId: { uploaded: true, uploadedAt: '2026-01-15T10:05:00Z', name: 'id_card.pdf' },
        taxiLicense: { uploaded: true, uploadedAt: '2026-01-15T10:10:00Z', name: 'license.pdf' },
        coopOrReference: { uploaded: true, uploadedAt: '2026-01-15T10:15:00Z', name: 'reference_letter.pdf' },
        retrofitCompanyLetter: { uploaded: true, uploadedAt: '2026-01-15T10:20:00Z', name: 'emoto_company_letter.pdf' },
        retrofitOwnerLetter: { uploaded: true, uploadedAt: '2026-01-15T10:25:00Z', name: 'engine_disposal_agreement.pdf' },
        retrofitAgreement: { uploaded: true, uploadedAt: '2026-01-15T10:30:00Z', name: 'retrofit_agreement.pdf' }
      },
      eligibilityCheck: {
        performedBy: createdUsers.find(u => u.email === 'analyst1@mfa.rw')?.id,
        performedByName: 'Alice Uwera',
        performedAt: '2026-01-16T11:00:00Z',
        socialRegistryCheck: {
          status: 'pass',
          found: true,
          incomeLevel: 'Low (<RWF 105,000/month)',
          householdSize: 4,
          ubudeheCategory: 'Category 2',
          location: 'Kigali - Kicukiro',
          registeredDate: '2022-08-20',
          checkedAt: '2026-01-16T11:00:00Z'
        },
        ruraRraCheck: {
          status: 'pass',
          additionalMotos: [
            { plate: 'RAD 123A', type: 'ICE Motorcycle', registeredYear: 2020, status: 'Active' }
          ],
          totalMotorcycles: 2,
          message: '1 additional motorcycle found in RURA/RRA records',
          checkedAt: '2026-01-16T11:02:00Z'
        },
        nationalIdCheck: {
          status: 'pass',
          valid: true,
          verified: true,
          name: 'Name matches application',
          dateOfBirth: '1985-03-15',
          gender: 'Female',
          province: 'Kigali City',
          district: 'Kicukiro',
          checkedAt: '2026-01-16T11:05:00Z'
        },
        analystNotes: 'Retrofit application. Applicant owns 1 ICE motorcycle (RAD 123A, 2020) which will be converted. All eligibility checks passed. Eligible for retrofit program.',
        overallStatus: 'eligible'
      }
    },
    {
      companyName: 'Bank of Kigali',
      applicantName: 'Peter Kagabo',
      nationalId: '1200012345678901',
      phoneNumber: '+250788333333',
      email: 'peter.kagabo@gmail.com',
      motorcycleBrand: 'EV Electric',
      motorcycleModel: 'Thunder E100',
      chassisNumber: 'EVE2024KGL003',
      batteryCapacity: '4.5 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3200000',
      loanAmount: '2800000',
      interestRate: '13.0',
      loanTerm: '24',
      monthlyRepayment: '133000',
      rebateAmount: '480000',
      status: 'under-review',
      organizationId: organizationIds.get('Bank of Kigali'),
      applicantId: createdUsers.find(u => u.email === 'admin@bankofkigali.rw')?.id,
      assignedTo: createdUsers.find(u => u.email === 'analyst1@mfa.rw')?.id,
      isRetrofit: false,
      documents: {
        affidavit: { uploaded: true, uploadedAt: '2026-01-20T08:00:00Z', name: 'affidavit_peter.pdf' },
        nationalId: { uploaded: true, uploadedAt: '2026-01-20T08:05:00Z', name: 'nid_peter.pdf' },
        taxiLicense: { uploaded: true, uploadedAt: '2026-01-20T08:10:00Z', name: 'taxi_license_peter.pdf' },
        coopOrReference: { uploaded: true, uploadedAt: '2026-01-20T08:15:00Z', name: 'coop_member_peter.pdf' },
        mobileMoneyStatements: { uploaded: true, uploadedAt: '2026-01-20T08:20:00Z', name: 'momo_statements_3months.pdf' }
      },
      eligibilityCheck: {
        overallStatus: 'not-checked',
        socialRegistryCheck: { status: 'pending' },
        ruraRraCheck: { status: 'pending' },
        nationalIdCheck: { status: 'pending' },
        taxiLicenseCheck: { status: 'pending' }
      }
    },
    {
      companyName: 'Bank of Kigali',
      applicantName: 'Agnes Mukandutiye',
      nationalId: '1199012345678902',
      phoneNumber: '+250788334455',
      email: 'agnes.mukandutiye@gmail.com',
      motorcycleBrand: 'Ampersand',
      motorcycleModel: 'E-Moto Gen 2',
      chassisNumber: 'AMP2024KGL004',
      batteryCapacity: '4.8 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3500000',
      loanAmount: '3100000',
      interestRate: '12.0',
      loanTerm: '30',
      monthlyRepayment: '119000',
      rebateAmount: '520000',
      status: 'program-manager-review',
      organizationId: organizationIds.get('Bank of Kigali'),
      applicantId: createdUsers.find(u => u.email === 'admin@bankofkigali.rw')?.id,
      assignedTo: createdUsers.find(u => u.email === 'program.manager@mfa.rw')?.id
    },
    {
      companyName: 'Bank of Kigali',
      applicantName: 'Patrick Nkubito',
      nationalId: '1198012345678903',
      phoneNumber: '+250788445566',
      email: 'patrick.nkubito@gmail.com',
      motorcycleBrand: 'Opibus',
      motorcycleModel: 'Opibus Moto Pro',
      chassisNumber: 'OPI2024KGL005',
      batteryCapacity: '5.5 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '4000000',
      loanAmount: '3500000',
      interestRate: '11.5',
      loanTerm: '36',
      monthlyRepayment: '113000',
      rebateAmount: '600000',
      status: 'disbursed',
      organizationId: organizationIds.get('Bank of Kigali'),
      applicantId: createdUsers.find(u => u.email === 'admin@bankofkigali.rw')?.id
    },
    {
      companyName: 'Bank of Kigali',
      applicantName: 'Claudine Uwimana',
      nationalId: '1200112345678904',
      phoneNumber: '+250788556677',
      email: 'claudine.uwimana@gmail.com',
      motorcycleBrand: 'EV Electric',
      motorcycleModel: 'Thunder E150',
      chassisNumber: 'EVE2024KGL006',
      batteryCapacity: '4.8 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3600000',
      loanAmount: '3200000',
      interestRate: '13.0',
      loanTerm: '24',
      monthlyRepayment: '154000',
      rebateAmount: '540000',
      status: 'pending',
      organizationId: organizationIds.get('Bank of Kigali'),
      applicantId: createdUsers.find(u => u.email === 'admin@bankofkigali.rw')?.id
    },
    {
      companyName: 'Bank of Kigali',
      applicantName: 'Emmanuel Nshimiyimana',
      nationalId: '1197812345678905',
      phoneNumber: '+250788667788',
      email: 'emmanuel.nshimiyimana@gmail.com',
      motorcycleBrand: 'Ampersand',
      motorcycleModel: 'E-Moto Gen 2 Plus',
      chassisNumber: 'AMP2024KGL007',
      batteryCapacity: '5.0 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3700000',
      loanAmount: '3300000',
      interestRate: '12.5',
      loanTerm: '30',
      monthlyRepayment: '130000',
      rebateAmount: '560000',
      status: 'assigned',
      organizationId: organizationIds.get('Bank of Kigali'),
      applicantId: createdUsers.find(u => u.email === 'admin@bankofkigali.rw')?.id,
      assignedTo: createdUsers.find(u => u.email === 'analyst1@mfa.rw')?.id
    },
    {
      companyName: 'Bank of Kigali',
      applicantName: 'Francine Umubyeyi',
      nationalId: '1199612345678906',
      phoneNumber: '+250788778899',
      email: 'francine.umubyeyi@gmail.com',
      motorcycleBrand: 'Opibus',
      motorcycleModel: 'Opibus Moto',
      chassisNumber: 'OPI2024KGL008',
      batteryCapacity: '5.0 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3500000',
      loanAmount: '3000000',
      interestRate: '12.0',
      loanTerm: '24',
      monthlyRepayment: '141000',
      rebateAmount: '500000',
      status: 'approved',
      organizationId: organizationIds.get('Bank of Kigali'),
      applicantId: createdUsers.find(u => u.email === 'admin@bankofkigali.rw')?.id
    },
    
    // Equity Bank applications
    {
      companyName: 'Equity Bank Rwanda',
      applicantName: 'Marie Uwamahoro',
      nationalId: '1199512012345680',
      phoneNumber: '+250788444444',
      email: 'marie.uwamahoro@gmail.com',
      motorcycleBrand: 'Ampersand',
      motorcycleModel: 'E-Moto Gen 2',
      chassisNumber: 'AMP2024EQT001',
      batteryCapacity: '4.8 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3500000',
      loanAmount: '3100000',
      interestRate: '12.0',
      loanTerm: '30',
      monthlyRepayment: '119000',
      rebateAmount: '520000',
      status: 'disbursed',
      organizationId: organizationIds.get('Equity Bank Rwanda'),
      applicantId: createdUsers.find(u => u.email === 'admin@equitybank.rw')?.id
    },
    {
      companyName: 'Equity Bank Rwanda',
      applicantName: 'Eric Niyonzima',
      nationalId: '1197812012345681',
      phoneNumber: '+250788555555',
      email: 'eric.niyonzima@gmail.com',
      motorcycleBrand: 'Opibus',
      motorcycleModel: 'Opibus Moto Pro',
      chassisNumber: 'OPI2024EQT002',
      batteryCapacity: '5.5 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '4000000',
      loanAmount: '3500000',
      interestRate: '11.0',
      loanTerm: '36',
      monthlyRepayment: '113000',
      rebateAmount: '600000',
      status: 'program-manager-review',
      organizationId: organizationIds.get('Equity Bank Rwanda'),
      applicantId: createdUsers.find(u => u.email === 'admin@equitybank.rw')?.id,
      assignedTo: createdUsers.find(u => u.email === 'program.manager@mfa.rw')?.id
    },
    {
      companyName: 'Equity Bank Rwanda',
      applicantName: 'David Mugisha',
      nationalId: '1201012012345686',
      phoneNumber: '+250788101010',
      email: 'david.mugisha@gmail.com',
      motorcycleBrand: 'Ampersand',
      motorcycleModel: 'E-Moto Gen 2',
      chassisNumber: 'AMP2024EQT003',
      batteryCapacity: '4.8 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3500000',
      loanAmount: '3000000',
      interestRate: '12.0',
      loanTerm: '24',
      monthlyRepayment: '141000',
      rebateAmount: '500000',
      status: 'pending',
      organizationId: organizationIds.get('Equity Bank Rwanda'),
      applicantId: createdUsers.find(u => u.email === 'admin@equitybank.rw')?.id
    },
    {
      companyName: 'Equity Bank Rwanda',
      applicantName: 'Josephine Mukamana',
      nationalId: '1198112012345687',
      phoneNumber: '+250788121212',
      email: 'josephine.mukamana@gmail.com',
      motorcycleBrand: 'EV Electric',
      motorcycleModel: 'Thunder E100',
      chassisNumber: 'EVE2024EQT004',
      batteryCapacity: '4.5 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3200000',
      loanAmount: '2800000',
      interestRate: '13.0',
      loanTerm: '24',
      monthlyRepayment: '133000',
      rebateAmount: '480000',
      status: 'manager-review',
      organizationId: organizationIds.get('Equity Bank Rwanda'),
      applicantId: createdUsers.find(u => u.email === 'admin@equitybank.rw')?.id,
      assignedTo: createdUsers.find(u => u.email === 'manager1@mfa.rw')?.id
    },
    
    // ====== POST-APPROVAL WORKFLOW STAGE APPLICATIONS ======
    {
      companyName: 'Bank of Kigali',
      applicantName: 'Samuel Habimana',
      nationalId: '1199712345678907',
      phoneNumber: '+250788887766',
      email: 'samuel.habimana@gmail.com',
      motorcycleBrand: 'Ampersand',
      motorcycleModel: 'E-Moto Gen 2',
      chassisNumber: 'AMP2024KGL009',
      batteryCapacity: '4.8 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3500000',
      loanAmount: '3000000',
      interestRate: '12.5',
      loanTerm: '24',
      monthlyRepayment: '141500',
      rebateAmount: '500000',
      status: 'approved-pending-lease',
      organizationId: organizationIds.get('Bank of Kigali'),
      applicantId: createdUsers.find(u => u.email === 'admin@bankofkigali.rw')?.id
    },
    {
      companyName: 'Bank of Kigali',
      applicantName: 'Jean Paul Mugisha',
      nationalId: '1199012345678912',
      phoneNumber: '+250788776655',
      email: 'jp.mugisha@gmail.com',
      motorcycleBrand: 'Ampersand',
      motorcycleModel: 'E-Moto Pro',
      chassisNumber: 'AMP2024KGL010',
      batteryCapacity: '5.0 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3700000',
      loanAmount: '3200000',
      interestRate: '12.0',
      loanTerm: '30',
      monthlyRepayment: '125000',
      rebateAmount: '520000',
      status: 'approved-pending-lease',
      organizationId: organizationIds.get('Bank of Kigali'),
      applicantId: createdUsers.find(u => u.email === 'admin@bankofkigali.rw')?.id
    },
    {
      companyName: 'Bank of Kigali',
      applicantName: 'Grace Mukamana',
      nationalId: '1199112345678913',
      phoneNumber: '+250788665544',
      email: 'grace.mukamana@gmail.com',
      motorcycleBrand: 'Opibus',
      motorcycleModel: 'Opibus Moto Pro',
      chassisNumber: 'OPI2024BK006',
      batteryCapacity: '5.5 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '4000000',
      loanAmount: '3500000',
      interestRate: '11.8',
      loanTerm: '36',
      monthlyRepayment: '115000',
      rebateAmount: '580000',
      status: 'approved-pending-lease',
      organizationId: organizationIds.get('Bank of Kigali'),
      applicantId: createdUsers.find(u => u.email === 'admin@bankofkigali.rw')?.id
    },
    {
      companyName: 'Equity Bank Rwanda',
      applicantName: 'Rose Uwera',
      nationalId: '1198812345678908',
      phoneNumber: '+250788998877',
      email: 'rose.uwera@gmail.com',
      motorcycleBrand: 'Opibus',
      motorcycleModel: 'Opibus Moto',
      chassisNumber: 'OPI2024EQT005',
      batteryCapacity: '5.2 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3800000',
      loanAmount: '3300000',
      interestRate: '11.5',
      loanTerm: '36',
      monthlyRepayment: '108000',
      rebateAmount: '550000',
      status: 'lease-review',
      organizationId: organizationIds.get('Equity Bank Rwanda'),
      applicantId: createdUsers.find(u => u.email === 'admin@equitybank.rw')?.id,
      assignedTo: createdUsers.find(u => u.email === 'manager1@mfa.rw')?.id,
      signedLeaseDocument: { name: 'signed_lease_rose_uwera.pdf', uploadedAt: new Date().toISOString() }
    },
    {
      companyName: 'Vision Finance Company',
      applicantName: 'Emmanuel Nkurunziza',
      nationalId: '1200312345678909',
      phoneNumber: '+250788112233',
      email: 'emmanuel.nkurunziza@gmail.com',
      motorcycleBrand: 'EV Electric',
      motorcycleModel: 'Thunder E100',
      chassisNumber: 'EVE2024VSN005',
      batteryCapacity: '4.5 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3200000',
      loanAmount: '2800000',
      interestRate: '14.0',
      loanTerm: '24',
      monthlyRepayment: '133000',
      rebateAmount: '480000',
      status: 'pending-payment',
      organizationId: organizationIds.get('Vision Finance Company'),
      applicantId: createdUsers.find(u => u.email === 'admin@visionfinance.rw')?.id,
      signedLeaseDocument: { name: 'signed_lease_emmanuel.pdf', uploadedAt: new Date().toISOString() },
      leaseApprovedBy: createdUsers.find(u => u.email === 'manager1@mfa.rw')?.id,
      leaseApprovedAt: new Date().toISOString()
    },
    {
      companyName: 'Umurenge SACCO',
      applicantName: 'Christine Nyirahabimana',
      nationalId: '1197912345678910',
      phoneNumber: '+250788445588',
      email: 'christine.nyira@gmail.com',
      motorcycleBrand: 'Ampersand',
      motorcycleModel: 'E-Moto Gen 2 Plus',
      chassisNumber: 'AMP2024UMU001',
      batteryCapacity: '5.0 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3700000',
      loanAmount: '3300000',
      interestRate: '13.5',
      loanTerm: '30',
      monthlyRepayment: '135000',
      rebateAmount: '560000',
      status: 'payment-complete',
      organizationId: organizationIds.get('Umurenge SACCO'),
      applicantId: createdUsers.find(u => u.email === 'admin@umurenge.rw')?.id,
      signedLeaseDocument: { name: 'signed_lease_christine.pdf', uploadedAt: new Date().toISOString() },
      leaseApprovedBy: createdUsers.find(u => u.email === 'manager1@mfa.rw')?.id,
      leaseApprovedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      paymentProcessedBy: createdUsers.find(u => u.email === 'finance1@mfa.rw')?.id,
      paymentProcessedAt: new Date().toISOString(),
      paymentReferenceNumber: 'PAY-2026-' + Math.floor(Math.random() * 10000)
    },
    
    // Vision Finance applications
    {
      companyName: 'Vision Finance Company',
      applicantName: 'Alice Mukamazimpaka',
      nationalId: '1200112012345682',
      phoneNumber: '+250788666666',
      email: 'alice.muka@gmail.com',
      motorcycleBrand: 'EV Electric',
      motorcycleModel: 'Thunder E150',
      chassisNumber: 'EVE2024VSN001',
      batteryCapacity: '4.8 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3600000',
      loanAmount: '3200000',
      interestRate: '14.0',
      loanTerm: '24',
      monthlyRepayment: '154000',
      rebateAmount: '540000',
      status: 'assigned',
      organizationId: organizationIds.get('Vision Finance Company'),
      applicantId: createdUsers.find(u => u.email === 'admin@visionfinance.rw')?.id,
      assignedTo: createdUsers.find(u => u.email === 'analyst1@mfa.rw')?.id
    },
    {
      companyName: 'Vision Finance Company',
      applicantName: 'Robert Habimana',
      nationalId: '1198212012345683',
      phoneNumber: '+250788777777',
      email: 'robert.habimana@gmail.com',
      motorcycleBrand: 'Ampersand',
      motorcycleModel: 'E-Moto Gen 2 Plus',
      chassisNumber: 'AMP2024VSN002',
      batteryCapacity: '5.0 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3700000',
      loanAmount: '3300000',
      interestRate: '13.5',
      loanTerm: '30',
      monthlyRepayment: '130000',
      rebateAmount: '560000',
      status: 'pending',
      organizationId: organizationIds.get('Vision Finance Company'),
      applicantId: createdUsers.find(u => u.email === 'admin@visionfinance.rw')?.id
    },
    {
      companyName: 'Vision Finance Company',
      applicantName: 'Christine Uwera',
      nationalId: '1199312012345688',
      phoneNumber: '+250788131313',
      email: 'christine.uwera@gmail.com',
      motorcycleBrand: 'Opibus',
      motorcycleModel: 'Opibus Moto',
      chassisNumber: 'OPI2024VSN003',
      batteryCapacity: '5.2 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3800000',
      loanAmount: '3300000',
      interestRate: '14.0',
      loanTerm: '36',
      monthlyRepayment: '108000',
      rebateAmount: '550000',
      status: 'under-review',
      organizationId: organizationIds.get('Vision Finance Company'),
      applicantId: createdUsers.find(u => u.email === 'admin@visionfinance.rw')?.id,
      assignedTo: createdUsers.find(u => u.email === 'analyst1@mfa.rw')?.id
    },
    
    // Umurenge SACCO applications
    {
      companyName: 'Umurenge SACCO',
      applicantName: 'Grace Mukamana',
      nationalId: '1199912012345684',
      phoneNumber: '+250788888888',
      email: 'grace.mukamana@gmail.com',
      motorcycleBrand: 'Opibus',
      motorcycleModel: 'Opibus Moto',
      chassisNumber: 'OPI2024UMU001',
      batteryCapacity: '5.0 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3500000',
      loanAmount: '3000000',
      interestRate: '15.0',
      loanTerm: '24',
      monthlyRepayment: '147000',
      rebateAmount: '500000',
      status: 'rejected',
      rejectionReason: 'Incomplete documentation - missing insurance certificate',
      organizationId: organizationIds.get('Umurenge SACCO'),
      applicantId: createdUsers.find(u => u.email === 'admin@umurenge.rw')?.id
    },
    {
      companyName: 'Umurenge SACCO',
      applicantName: 'Jean Claude Habiyambere',
      nationalId: '1197012012345685',
      phoneNumber: '+250788999999',
      email: 'jc.habiyambere@gmail.com',
      motorcycleBrand: 'EV Electric',
      motorcycleModel: 'Thunder E100',
      chassisNumber: 'EVE2024UMU002',
      batteryCapacity: '4.5 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3200000',
      loanAmount: '2700000',
      interestRate: '15.5',
      loanTerm: '30',
      monthlyRepayment: '110000',
      rebateAmount: '470000',
      status: 'info-requested',
      infoRequest: 'Please provide updated insurance certificate and rider license',
      organizationId: organizationIds.get('Umurenge SACCO'),
      applicantId: createdUsers.find(u => u.email === 'admin@umurenge.rw')?.id
    },
    {
      companyName: 'Umurenge SACCO',
      applicantName: 'Gilbert Nkundimana',
      nationalId: '1200212012345689',
      phoneNumber: '+250788141414',
      email: 'gilbert.nkundimana@gmail.com',
      motorcycleBrand: 'Ampersand',
      motorcycleModel: 'E-Moto Gen 2',
      chassisNumber: 'AMP2024UMU003',
      batteryCapacity: '4.8 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3500000',
      loanAmount: '3000000',
      interestRate: '15.0',
      loanTerm: '24',
      monthlyRepayment: '147000',
      rebateAmount: '500000',
      status: 'approved',
      organizationId: organizationIds.get('Umurenge SACCO'),
      applicantId: createdUsers.find(u => u.email === 'admin@umurenge.rw')?.id
    },
    
    // Applications in NEW Finance Workflow Statuses
    {
      companyName: 'Bank of Kigali',
      applicantName: 'Alice Mukamana',
      nationalId: '1199512345678904',
      phoneNumber: '+250788444444',
      email: 'alice.mukamana@gmail.com',
      motorcycleBrand: 'Ampersand',
      motorcycleModel: 'Ampersand E-Moto',
      chassisNumber: 'AMP2024KGL010',
      batteryCapacity: '5.8 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3600000',
      loanAmount: '3100000',
      interestRate: '12.0',
      loanTerm: '24',
      monthlyRepayment: '146000',
      rebateAmount: '520000',
      status: 'qa-approved',
      organizationId: organizationIds.get('Bank of Kigali'),
      applicantId: createdUsers.find(u => u.email === 'admin@bankofkigali.rw')?.id
    },
    {
      companyName: 'Equity Bank Rwanda',
      applicantName: 'Robert Habimana',
      nationalId: '1199612345678905',
      phoneNumber: '+250788555555',
      email: 'robert.h@gmail.com',
      motorcycleBrand: 'Opibus',
      motorcycleModel: 'Opibus Moto',
      chassisNumber: 'OPI2024EQU011',
      batteryCapacity: '5.2 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3800000',
      loanAmount: '3300000',
      interestRate: '11.5',
      loanTerm: '30',
      monthlyRepayment: '124000',
      rebateAmount: '550000',
      status: 'awaiting-final-approval',
      initiatedBy: createdUsers.find(u => u.email === 'finance1@mfa.rw')?.id,
      initiatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      organizationId: organizationIds.get('Equity Bank Rwanda'),
      applicantId: createdUsers.find(u => u.email === 'admin@equitybank.rw')?.id
    },
    {
      companyName: 'Vision Finance Company',
      applicantName: 'Grace Uwimana',
      nationalId: '1199712345678906',
      phoneNumber: '+250788666666',
      email: 'grace.uwimana@gmail.com',
      motorcycleBrand: 'EV Electric',
      motorcycleModel: 'Thunder E100',
      chassisNumber: 'EVE2024VFC012',
      batteryCapacity: '4.5 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3300000',
      loanAmount: '2900000',
      interestRate: '13.5',
      loanTerm: '24',
      monthlyRepayment: '138000',
      rebateAmount: '490000',
      status: 'approved-for-payment',
      initiatedBy: createdUsers.find(u => u.email === 'finance1@mfa.rw')?.id,
      initiatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      approvedBy: createdUsers.find(u => u.email === 'program.manager@mfa.rw')?.id,
      approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      organizationId: organizationIds.get('Vision Finance Company'),
      applicantId: createdUsers.find(u => u.email === 'admin@visionfinance.rw')?.id
    },
    {
      companyName: 'Bank of Kigali',
      applicantName: 'David Nkusi',
      nationalId: '1199812345678907',
      phoneNumber: '+250788777777',
      email: 'david.nkusi@gmail.com',
      motorcycleBrand: 'Ampersand',
      motorcycleModel: 'Ampersand E-Moto',
      chassisNumber: 'AMP2024KGL013',
      batteryCapacity: '5.8 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3600000',
      loanAmount: '3100000',
      interestRate: '12.0',
      loanTerm: '24',
      monthlyRepayment: '146000',
      rebateAmount: '520000',
      status: 'payment-processed',
      paymentReferenceNumber: 'PAY-2024-001',
      paymentProcessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      organizationId: organizationIds.get('Bank of Kigali'),
      applicantId: createdUsers.find(u => u.email === 'admin@bankofkigali.rw')?.id
    },
    {
      companyName: 'Equity Bank Rwanda',
      applicantName: 'Claudine Uwase',
      nationalId: '1199912345678908',
      phoneNumber: '+250788888888',
      email: 'claudine.uwase@gmail.com',
      motorcycleBrand: 'Opibus',
      motorcycleModel: 'Opibus Moto',
      chassisNumber: 'OPI2024EQU014',
      batteryCapacity: '5.2 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3800000',
      loanAmount: '3300000',
      interestRate: '11.5',
      loanTerm: '30',
      monthlyRepayment: '124000',
      rebateAmount: '550000',
      status: 'funded',
      fundedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      proofOfPaymentUrl: '/mock/proof-of-payment/receipt-2024-002.pdf',
      organizationId: organizationIds.get('Equity Bank Rwanda'),
      applicantId: createdUsers.find(u => u.email === 'admin@equitybank.rw')?.id
    },
    
    // ============ ADDITIONAL APPLICATIONS FOR FINANCE WORKFLOW ============
    
    // Applications ready for disbursement initiation (Finance Initiator needs these)
    {
      companyName: 'Bank of Kigali',
      applicantName: 'Joseline Mukasonga',
      nationalId: '1200012345678910',
      phoneNumber: '+250788999111',
      email: 'joseline.m@gmail.com',
      motorcycleBrand: 'Ampersand',
      motorcycleModel: 'E-Moto Gen 2',
      chassisNumber: 'AMP2024KGL015',
      batteryCapacity: '4.8 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3500000',
      loanAmount: '3000000',
      interestRate: '12.5',
      loanTerm: '24',
      monthlyRepayment: '141500',
      rebateAmount: '500000',
      status: 'approved',
      organizationId: organizationIds.get('Bank of Kigali'),
      applicantId: createdUsers.find(u => u.email === 'admin@bankofkigali.rw')?.id
    },
    {
      companyName: 'Equity Bank Rwanda',
      applicantName: 'Patrick Niyomugabo',
      nationalId: '1199012345678911',
      phoneNumber: '+250788999222',
      email: 'patrick.n@gmail.com',
      motorcycleBrand: 'Opibus',
      motorcycleModel: 'Opibus Moto Pro',
      chassisNumber: 'OPI2024EQU016',
      batteryCapacity: '5.5 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '4000000',
      loanAmount: '3500000',
      interestRate: '11.5',
      loanTerm: '36',
      monthlyRepayment: '113000',
      rebateAmount: '600000',
      status: 'approved',
      organizationId: organizationIds.get('Equity Bank Rwanda'),
      applicantId: createdUsers.find(u => u.email === 'admin@equitybank.rw')?.id
    },
    {
      companyName: 'Vision Finance Company',
      applicantName: 'Alice Nyirahabimana',
      nationalId: '1198012345678912',
      phoneNumber: '+250788999333',
      email: 'alice.nyira@gmail.com',
      motorcycleBrand: 'EV Electric',
      motorcycleModel: 'Thunder E150',
      chassisNumber: 'EVE2024VFC017',
      batteryCapacity: '4.8 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3600000',
      loanAmount: '3200000',
      interestRate: '13.0',
      loanTerm: '24',
      monthlyRepayment: '154000',
      rebateAmount: '540000',
      status: 'approved',
      organizationId: organizationIds.get('Vision Finance Company'),
      applicantId: createdUsers.find(u => u.email === 'admin@visionfinance.rw')?.id
    },
    {
      companyName: 'Umurenge SACCO',
      applicantName: 'Emmanuel Habiyambere',
      nationalId: '1200112345678913',
      phoneNumber: '+250788999444',
      email: 'emmanuel.h@gmail.com',
      motorcycleBrand: 'Ampersand',
      motorcycleModel: 'E-Moto Gen 2 Plus',
      chassisNumber: 'AMP2024UMU018',
      batteryCapacity: '5.0 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3700000',
      loanAmount: '3300000',
      interestRate: '14.0',
      loanTerm: '30',
      monthlyRepayment: '133000',
      rebateAmount: '560000',
      status: 'approved',
      organizationId: organizationIds.get('Umurenge SACCO'),
      applicantId: createdUsers.find(u => u.email === 'admin@umurenge.rw')?.id
    },
    
    // Applications with initiated disbursement (waiting for 2nd signature approval)
    {
      companyName: 'Bank of Kigali',
      applicantName: 'Christine Uwera',
      nationalId: '1199112345678914',
      phoneNumber: '+250788999555',
      email: 'christine.u@gmail.com',
      motorcycleBrand: 'Opibus',
      motorcycleModel: 'Opibus Moto',
      chassisNumber: 'OPI2024KGL019',
      batteryCapacity: '5.0 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3500000',
      loanAmount: '3000000',
      interestRate: '12.0',
      loanTerm: '24',
      monthlyRepayment: '141000',
      rebateAmount: '500000',
      status: 'awaiting-final-approval',
      initiatedBy: createdUsers.find(u => u.email === 'finance1@mfa.rw')?.id,
      initiatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      organizationId: organizationIds.get('Bank of Kigali'),
      applicantId: createdUsers.find(u => u.email === 'admin@bankofkigali.rw')?.id
    },
    {
      companyName: 'Equity Bank Rwanda',
      applicantName: 'Daniel Mugisha',
      nationalId: '1197912345678915',
      phoneNumber: '+250788999666',
      email: 'daniel.m@gmail.com',
      motorcycleBrand: 'Ampersand',
      motorcycleModel: 'E-Moto Gen 2',
      chassisNumber: 'AMP2024EQU020',
      batteryCapacity: '4.8 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3500000',
      loanAmount: '3100000',
      interestRate: '12.0',
      loanTerm: '30',
      monthlyRepayment: '119000',
      rebateAmount: '520000',
      status: 'awaiting-final-approval',
      initiatedBy: createdUsers.find(u => u.email === 'finance1@mfa.rw')?.id,
      initiatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      organizationId: organizationIds.get('Equity Bank Rwanda'),
      applicantId: createdUsers.find(u => u.email === 'admin@equitybank.rw')?.id
    },
    {
      companyName: 'Vision Finance Company',
      applicantName: 'Francoise Umutoni',
      nationalId: '1200212345678916',
      phoneNumber: '+250788999777',
      email: 'francoise.u@gmail.com',
      motorcycleBrand: 'EV Electric',
      motorcycleModel: 'Thunder E100',
      chassisNumber: 'EVE2024VFC021',
      batteryCapacity: '4.5 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3300000',
      loanAmount: '2900000',
      interestRate: '13.5',
      loanTerm: '24',
      monthlyRepayment: '138000',
      rebateAmount: '490000',
      status: 'awaiting-final-approval',
      initiatedBy: createdUsers.find(u => u.email === 'finance1@mfa.rw')?.id,
      initiatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      organizationId: organizationIds.get('Vision Finance Company'),
      applicantId: createdUsers.find(u => u.email === 'admin@visionfinance.rw')?.id
    },
    
    // Applications approved for payment (ready for processing)
    {
      companyName: 'Umurenge SACCO',
      applicantName: 'Gilbert Habimana',
      nationalId: '1198112345678917',
      phoneNumber: '+250788999888',
      email: 'gilbert.h@gmail.com',
      motorcycleBrand: 'Ampersand',
      motorcycleModel: 'E-Moto Gen 2 Plus',
      chassisNumber: 'AMP2024UMU022',
      batteryCapacity: '5.0 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3700000',
      loanAmount: '3300000',
      interestRate: '14.0',
      loanTerm: '30',
      monthlyRepayment: '133000',
      rebateAmount: '560000',
      status: 'approved-for-payment',
      initiatedBy: createdUsers.find(u => u.email === 'finance1@mfa.rw')?.id,
      initiatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      approvedBy: createdUsers.find(u => u.email === 'finance1@mfa.rw')?.id,
      approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      organizationId: organizationIds.get('Umurenge SACCO'),
      applicantId: createdUsers.find(u => u.email === 'admin@umurenge.rw')?.id
    },
    {
      companyName: 'Bank of Kigali',
      applicantName: 'Henriette Mukamana',
      nationalId: '1199212345678918',
      phoneNumber: '+250788999999',
      email: 'henriette.m@gmail.com',
      motorcycleBrand: 'Opibus',
      motorcycleModel: 'Opibus Moto Pro',
      chassisNumber: 'OPI2024KGL023',
      batteryCapacity: '5.5 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '4000000',
      loanAmount: '3500000',
      interestRate: '11.5',
      loanTerm: '36',
      monthlyRepayment: '113000',
      rebateAmount: '600000',
      status: 'approved-for-payment',
      initiatedBy: createdUsers.find(u => u.email === 'finance1@mfa.rw')?.id,
      initiatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      approvedBy: createdUsers.find(u => u.email === 'finance2@mfa.rw')?.id,
      approvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      organizationId: organizationIds.get('Bank of Kigali'),
      applicantId: createdUsers.find(u => u.email === 'admin@bankofkigali.rw')?.id
    },
    {
      companyName: 'Equity Bank Rwanda',
      applicantName: 'Innocent Nkurunziza',
      nationalId: '1197812345678919',
      phoneNumber: '+250788888111',
      email: 'innocent.n@gmail.com',
      motorcycleBrand: 'EV Electric',
      motorcycleModel: 'Thunder E150',
      chassisNumber: 'EVE2024EQU024',
      batteryCapacity: '4.8 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3600000',
      loanAmount: '3200000',
      interestRate: '13.0',
      loanTerm: '24',
      monthlyRepayment: '154000',
      rebateAmount: '540000',
      status: 'approved-for-payment',
      initiatedBy: createdUsers.find(u => u.email === 'finance2@mfa.rw')?.id,
      initiatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      approvedBy: createdUsers.find(u => u.email === 'finance1@mfa.rw')?.id,
      approvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      organizationId: organizationIds.get('Equity Bank Rwanda'),
      applicantId: createdUsers.find(u => u.email === 'admin@equitybank.rw')?.id
    },
    
    // Applications with payment processed (waiting for delivery confirmation)
    {
      companyName: 'Vision Finance Company',
      applicantName: 'Jeanne Uwamahoro',
      nationalId: '1200312345678920',
      phoneNumber: '+250788888222',
      email: 'jeanne.u@gmail.com',
      motorcycleBrand: 'Ampersand',
      motorcycleModel: 'E-Moto Gen 2',
      chassisNumber: 'AMP2024VFC025',
      batteryCapacity: '4.8 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3500000',
      loanAmount: '3000000',
      interestRate: '12.5',
      loanTerm: '24',
      monthlyRepayment: '141500',
      rebateAmount: '500000',
      status: 'payment-processed',
      paymentReferenceNumber: 'PAY-2024-003',
      paymentProcessedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      organizationId: organizationIds.get('Vision Finance Company'),
      applicantId: createdUsers.find(u => u.email === 'admin@visionfinance.rw')?.id
    },
    {
      companyName: 'Umurenge SACCO',
      applicantName: 'Kevin Bizimungu',
      nationalId: '1199312345678921',
      phoneNumber: '+250788888333',
      email: 'kevin.b@gmail.com',
      motorcycleBrand: 'Opibus',
      motorcycleModel: 'Opibus Moto',
      chassisNumber: 'OPI2024UMU026',
      batteryCapacity: '5.2 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3800000',
      loanAmount: '3300000',
      interestRate: '11.5',
      loanTerm: '30',
      monthlyRepayment: '124000',
      rebateAmount: '550000',
      status: 'payment-processed',
      paymentReferenceNumber: 'PAY-2024-004',
      paymentProcessedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      organizationId: organizationIds.get('Umurenge SACCO'),
      applicantId: createdUsers.find(u => u.email === 'admin@umurenge.rw')?.id
    },
    {
      companyName: 'Bank of Kigali',
      applicantName: 'Louise Nirere',
      nationalId: '1198212345678922',
      phoneNumber: '+250788888444',
      email: 'louise.n@gmail.com',
      motorcycleBrand: 'EV Electric',
      motorcycleModel: 'Thunder E100',
      chassisNumber: 'EVE2024KGL027',
      batteryCapacity: '4.5 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3300000',
      loanAmount: '2900000',
      interestRate: '13.5',
      loanTerm: '24',
      monthlyRepayment: '138000',
      rebateAmount: '490000',
      status: 'payment-processed',
      paymentReferenceNumber: 'PAY-2024-005',
      paymentProcessedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      organizationId: organizationIds.get('Bank of Kigali'),
      applicantId: createdUsers.find(u => u.email === 'admin@bankofkigali.rw')?.id
    },
    
    // More applications for other workflow stages
    {
      companyName: 'Equity Bank Rwanda',
      applicantName: 'Martin Habineza',
      nationalId: '1200412345678923',
      phoneNumber: '+250788888555',
      email: 'martin.h@gmail.com',
      motorcycleBrand: 'Ampersand',
      motorcycleModel: 'E-Moto Gen 2 Plus',
      chassisNumber: 'AMP2024EQU028',
      batteryCapacity: '5.0 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3700000',
      loanAmount: '3300000',
      interestRate: '12.5',
      loanTerm: '30',
      monthlyRepayment: '130000',
      rebateAmount: '560000',
      status: 'program-manager-review',
      organizationId: organizationIds.get('Equity Bank Rwanda'),
      applicantId: createdUsers.find(u => u.email === 'admin@equitybank.rw')?.id,
      assignedTo: createdUsers.find(u => u.email === 'program.manager@mfa.rw')?.id
    },
    {
      companyName: 'Vision Finance Company',
      applicantName: 'Nadine Mukamazimpaka',
      nationalId: '1199412345678924',
      phoneNumber: '+250788888666',
      email: 'nadine.m@gmail.com',
      motorcycleBrand: 'Opibus',
      motorcycleModel: 'Opibus Moto Pro',
      chassisNumber: 'OPI2024VFC029',
      batteryCapacity: '5.5 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '4000000',
      loanAmount: '3500000',
      interestRate: '11.5',
      loanTerm: '36',
      monthlyRepayment: '113000',
      rebateAmount: '600000',
      status: 'manager-review',
      organizationId: organizationIds.get('Vision Finance Company'),
      applicantId: createdUsers.find(u => u.email === 'admin@visionfinance.rw')?.id,
      assignedTo: createdUsers.find(u => u.email === 'manager1@mfa.rw')?.id
    },
    {
      companyName: 'Umurenge SACCO',
      applicantName: 'Oscar Niyitegeka',
      nationalId: '1197712345678925',
      phoneNumber: '+250788888777',
      email: 'oscar.n@gmail.com',
      motorcycleBrand: 'EV Electric',
      motorcycleModel: 'Thunder E150',
      chassisNumber: 'EVE2024UMU030',
      batteryCapacity: '4.8 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3600000',
      loanAmount: '3200000',
      interestRate: '13.0',
      loanTerm: '24',
      monthlyRepayment: '154000',
      rebateAmount: '540000',
      status: 'under-review',
      organizationId: organizationIds.get('Umurenge SACCO'),
      applicantId: createdUsers.find(u => u.email === 'admin@umurenge.rw')?.id,
      assignedTo: createdUsers.find(u => u.email === 'analyst2@mfa.rw')?.id
    },
    {
      companyName: 'Bank of Kigali',
      applicantName: 'Pauline Uwimbabazi',
      nationalId: '1200512345678926',
      phoneNumber: '+250788777777',
      email: 'pauline.u@gmail.com',
      motorcycleBrand: 'Ampersand',
      motorcycleModel: 'E-Moto Gen 2',
      chassisNumber: 'AMP2024KGL031',
      batteryCapacity: '4.8 kWh',
      yearOfManufacture: '2024',
      purchasePrice: '3500000',
      loanAmount: '3000000',
      interestRate: '12.5',
      loanTerm: '24',
      monthlyRepayment: '141500',
      rebateAmount: '500000',
      status: 'assigned',
      organizationId: organizationIds.get('Bank of Kigali'),
      applicantId: createdUsers.find(u => u.email === 'admin@bankofkigali.rw')?.id,
      assignedTo: createdUsers.find(u => u.email === 'analyst1@mfa.rw')?.id
    }
  ];

  console.log(`✅ Defined ${applications.length} applications`);
  const applicationIds: string[] = [];
  const analystId = createdUsers.find(u => u.email === 'analyst1@mfa.rw')?.id;
  const managerId = createdUsers.find(u => u.email === 'manager1@mfa.rw')?.id;
  const programManagerId = createdUsers.find(u => u.email === 'program.manager@mfa.rw')?.id;
  const financeId = createdUsers.find(u => u.email === 'finance1@mfa.rw')?.id;
  
  console.log('💾 Saving applications to database...');
  
  // Helper function to generate repayment schedule
  const generateRepaymentSchedule = (loanAmount: number, interestRate: number, termMonths: number) => {
    const schedule = [];
    const monthlyRate = (interestRate / 100) / 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
    let balance = loanAmount;
    
    for (let i = 1; i <= termMonths; i++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      balance -= principal;
      
      schedule.push({
        month: i,
        payment: Math.round(monthlyPayment),
        principal: Math.round(principal),
        interest: Math.round(interest),
        balance: Math.round(Math.max(0, balance))
      });
    }
    
    return schedule;
  };
  
  // Helper function to generate mock documents
  const generateDocuments = (applicantName: string) => {
    return [
      // Identity Documents
      {
        name: 'National ID Document',
        type: 'pdf',
        url: `/mock/documents/national-id-${applicantName.replace(/\\s+/g, '-').toLowerCase()}.pdf`,
        uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        category: 'identity'
      },
      {
        name: 'Driver\'s License Document',
        type: 'pdf',
        url: `/mock/documents/drivers-license-${applicantName.replace(/\\s+/g, '-').toLowerCase()}.pdf`,
        uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        category: 'identity'
      },
      {
        name: 'Taxi License (RURA)',
        type: 'pdf',
        url: `/mock/documents/taxi-license-${applicantName.replace(/\\s+/g, '-').toLowerCase()}.pdf`,
        uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        verified: Math.random() > 0.3, // Sometimes not uploaded since it's optional
        category: 'identity'
      },
      // Application Documents
      {
        name: 'Signed Affidavit',
        type: 'pdf',
        url: `/mock/documents/affidavit-${applicantName.replace(/\\s+/g, '-').toLowerCase()}.pdf`,
        uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        category: 'application'
      },
      {
        name: 'Coop Membership / Reference Letter',
        type: 'pdf',
        url: `/mock/documents/coop-reference-${applicantName.replace(/\\s+/g, '-').toLowerCase()}.pdf`,
        uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        category: 'application'
      },
      {
        name: 'Mobile Money Statements',
        type: 'pdf',
        url: `/mock/documents/mobile-money-${applicantName.replace(/\\s+/g, '-').toLowerCase()}.pdf`,
        uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        verified: Math.random() > 0.5, // Sometimes not uploaded since it's optional
        category: 'application'
      }
    ];
  };
  
  // Helper function to generate review history based on status
  const generateReviewHistory = (status: string, createdDate: Date) => {
    const history = [];
    const analystReview = {
      reviewerName: 'John Analyst',
      reviewerRole: 'Rebate Analyst',
      reviewerId: analystId,
      decision: 'Approved',
      reviewedAt: new Date(createdDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'All documentation verified. Applicant meets all eligibility criteria. NIDA and RURA checks completed successfully.'
    };
    
    const qaReview = {
      reviewerName: 'Catherine Uwera',
      reviewerRole: 'Rebate Manager',
      reviewerId: createdUsers.find(u => u.email === 'manager1@mfa.rw')?.id,
      decision: 'Approved',
      reviewedAt: new Date(createdDate.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Quality assurance check passed. All calculations verified. No discrepancies found.'
    };
    
    const cfoReview = {
      reviewerName: 'Tony Nsengimana',
      reviewerRole: 'E-Moto Program Manager',
      reviewerId: createdUsers.find(u => u.email === 'program.manager@mfa.rw')?.id,
      decision: 'Approved',
      reviewedAt: new Date(createdDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Budget allocation confirmed. Approved for disbursement.'
    };
    
    const financeReview = {
      reviewerName: 'Finance Officer',
      reviewerRole: 'Finance Officer',
      reviewerId: createdUsers.find(u => u.email === 'finance1@mfa.rw')?.id,
      decision: 'Disbursed',
      reviewedAt: new Date(createdDate.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Funds disbursed to beneficiary account successfully.'
    };
    
    // Build history based on status
    if (status === 'draft' || status === 'submitted') {
      return history;
    }
    
    if (status === 'under-review') {
      return history;
    }
    
    if (status === 'manager-review') {
      history.push(analystReview);
      return history;
    }
    
    if (status === 'program-manager-review') {
      history.push(analystReview, qaReview);
      return history;
    }
    
    if (status === 'approved') {
      history.push(analystReview, qaReview, cfoReview);
      return history;
    }
    
    if (status === 'disbursed') {
      history.push(analystReview, qaReview, cfoReview, financeReview);
      return history;
    }
    
    if (status === 'rejected') {
      history.push({
        ...analystReview,
        decision: 'Rejected',
        notes: 'Application does not meet minimum eligibility criteria. Insufficient documentation provided.'
      });
      return history;
    }
    
    return history;
  };
  
  console.log('Creating demo applications...');
  
  // Get Bank of Kigali staff for random assignment
  const bokStaff = staffUsersCreated.filter(s => s.orgName === 'Bank of Kigali');
  
  for (let idx = 0; idx < applications.length; idx++) {
    const appData = applications[idx];
    console.log(`  Processing application ${idx + 1}/${applications.length}: ${appData.applicantName}`);
    const appId = `application:${crypto.randomUUID()}`;
    const daysAgo = Math.floor(Math.random() * 60); // Random date within last 60 days
    const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Parse loan data
    const loanAmount = parseInt(appData.loanAmount || '0');
    const interestRate = parseFloat(appData.interestRate || '0');
    const loanTerm = parseInt(appData.loanTerm || '24');
    
    // Assign submittedBy for Bank of Kigali apps (randomly assign to staff or admin)
    let submittedBy = appData.applicantId;
    if (appData.companyName === 'Bank of Kigali' && bokStaff.length > 0) {
      // 60% chance to be submitted by staff, 40% by admin
      if (Math.random() > 0.4) {
        const randomStaff = bokStaff[Math.floor(Math.random() * bokStaff.length)];
        submittedBy = randomStaff.id;
      }
    }
    
    await kv.set(appId, {
      id: appId,
      ...appData,
      submittedBy,
      // Add comprehensive applicant details
      applicantAddress: `KG ${Math.floor(Math.random() * 500 + 1)} St, ${Math.random() > 0.5 ? 'Kigali' : 'Musanze'}`,
      applicantOccupation: ['Teacher', 'Business Owner', 'Driver', 'Engineer', 'Nurse'][Math.floor(Math.random() * 5)],
      applicantIncome: `${Math.floor(Math.random() * 500000 + 200000)} RWF`,
      
      // Add vehicle registration details
      plateNumber: `RAD ${Math.floor(Math.random() * 900 + 100)} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      vehicleColor: ['Black', 'White', 'Blue', 'Red', 'Green'][Math.floor(Math.random() * 5)],
      registrationDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      
      // Add loan calculation details
      downPayment: Math.round(loanAmount * 0.2),
      processingFee: Math.round(loanAmount * 0.02),
      insuranceFee: Math.round(loanAmount * 0.05),
      totalLoanCost: Math.round(loanAmount * (1 + (interestRate / 100) * (loanTerm / 12))),
      
      // Add repayment schedule
      repaymentSchedule: generateRepaymentSchedule(loanAmount, interestRate, loanTerm),
      
      // Add documents
      documents: generateDocuments(appData.applicantName),
      
      // Add review history
      reviewHistory: generateReviewHistory(appData.status, createdDate),
      
      // Add verification details
      nidaVerified: ['approved', 'manager-review', 'program-manager-review', 'approved-pending-lease', 'lease-review', 'pending-payment', 'payment-complete', 'disbursed'].includes(appData.status),
      ruraVerified: ['approved', 'manager-review', 'program-manager-review', 'approved-pending-lease', 'lease-review', 'pending-payment', 'payment-complete', 'disbursed'].includes(appData.status),
      bankVerified: ['approved', 'program-manager-review', 'approved-pending-lease', 'lease-review', 'pending-payment', 'payment-complete', 'disbursed'].includes(appData.status),
      
      submittedDate: createdDate.toISOString(),
      createdAt: createdDate.toISOString(),
      updatedAt: new Date().toISOString()
    });
    applicationIds.push(appId);

    // Add to organization's application list
    if (appData.organizationId) {
      const orgApps = await kv.get(`organization:${appData.organizationId}:applications`) || [];
      await kv.set(`organization:${appData.organizationId}:applications`, [...orgApps, appId]);
    }
  }
  console.log(`✅ Created ${applications.length} demo applications`);

  // ============ CREATE EVALUATIONS ============
  console.log('📊 Creating evaluations for reviewed applications...');
  const evaluationStatuses = ['under-review', 'manager-review', 'program-manager-review', 'approved-pending-lease', 'lease-review', 'pending-payment', 'payment-complete', 'approved', 'disbursed', 'rejected'];
  let evaluationCount = 0;
  
  for (const appId of applicationIds) {
    const app: any = await kv.get(appId);
    
    if (evaluationStatuses.includes(app.status)) {
      // Create Analyst Evaluation
      const analystScore = app.status === 'rejected' ? Math.floor(Math.random() * 30) + 30 : Math.floor(Math.random() * 25) + 75;
      const analystCriteriaEvaluations: Record<string, boolean> = {};
      
      criteriaIds.forEach(critId => {
        analystCriteriaEvaluations[critId] = analystScore >= 70 ? Math.random() > 0.15 : Math.random() > 0.6;
      });

      await kv.set(`evaluation:analyst:${appId}`, {
        id: `evaluation:analyst:${appId}`,
        applicationId: appId,
        evaluatorId: analystId || 'demo-analyst',
        evaluatorRole: 'analyst',
        criteriaEvaluations: analystCriteriaEvaluations,
        score: analystScore,
        notes: analystScore >= 70 ? 'Application meets all requirements. Approved for processing.' : 'Some criteria not met. Additional documentation required.',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      evaluationCount++;

      // Create Manager Evaluation (for applications that reached Manager stage)
      if (['manager-review', 'program-manager-review', 'approved-pending-lease', 'lease-review', 'pending-payment', 'payment-complete', 'approved', 'disbursed'].includes(app.status)) {
        const qaScore = analystScore + (Math.random() > 0.5 ? Math.floor(Math.random() * 5) : -Math.floor(Math.random() * 5));
        const qaCriteriaEvaluations: Record<string, boolean> = {};
        
        criteriaIds.forEach(critId => {
          // QA mostly agrees with analyst, but may differ on 1-2 criteria
          qaCriteriaEvaluations[critId] = Math.random() > 0.1 ? analystCriteriaEvaluations[critId] : !analystCriteriaEvaluations[critId];
        });

        await kv.set(`evaluation:qa:${appId}`, {
          id: `evaluation:qa:${appId}`,
          applicationId: appId,
          evaluatorId: managerId || 'demo-manager',
          evaluatorRole: 'manager',
          criteriaEvaluations: qaCriteriaEvaluations,
          score: qaScore,
          notes: qaScore >= 75 ? 'QA review passed. Application quality verified.' : 'QA review identified some discrepancies. Reviewed carefully.',
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        evaluationCount++;
      }
    }
  }
  console.log(`✅ Created ${evaluationCount} evaluations (both analyst and QA)`);

  // ============ CREATE DISBURSEMENTS ============
  console.log('💰 Creating disbursements for approved applications...');
  let disbursementCount = 0;
  
  for (const appId of applicationIds) {
    const app: any = await kv.get(appId);
    
    if (app.status === 'disbursed' || app.status === 'approved') {
      const bankDetails: any = await kv.get(`bank:${app.organizationId}`);
      
      await kv.set(`disbursement:${appId}`, {
        id: `disbursement:${appId}`,
        applicationId: appId,
        amount: app.rebateAmount,
        referenceNumber: `RBT-${new Date().getFullYear()}-${String(disbursementCount + 1).padStart(5, '0')}`,
        bankName: bankDetails?.bankName || 'Bank of Kigali',
        accountNumber: bankDetails?.accountNumber || '1234567890',
        accountName: bankDetails?.accountName || app.companyName,
        status: app.status === 'disbursed' ? 'completed' : 'pending',
        processedBy: createdUsers.find(u => u.email === 'finance1@mfa.rw')?.id || 'demo-finance',
        approvedBy: createdUsers.find(u => u.email === 'program.manager@mfa.rw')?.id || 'demo-manager',
        processedAt: app.status === 'disbursed' ? new Date().toISOString() : null,
        createdAt: new Date().toISOString()
      });
      disbursementCount++;
    }
  }
  console.log(`✅ Created ${disbursementCount} disbursement records`);

  // ============ SUMMARY ============
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('🎉 DATA SEEDING COMPLETE!');
  console.log('══════════════════════════════════════════');
  console.log(`✅ Permissions: ${permissionsToSeed.length}`);
  console.log(`✅ Roles: ${rolesToSeed.length}`);
  console.log(`✅ Users: ${createdUsers.length}`);
  console.log(`✅ Organizations: ${organizationIds.size}`);
  console.log(`�� Bank Details: ${bankDetailsCount}`);
  console.log(`✅ Staff Members: ${staffUsersCreated.length}`);
  console.log(`✅ Eligibility Criteria: ${criteria.length}`);
  console.log(`✅ Applications: ${applications.length}`);
  console.log(`✅ Evaluations: ${evaluationCount}`);
  console.log(`✅ Disbursements: ${disbursementCount}`);
  console.log('═══════════════════════════════════════════');
  
  return {
    success: true,
    message: 'Demo data seeded successfully',
    stats: {
      permissions: permissionsToSeed.length,
      roles: rolesToSeed.length,
      users: createdUsers.length,
      organizations: organizationIds.size,
      bankDetails: bankDetailsCount,
      staff: staffUsersCreated.length,
      criteria: criteria.length,
      applications: applications.length,
      evaluations: evaluationCount,
      disbursements: disbursementCount
    }
  };
  
  } catch (error: any) {
    console.error('❌ FATAL ERROR IN SEED DATA:');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error:', error);
    throw error; // Re-throw to be caught by the route handler
  }
}