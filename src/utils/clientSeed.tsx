import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './supabase/info';

/**
 * Client-side fallback seed function
 * Used when the server-side edge function is not available
 */
export async function clientSeedData() {
  // Create Supabase client with anon key (limited permissions)
  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  console.log('⚠️ Using client-side seed (limited functionality)');
  console.log('📌 Note: Some operations may fail due to RLS policies');

  const stats = {
    users: 0,
    organizations: 0,
    applications: 0,
    criteria: 0
  };

  // Demo users to create
  const demoUsers = [
    { email: 'admin@mfa.rw', password: 'SecureAdmin@2026', name: 'System Administrator', role: 'SYSTEM_ADMIN', phone: '+250788123456' },
    { email: 'analyst1@mfa.rw', password: 'SecureAnalyst@2026', name: 'Alice Mugisha', role: 'REBATE_ANALYST', phone: '+250788234567' },
    { email: 'analyst2@mfa.rw', password: 'SecureAnalyst@2026', name: 'Brian Nkusi', role: 'REBATE_ANALYST', phone: '+250788345678' },
    { email: 'manager1@mfa.rw', password: 'SecureManager@2026', name: 'Catherine Uwera', role: 'REBATE_MANAGER', phone: '+250788456789' },
    { email: 'manager2@mfa.rw', password: 'SecureManager@2026', name: 'David Habimana', role: 'REBATE_MANAGER', phone: '+250788567890' },
    { email: 'finance1@mfa.rw', password: 'SecureFinance@2026', name: 'Finance Officer 1', role: 'DESIGNATED_FINANCE_OFFICER', phone: '+250788678902' },
    { email: 'finance2@mfa.rw', password: 'SecureFinance@2026', name: 'Finance Officer 2', role: 'DESIGNATED_FINANCE_OFFICER', phone: '+250788678903' },
    { email: 'admin@bankofkigali.rw', password: 'SecureBoK@2026', name: 'Grace Mukandori', role: 'ASSET_FINANCIER_ADMIN', phone: '+250788890123', organization: 'Bank of Kigali' },
    { email: 'admin@equitybank.rw', password: 'SecureEquity@2026', name: 'Henry Ntirenganya', role: 'ASSET_FINANCIER_ADMIN', phone: '+250788901234', organization: 'Equity Bank Rwanda' },
    { email: 'admin@visionfinance.rw', password: 'SecureVision@2026', name: 'Irene Uwimana', role: 'ASSET_FINANCIER_ADMIN', phone: '+250788012345', organization: 'Vision Finance Company' },
  ];

  console.log('⚠️ CLIENT-SIDE SEED LIMITATION:');
  console.log('   This fallback can only show you the credentials.');
  console.log('   The edge function MUST be deployed for full seeding.');
  console.log('');
  console.log('📝 Expected Demo Credentials:');
  demoUsers.forEach(user => {
    console.log(`   ${user.email} / ${user.password} (${user.role})`);
  });
  console.log('');

  return {
    success: false,
    error: 'Edge function not deployed - using client-side fallback',
    message: 'The Supabase Edge Function must be deployed for full database seeding.\n\n' +
             'However, here are the credentials that WOULD be created:\n\n' +
             demoUsers.map(u => `${u.email} / ${u.password}`).join('\n'),
    credentials: demoUsers,
    stats: {
      users: demoUsers.length,
      organizations: 4,
      applications: 18,
      criteria: 12
    },
    requiresDeployment: true
  };
}