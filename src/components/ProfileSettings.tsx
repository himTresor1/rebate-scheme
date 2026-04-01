import { useState } from 'react';
import { User } from '../utils/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { UserCircle, Mail, Phone, Lock, Save, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSettingsProps {
  user: User;
  onUpdate: (updates: Partial<User>) => Promise<void>;
}

export function ProfileSettings({ user, onUpdate }: ProfileSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      await onUpdate(profileData);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      // Call password change endpoint
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getRoleTitle = () => {
    switch (user.role) {
      case 'admin': return 'Administrator';
      case 'SYSTEM_ADMIN': return 'System Administrator';
      case 'applicant': return 'E-Moto Company';
      case 'ASSET_FINANCIER_ADMIN': return 'Asset Financier';
      case 'CLAIMS_OFFICER': return 'Claims Officer';
      case 'analyst': return 'Rebate Analyst';
      case 'REBATE_ANALYST': return 'Rebate Analyst';
      case 'qa': return 'QA Team';
      case 'QA_TEAM': return 'QA Team';
      case 'cfo': return 'Chief Financial Officer';
      case 'REBATE_MANAGER': return 'Rebate Manager';
      case 'finance': return 'Finance Officer';
      case 'FINANCE_OFFICER': return 'Finance Officer';
      case 'management': return 'Management';
      case 'M_E_OFFICER': return 'M&E Officer';
      default: return 'User';
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#023F40] mb-4">Profile Picture</h3>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-[#023F40]/10 rounded-full flex items-center justify-center">
            <UserCircle className="w-16 h-16 text-[#023F40]" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-3">Upload a profile picture to personalize your account</p>
            <Button variant="outline" className="gap-2" disabled>
              <Camera className="w-4 h-4" />
              Upload Photo
            </Button>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#023F40] mb-4">Personal Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="pl-10"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="pl-10"
                  placeholder="+250 XXX XXX XXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                type="text"
                value={getRoleTitle()}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              onClick={handleProfileUpdate}
              disabled={loading || !profileData.name || !profileData.email}
              className="bg-[#023F40] hover:bg-[#035f60] gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#023F40] mb-4">Change Password</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="pl-10"
                placeholder="Enter current password"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="pl-10"
                  placeholder="Enter new password"
                />
              </div>
              <p className="text-xs text-gray-500">Minimum 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="pl-10"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              onClick={handlePasswordChange}
              disabled={
                loading ||
                !passwordData.currentPassword ||
                !passwordData.newPassword ||
                !passwordData.confirmPassword
              }
              className="bg-[#023F40] hover:bg-[#035f60] gap-2"
            >
              <Lock className="w-4 h-4" />
              Update Password
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#023F40] mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">User ID</p>
            <p className="font-medium text-gray-900">{user.id}</p>
          </div>
          <div>
            <p className="text-gray-500">Account Type</p>
            <p className="font-medium text-gray-900">{getRoleTitle()}</p>
          </div>
          {user.organizationId && (
            <div>
              <p className="text-gray-500">Organization ID</p>
              <p className="font-medium text-gray-900">{user.organizationId}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}