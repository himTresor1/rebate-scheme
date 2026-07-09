import { useState } from 'react';
import { AuthForm } from '../AuthForm';
import { OTPMethodSelection } from './OTPMethodSelection';
import { OTPVerification } from './OTPVerification';
import { ForcePasswordUpdate } from './ForcePasswordUpdate';
import { AssetFinancierRegistration } from './AssetFinancierRegistration';
import { authService } from '../../utils/auth';
import { toast } from 'sonner';
import { publicAnonKey } from '../../utils/supabase/info';
import { Button } from '../ui/button';
import { Loader2, Database } from 'lucide-react';
import { buildFunctionsUrl } from '../../utils/functionsBase';

type AuthStep = 
  | 'login' 
  | 'otp-method' 
  | 'otp-verify' 
  | 'force-update' 
  | 'financier-register';

interface AuthWrapperProps {
  onSuccess: () => void;
}

export function AuthWrapper({ onSuccess }: AuthWrapperProps) {
  const [step, setStep] = useState<AuthStep>('login');
  const [authData, setAuthData] = useState<any>(null);
  const [otpMethod, setOtpMethod] = useState<'sms' | 'email' | null>(null);
  const [otpDestination, setOtpDestination] = useState('');
  const [otpExpiryMinutes, setOtpExpiryMinutes] = useState(10);

  const handleLoginSuccess = async (user: any) => {
    // Check if user needs to update password
    if (user.requiresPasswordChange) {
      setAuthData(user);
      setStep('force-update');
      return;
    }

    // Start OTP flow
    setAuthData(user);
    setStep('otp-method');
  };

  const handleOTPMethodSelect = async (method: 'sms' | 'email') => {
    setOtpMethod(method);
    
    try {
      const response = await fetch(
        buildFunctionsUrl('/auth/request-otp'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            userId: authData.id,
            method
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpDestination(data.destination);
      setOtpExpiryMinutes(data.expiryMinutes);
      setStep('otp-verify');
      toast.success(`Verification code sent to ${data.destination}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification code');
    }
  };

  const handleOTPVerify = async (code: string) => {
    const response = await fetch(
      buildFunctionsUrl('/auth/verify-otp'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          userId: authData.id,
          code
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw { message: data.error, lockoutUntil: data.lockoutUntil };
    }

    toast.success('Verification successful!');
    onSuccess();
  };

  const handleOTPResend = async () => {
    if (!otpMethod) return;
    await handleOTPMethodSelect(otpMethod);
  };

  const handlePasswordUpdate = async (updateData: any) => {
    try {
      // In a real implementation, this would call the backend to update credentials
      const response = await fetch(
        buildFunctionsUrl('/auth/update-credentials'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            userId: authData.id,
            ...updateData
          })
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update credentials');
      }

      // Sign out and return to login
      await authService.signOut();
      setStep('login');
      setAuthData(null);
    } catch (error: any) {
      throw error;
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    setStep('login');
    setAuthData(null);
    toast.info('Signed out');
  };

  const renderStep = () => {
    switch (step) {
      case 'login':
        return (
          <AuthForm 
            onSuccess={onSuccess} 
            onLoginSuccess={handleLoginSuccess}
          />
        );

      case 'otp-method':
        return (
          <OTPMethodSelection
            onSelectMethod={handleOTPMethodSelect}
            userEmail={authData.email}
            userPhone={authData.phoneNumber}
          />
        );

      case 'otp-verify':
        return otpMethod ? (
          <OTPVerification
            userId={authData.id}
            method={otpMethod}
            destination={otpDestination}
            expiryMinutes={otpExpiryMinutes}
            onVerify={handleOTPVerify}
            onResend={handleOTPResend}
            onBack={handleLogout}
          />
        ) : null;

      case 'force-update':
        return (
          <ForcePasswordUpdate
            user={authData}
            onUpdate={handlePasswordUpdate}
            onLogout={handleLogout}
          />
        );

      case 'financier-register':
        return (
          <AssetFinancierRegistration
            onSuccess={() => setStep('login')}
            onBackToLogin={() => setStep('login')}
          />
        );

      default:
        return null;
    }
  };

  return <>{renderStep()}</>;
}