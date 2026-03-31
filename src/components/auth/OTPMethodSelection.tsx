import { Mail, Smartphone, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface OTPMethodSelectionProps {
  onSelectMethod: (method: 'sms' | 'email') => void;
  userEmail: string;
  userPhone?: string;
}

export function OTPMethodSelection({ onSelectMethod, userEmail, userPhone }: OTPMethodSelectionProps) {
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
              <h3 className="text-3xl mb-3">Secure Access</h3>
              <p className="text-white/90 text-lg">
                Two-factor authentication ensures your account and sensitive rebate data remain protected at all times.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - MFA Method Selection (No Box) */}
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
            <h2 className="text-[#023F40] mb-1">Two-Factor Authentication</h2>
            <p className="text-gray-600">
              Choose how you'd like to receive your verification code
            </p>
          </div>

          {/* Method Selection */}
          <div className="space-y-4">
            {/* SMS Option */}
            <button
              onClick={() => onSelectMethod('sms')}
              className="w-full p-6 border-2 border-gray-300 rounded-lg hover:border-[#023F40] hover:bg-gray-50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#023F40]/10 rounded-lg group-hover:bg-[#023F40]/20 transition-colors">
                  <Smartphone className="w-6 h-6 text-[#023F40]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">SMS Text Message</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Receive a 6-digit code via SMS
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {userPhone || '+1-555-XXXX'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Valid for 10 minutes</p>
                </div>
              </div>
            </button>

            {/* Email Option */}
            <button
              onClick={() => onSelectMethod('email')}
              className="w-full p-6 border-2 border-gray-300 rounded-lg hover:border-[#023F40] hover:bg-gray-50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#023F40]/10 rounded-lg group-hover:bg-[#023F40]/20 transition-colors">
                  <Mail className="w-6 h-6 text-[#023F40]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Receive a 6-digit code and verification link
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {userEmail}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Valid for 15 minutes</p>
                </div>
              </div>
            </button>
          </div>

          <div className="text-center text-sm text-gray-500 mt-6">
            <p>Choose the method that's most convenient for you</p>
          </div>
        </div>
      </div>
    </div>
  );
}