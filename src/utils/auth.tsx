import { createClient } from './supabase/client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'applicant' | 'admin' | 'analyst' | 'qa' | 'cfo' | 'finance' | 'management' | 
        'SYSTEM_ADMIN' | 'REBATE_ANALYST' | 'REBATE_MANAGER' | 'E_MOTO_PROGRAM_MANAGER' | 
        'DESIGNATED_FINANCE_OFFICER' | 'ME_TEAM' | 'EXTERNAL_REVIEWER' | 
        'CLAIMS_OFFICER' | 'ASSET_FINANCIER_ADMIN';
  permissions?: string[]; // User's effective permissions
  organizationId?: string; // For Asset Financier Admins and staff
  isActive?: boolean; // User account status
  createdAt?: string;
}

export const authService = {
  async signUp(email: string, password: string, name: string, role: string) {
    const response = await fetch(
      `https://${await import('./supabase/info').then(m => m.projectId)}.supabase.co/functions/v1/make-server-324f6e20/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await import('./supabase/info').then(m => m.publicAnonKey)}`
        },
        body: JSON.stringify({ email, password, name, role })
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }
    
    return data;
  },

  async signIn(email: string, password: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  },

  async signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const supabase = createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Handle invalid refresh token error
    if (sessionError) {
      console.error('Session error:', sessionError);
      // Clear invalid session
      await supabase.auth.signOut();
      return null;
    }
    
    if (!session) {
      return null;
    }
    
    const response = await fetch(
      `https://${await import('./supabase/info').then(m => m.projectId)}.supabase.co/functions/v1/make-server-324f6e20/me`,
      {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      }
    );
    
    if (!response.ok) {
      // If unauthorized, clear the session
      if (response.status === 401) {
        await supabase.auth.signOut();
      }
      return null;
    }
    
    return await response.json();
  },

  async getAccessToken(): Promise<string | null> {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // Handle invalid refresh token error
    if (error) {
      console.error('Token error:', error);
      await supabase.auth.signOut();
      return null;
    }
    
    return session?.access_token || null;
  },

  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const token = await this.getAccessToken();
      if (!token) return [];

      const response = await fetch(
        `https://${await import('./supabase/info').then(m => m.projectId)}.supabase.co/functions/v1/make-server-324f6e20/users/${userId}/effective-permissions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        console.error('Failed to load permissions');
        return [];
      }

      const data = await response.json();
      return data.effectivePermissions || [];
    } catch (error) {
      console.error('Error loading permissions:', error);
      return [];
    }
  }
};