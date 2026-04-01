import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Mail, Smartphone, AlertCircle, Clock, RefreshCw, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface OTPVerificationProps {
  userId: string;
  method: 'sms' | 'email';
  destination: string;
  expiryMinutes: number;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
}

export function OTPVerification({
  userId,
  method,
  destination,
  expiryMinutes,
  onVerify,
  onResend,
  onBack
}: OTPVerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(expiryMinutes * 60);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Lockout timer
  useEffect(() => {
    if (!lockoutUntil) return;

    const interval = setInterval(() => {
      if (new Date() >= lockoutUntil) {
        setLockoutUntil(null);
        toast.info('Lockout period expired. Please restart login process.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (index === 5 && value && newCode.every(digit => digit !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (codeToVerify: string) => {
    setLoading(true);
    try {
      await onVerify(codeToVerify);
    } catch (error: any) {
      // Check if error includes lockout info
      if (error.lockoutUntil) {
        setLockoutUntil(new Date(error.lockoutUntil));
      }
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCount >= 3) {
      toast.error('Maximum resend attempts reached');
      return;
    }

    setLoading(true);
    try {
      await onResend();
      setResendCount(prev => prev + 1);
      setTimeRemaining(expiryMinutes * 60);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      toast.success('New code sent successfully');
    } catch (error) {
      toast.error('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLocked = lockoutUntil && new Date() < lockoutUntil;

  return (
    <div className="min-h-screen flex items-center bg-white">
      {/* Left Side - Immersive Image Box */}
      <div className="hidden lg:flex lg:w-1/2 p-5 items-center">
        <div className="w-full h-[calc(100vh-40px)] relative bg-gradient-to-br from-[#023F40] to-[#035f60] rounded-2xl overflow-hidden shadow-2xl">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1653463207246-1dc03899dfe0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMG1vdG9yY3ljbGUlMjByaWRlciUyMHVyYmFufGVufDF8fHx8MTc2NTg5MDkyM3ww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Electric Motorcycle"
            className="w-full h-full object-cover opacity-80"
          />
          
          {/* Overlay Content */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#023F40]/90 via-[#023F40]/40 to-transparent flex items-end p-12">
            <div className="text-white">
              <h3 className="text-3xl mb-3">Verification Required</h3>
              <p className="text-white/90 text-lg">
                Enter the security code sent to your {method === 'sms' ? 'phone' : 'email'} to complete authentication.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - OTP Verification (No Box) */}
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
                <p className="text-xs text-gray-500">Secure Authentication</p>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-[#023F40]/10 rounded-full flex items-center justify-center mb-4">
              {method === 'sms' ? (
                <Smartphone className="w-8 h-8 text-[#023F40]" />
              ) : (
                <Mail className="w-8 h-8 text-[#023F40]" />
              )}
            </div>
            <h2 className="text-[#023F40] mb-1">Enter Verification Code</h2>
            <p className="text-gray-600">
              We've sent a 6-digit code to:
            </p>
            <p className="font-medium text-gray-900 mt-1">{destination}</p>
          </div>

          {isLocked && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-900">Account Temporarily Locked</p>
                <p className="text-sm text-red-700 mt-1">
                  Too many failed attempts. Please wait 15 minutes and restart the login process.
                </p>
              </div>
            </div>
          )}

          {!isLocked && (
            <>
              {/* OTP Input */}
              <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={loading || timeRemaining === 0}
                    className="w-12 h-14 text-center text-xl font-semibold"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2 text-sm mb-6">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className={timeRemaining < 60 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                  Code expires in {formatTime(timeRemaining)}
                </span>
              </div>

              {timeRemaining === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center mb-6">
                  <p className="text-sm text-yellow-800">
                    Your code has expired. Please request a new one.
                  </p>
                </div>
              )}

              {/* Verifying Status - shown when code is complete */}
              {loading && (
                <div className="flex items-center justify-center gap-2 text-[#023F40] mb-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Verifying...</span>
                </div>
              )}

              {/* Resend */}
              <div className="text-center space-y-2 mb-4">
                <p className="text-sm text-gray-600">Didn't receive the code?</p>
                <Button
                  onClick={handleResend}
                  disabled={loading || resendCount >= 3}
                  variant="ghost"
                  className="text-[#023F40] hover:text-[#035f60]"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Code {resendCount > 0 && `(${resendCount}/3)`}
                </Button>
              </div>
            </>
          )}

          {/* Back Button */}
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full h-11"
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}