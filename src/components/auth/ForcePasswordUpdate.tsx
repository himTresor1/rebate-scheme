import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle, Check, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ForcePasswordUpdateProps {
  user: {
    id: string;
    email: string;
    name: string;
  };
  onUpdate: (data: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
  }) => Promise<void>;
  onLogout: () => void;
}

export function ForcePasswordUpdate({ user, onUpdate, onLogout }: ForcePasswordUpdateProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Password strength validation
  const passwordValidation = {
    minLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  };

  const isPasswordValid = Object.values(passwordValidation).every(v => v);
  const passwordsMatch = formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('Please meet all password requirements');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.phoneNumber) {
      toast.error('Phone number is required for two-factor authentication');
      return;
    }

    setLoading(true);
    try {
      await onUpdate({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber
      });
      toast.success('Credentials updated successfully! Please log in again with your new credentials.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-[#023F40]">Update Your Credentials</h2>
          <p className="mt-2 text-gray-600">
            For security reasons, you must update your temporary credentials before accessing the system.
          </p>
        </div>

        {/* Alert Banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-900">First-Time Login Required</p>
              <p className="text-sm text-yellow-800 mt-1">
                This is a mandatory step. You cannot access the system until you set up your permanent credentials and phone number for two-factor authentication.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
            />
            <p className="text-sm text-gray-500">This will be your new login email</p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+1-555-0000"
            />
            <p className="text-sm text-gray-500">Required for SMS two-factor authentication</p>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onFocus={() => setPasswordFocused(true)}
              placeholder="Enter new password"
            />

            {/* Password Requirements */}
            {(passwordFocused || formData.password) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <RequirementItem
                    met={passwordValidation.minLength}
                    label="At least 8 characters"
                  />
                  <RequirementItem
                    met={passwordValidation.hasUpperCase}
                    label="One uppercase letter"
                  />
                  <RequirementItem
                    met={passwordValidation.hasLowerCase}
                    label="One lowercase letter"
                  />
                  <RequirementItem
                    met={passwordValidation.hasNumber}
                    label="One number"
                  />
                  <RequirementItem
                    met={passwordValidation.hasSpecial}
                    label="One special character"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Re-enter new password"
            />
            {formData.confirmPassword && (
              <p className={`text-sm ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch}
              className="flex-1 bg-[#023F40] hover:bg-[#035f60]"
            >
              {loading ? 'Updating...' : 'Update Credentials'}
            </Button>
            <Button
              type="button"
              onClick={onLogout}
              variant="outline"
              disabled={loading}
            >
              Sign Out
            </Button>
          </div>
        </form>

        {/* Info */}
        <div className="text-center text-sm text-gray-500 border-t pt-4">
          <p>After updating, you'll be redirected to the login page to sign in with your new credentials.</p>
        </div>
      </div>
    </div>
  );
}

function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <X className="w-4 h-4 text-gray-400" />
      )}
      <span className={`text-sm ${met ? 'text-green-700' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  );
}
