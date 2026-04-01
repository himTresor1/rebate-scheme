import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SeedDataButton } from './SeedDataButton';
import { AssetFinancierRegistration } from './auth/AssetFinancierRegistration';
import { authService, User } from '../utils/auth';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Shield, ArrowLeft, Palette } from 'lucide-react';

interface AuthFormProps {
  onSuccess: () => void;
  onLoginSuccess?: (user: User) => void;
}

export function AuthForm({ onSuccess, onLoginSuccess }: AuthFormProps) {
  const [showFinancierReg, setShowFinancierReg] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.signIn(formData.email, formData.password);
      
      // If onLoginSuccess is provided, get user data and pass it
      if (onLoginSuccess) {
        const user = await authService.getCurrentUser();
        if (user) {
          onLoginSuccess(user);
          return; // Don't call onSuccess, let AuthWrapper handle it
        }
      }
      
      toast.success('Signed in successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Enhanced error messaging
      if (error.message?.includes('Invalid login credentials')) {
        toast.error(
          <div className="space-y-2">
            <p className="font-semibold">Login Failed: Invalid Credentials</p>
            <p className="text-xs">If you haven't seeded the database yet, click the <strong>"🎯 Seed Demo Data"</strong> button below, then try:</p>
            <ul className="text-xs list-disc ml-4 space-y-1">
              <li>admin@mfa.rw / SecureAdmin@2026</li>
              <li>analyst1@mfa.rw / SecureAnalyst@2026</li>
              <li>manager1@mfa.rw / SecureManager@2026</li>
            </ul>
          </div>,
          { duration: 10000 }
        );
      } else {
        toast.error(error.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showFinancierReg) {
    return (
      <AssetFinancierRegistration
        onSuccess={() => {
          setShowFinancierReg(false);
          toast.success('Registration submitted! You can now sign in once approved.');
        }}
        onBackToLogin={() => setShowFinancierReg(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center bg-white">
      {/* Left Side - Immersive Image Box */}
      <div className="hidden lg:flex lg:w-1/2 p-5 items-center">
        <div className="w-full h-[calc(100vh-40px)] relative bg-gradient-to-br from-[#023F40] to-[#035f60] rounded-2xl overflow-hidden shadow-2xl">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1653463207246-1dc03899dfe0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMG1vdG9yY3ljbGUlMjByaWRlciUyMHVyYmFufGVufDF8fHx8MTc2NTg5MDkyM3ww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Electric Motorcycle Rider"
            className="w-full h-full object-cover opacity-80"
          />
          
          {/* Overlay Content */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#023F40]/90 via-[#023F40]/40 to-transparent flex items-end p-12">
            <div className="text-white">
              <h3 className="text-3xl mb-3">Accelerating E-Moto Deployment</h3>
              <p className="text-white/90 text-lg">
                The RGF on-line rebate management system to enhance e-moto affordability and waste disposal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Authentication Form (No Box) */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12">
        <div className="max-w-md w-full">
          {/* Logo & Branding */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#023F40] to-[#035f60] rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-[#023F40] text-2xl">RGF Rebate System</h1>
                <p className="text-xs text-gray-500">E-Moto Rebate Management</p>
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-[#023F40] mb-1">Welcome Back</h2>
            <p className="text-gray-600">
              Enter your credentials to access the system
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-xs text-[#023F40] hover:underline"
                  onClick={() => {
                    toast.info('Please contact your system administrator to reset your password.');
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-11"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 bg-[#023F40] hover:bg-[#035f60]" 
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Sign In'}
            </Button>
            
            {/* REMOVED: Public Asset Financier Registration - Now invitation-only via System Admin */}
          </form>
        </div>
      </div>
      
      <SeedDataButton />
    </div>
  );
}