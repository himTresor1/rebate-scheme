import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Building2, User, Mail, Phone, FileText, Upload, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface AssetFinancierRegistrationProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

export function AssetFinancierRegistration({ onSuccess, onBackToLogin }: AssetFinancierRegistrationProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    // Organization Details
    companyLegalName: '',
    companyAddress: '',
    companyRegistrationNumber: '',
    companyPhoneNumber: '',
    companyEmail: '',
    companyType: 'Commercial Bank',
    
    // Primary Contact Details
    contactFullName: '',
    contactPosition: '',
    contactEmail: '',
    contactPhone: ''
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo file must be less than 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setLogoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert logo to base64 if exists
      let logoBase64 = '';
      if (logoFile) {
        logoBase64 = await fileToBase64(logoFile);
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/financier/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            ...formData,
            companyLogo: logoBase64
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setStep('success');
      toast.success('Registration submitted successfully!');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to submit registration');
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-[#023F40]">Registration Submitted!</h2>
          <p className="text-gray-600">
            Thank you for registering with the RGF Rebate System. Your application has been submitted for review.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <p className="font-medium text-blue-900 mb-2">What's Next?</p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>RGF System Admin will review your application</li>
              <li>You'll receive an email notification about the status</li>
              <li>If approved, you'll receive login credentials</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Confirmation emails have been sent to:
            </p>
            <p className="font-medium text-gray-900">{formData.companyEmail}</p>
            <p className="font-medium text-gray-900">{formData.contactEmail}</p>
          </div>
          <Button
            onClick={onBackToLogin}
            className="w-full bg-[#023F40] hover:bg-[#035f60]"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

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
              <h3 className="text-3xl mb-3">Join Our Partner Network</h3>
              <p className="text-white/90 text-lg mb-6">
                Become part of the ecosystem transforming electric mobility through efficient rebate management.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">Streamlined Processing</p>
                    <p className="text-white/80 text-sm">Fast-track rebate applications with automated workflows</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">Real-time Tracking</p>
                    <p className="text-white/80 text-sm">Monitor all applications from submission to disbursement</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">Secure & Compliant</p>
                    <p className="text-white/80 text-sm">Enterprise-grade security with full audit trails</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form (No Box) */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-screen">
        <div className="max-w-lg mx-auto">
          {/* Back Button */}
          <button
            onClick={onBackToLogin}
            className="flex items-center gap-2 text-gray-600 hover:text-[#023F40] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Login</span>
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[#023F40] mb-2">Asset Financier Registration</h1>
            <p className="text-gray-600">
              Partner with the RGF Rebate System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Organization Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Building2 className="w-5 h-5 text-[#023F40]" />
                <h3 className="text-[#023F40]">Organization Details</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyLegalName">Company Legal Name *</Label>
                  <Input
                    id="companyLegalName"
                    required
                    value={formData.companyLegalName}
                    onChange={(e) => setFormData({ ...formData, companyLegalName: e.target.value })}
                    placeholder="ABC Commercial Bank Ltd."
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Company Address *</Label>
                  <Input
                    id="companyAddress"
                    required
                    value={formData.companyAddress}
                    onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                    placeholder="123 Main Street, City, Country"
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyRegistrationNumber">Registration Number *</Label>
                    <Input
                      id="companyRegistrationNumber"
                      required
                      value={formData.companyRegistrationNumber}
                      onChange={(e) => setFormData({ ...formData, companyRegistrationNumber: e.target.value })}
                      placeholder="REG-123456"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyType">Company Type *</Label>
                    <select
                      id="companyType"
                      required
                      value={formData.companyType}
                      onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                      className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#023F40]"
                    >
                      <option value="Commercial Bank">Commercial Bank</option>
                      <option value="Microfinance Institution">Microfinance Institution (MFI)</option>
                      <option value="E-Moto Company">E-Moto Company</option>
                      <option value="Other">Other Financial Institution</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyPhoneNumber">Company Phone *</Label>
                    <Input
                      id="companyPhoneNumber"
                      type="tel"
                      required
                      value={formData.companyPhoneNumber}
                      onChange={(e) => setFormData({ ...formData, companyPhoneNumber: e.target.value })}
                      placeholder="+1-555-0000"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Company Email *</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      required
                      value={formData.companyEmail}
                      onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                      placeholder="info@company.com"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyLogo">Company Logo (Optional)</Label>
                  <Input
                    id="companyLogo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="h-11"
                  />
                  {logoFile && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      {logoFile.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">Max 2MB, PNG, JPG, or SVG</p>
                </div>
              </div>
            </div>

            {/* Primary Contact Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <User className="w-5 h-5 text-[#023F40]" />
                <h3 className="text-[#023F40]">Primary Contact</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactFullName">Full Name *</Label>
                    <Input
                      id="contactFullName"
                      required
                      value={formData.contactFullName}
                      onChange={(e) => setFormData({ ...formData, contactFullName: e.target.value })}
                      placeholder="John Doe"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPosition">Position/Title *</Label>
                    <Input
                      id="contactPosition"
                      required
                      value={formData.contactPosition}
                      onChange={(e) => setFormData({ ...formData, contactPosition: e.target.value })}
                      placeholder="Head of Loans"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email Address *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="john.doe@company.com"
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500">This will be the admin's login email</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone Number *</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    required
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+1-555-0000"
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#023F40] hover:bg-[#035f60]"
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}