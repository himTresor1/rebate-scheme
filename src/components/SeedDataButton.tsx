import { useState } from 'react';
import { Button } from './ui/button';
import { Database, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';
import { clientSeedData } from '../utils/clientSeed';
import { buildFunctionsUrl } from '../utils/functionsBase';

export function SeedDataButton() {
  const [loading, setLoading] = useState(false);

  const handleSeedData = async () => {
    if (!confirm('⚠️ This will DELETE all existing data and create fresh demo data.\n\n✅ Creates:\n- 18 demo users (Analysts, Managers, Finance, Asset Financiers)\n- 46 applications at all workflow stages\n- 4 Asset Financier organizations\n- Complete workflow data with evaluations\n\n📝 Login Credentials After Seeding:\n• Admin: admin@mfa.rw / SecureAdmin@2026\n• Analyst: analyst1@mfa.rw / SecureAnalyst@2026\n• Manager: manager1@mfa.rw / SecureManager@2026\n• Financier: admin@bankofkigali.rw / SecureBoK@2026\n\nContinue?')) {
      return;
    }

    setLoading(true);
    
    try {
      // Step 1: Health check
      toast.info('🔍 Checking server connection...', { duration: 2000 });
      
      const healthUrl = buildFunctionsUrl('/health');
      console.log('Health check URL:', healthUrl);
      
      let serverAvailable = false;
      
      try {
        const healthResponse = await fetch(healthUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });

        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          serverAvailable = healthData.status === 'ok';
        }
      } catch (healthError) {
        console.log('Health check failed, will try client-side fallback:', healthError);
        serverAvailable = false;
      }

      if (!serverAvailable) {
        // Use client-side fallback
        toast.info('⚠️ Server unavailable, showing demo credentials...', { duration: 3000 });
        const fallbackData = await clientSeedData();
        
        if (fallbackData.requiresDeployment) {
          const credentialsList = fallbackData.credentials
            .slice(0, 5)
            .map((u: any) => `• ${u.email} / ${u.password}`)
            .join('\n');
          
          toast.warning(
            `⚠️ Edge Function Not Deployed\n\n` +
            `The database cannot be seeded without the server.\n\n` +
            `📝 Demo Credentials (that would be created):\n${credentialsList}\n\n` +
            `🔧 To enable full seeding:\n` +
            `1. Deploy 'server' edge function in Supabase\n` +
            `2. Path: supabase/functions/server/\n` +
            `3. Project: ${projectId}`,
            { duration: 20000 }
          );
          
          setLoading(false);
          return;
        }
      }

      // Step 2: Seed data (server-side)
      toast.info('🔄 Starting database seed... This takes 30-60 seconds.', { duration: 5000 });
      
      const seedUrl = buildFunctionsUrl('/seed-data');
      console.log('Seed URL:', seedUrl);
      
      const response = await fetch(seedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ mode: 'lite' })
      });

      console.log('Seed response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Seed API error:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Seed response data:', data);

      if (data.success) {
        toast.success(
          `🎉 Database seeded successfully!\n\n` +
          `✅ ${data.stats.users} users created\n` +
          `✅ ${data.stats.applications} applications created\n` +
          `✅ ${data.stats.organizations} organizations created\n` +
          `✅ ${data.stats.criteria} eligibility criteria\n\n` +
          `📝 LOGIN CREDENTIALS:\n` +
          `Admin: admin@mfa.rw / SecureAdmin@2026\n` +
          `Analyst: analyst1@mfa.rw / SecureAnalyst@2026\n` +
          `Manager: manager1@mfa.rw / SecureManager@2026\n` +
          `Program Manager: program.manager@mfa.rw / SecureProgram@2026\n` +
          `Financier: admin@bankofkigali.rw / SecureBoK@2026`,
          { duration: 15000 }
        );
      } else {
        throw new Error(data.error || 'Seed operation failed');
      }
    } catch (error: any) {
      console.error('Seed error:', error);
      
      // Determine error type and show appropriate message
      let errorMessage = error.message || 'Unknown error';
      let troubleshootingSteps = '';
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
        troubleshootingSteps = 
          `🔧 Network/CORS Error:\n` +
          `• The Supabase Edge Function may not be deployed\n` +
          `• Check Supabase dashboard → Edge Functions\n` +
          `• Ensure the 'server' function is deployed\n` +
          `• Project ID: ${projectId}`;
      } else if (errorMessage.includes('health check failed')) {
        troubleshootingSteps = 
          `🔧 Server Not Running:\n` +
          `• Deploy the edge function in Supabase dashboard\n` +
          `• Path: supabase/functions/server/index.tsx\n` +
          `• Function name: 'server'\n` +
          `• Project: ${projectId}`;
      } else {
        troubleshootingSteps = 
          `🔧 Troubleshooting:\n` +
          `• Check browser console (F12) for details\n` +
          `• Verify Supabase project is active\n` +
          `• Check network tab for API calls`;
      }
      
      toast.error(
        `❌ Failed to seed data\n\n${errorMessage}\n\n${troubleshootingSteps}`,
        { duration: 12000 }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="relative group">
        <Button
          onClick={handleSeedData}
          disabled={loading}
          size="lg"
          className="bg-[#023F40] hover:bg-[#035f60] text-white shadow-lg border-2 border-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Seeding Database...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Seed Demo Data
            </>
          )}
        </Button>
        
        {/* Tooltip */}
        {!loading && (
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block">
            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
              Click to create demo users & data
              <div className="text-gray-400 mt-1">First time? Start here! 👆</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}