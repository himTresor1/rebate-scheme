import { useState } from 'react';
import { User } from '../utils/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { UserCircle, Mail, Phone, Lock, Save, Camera, Bell, ScrollText } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSettingsProps {
  user: User;
  onUpdate: (updates: Partial<User>) => Promise<void>;
}

const NOTIFICATION_EVENTS = [
  { id: 'submitted', label: 'Application Submitted' },
  { id: 'approved', label: 'RGF Application Approved' },
  { id: 'rejected', label: 'Application Rejected' },
  { id: 'possession', label: 'Possession Confirmation Required' },
  { id: 'deadline', label: 'Deadline Reminders' },
];

const MOCK_ACTIVITY = [
  { action: 'Logged in', date: '01-05-2026', time: '08:04', ip: '41.186.12.4' },
  { action: 'Updated notification settings', date: '03-05-2026', time: '10:12', ip: '42.186.12.4' },
  { action: 'Reviewed Application REB-002', date: '03-05-2026', time: '11:03', ip: '42.186.12.4' },
];

export function ProfileSettings({ user, onUpdate }: ProfileSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: (user as any).phone || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [silentSms, setSilentSms] = useState(false);
  const [marketingLinks, setMarketingLinks] = useState({
    website: '',
    appLink: '',
    whatsapp: '',
  });
  const [notifyPrefs, setNotifyPrefs] = useState({
    email: true,
    sms: true,
    inApp: true,
    events: Object.fromEntries(NOTIFICATION_EVENTS.map((e) => [e.id, true])) as Record<string, boolean>,
  });

  const isRgfStaff = !['ASSET_FINANCIER_ADMIN', 'applicant', 'CLAIMS_OFFICER'].includes(user.role);
  const isAssetFinancierRole = ['ASSET_FINANCIER_ADMIN', 'applicant', 'CLAIMS_OFFICER'].includes(user.role);

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

  const handleSaveNotificationPrefs = () => {
    toast.success('Notification preferences saved', {
      description: silentSms ? 'SMS notifications are in silent mode' : 'Changes take effect immediately',
    });
  };

  const handleSaveMarketingLinks = () => {
    toast.success('Marketing outreach links saved');
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
      case 'REBATE_MANAGER': return 'Rebate Manager';
      case 'E_MOTO_PROGRAM_MANAGER': return 'E-Moto Program Manager (QA)';
      case 'DESIGNATED_FINANCE_OFFICER': return 'Finance Officer';
      case 'ME_TEAM': return 'M&E Team';
      case 'EXTERNAL_REVIEWER': return 'External Reviewer';
      default: return 'User';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-6">
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

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#023F40] mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+250 XXX XXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input type="text" value={getRoleTitle()} disabled className="bg-gray-50" />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button onClick={handleProfileUpdate} disabled={loading} className="bg-[#023F40] hover:bg-[#035f60] gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>

          {isAssetFinancierRole && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#023F40] mb-4">Rebate App Marketing Links</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configure links used in your outreach channels (website, app, WhatsApp).
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="website-link">Website Link</Label>
                  <Input
                    id="website-link"
                    value={marketingLinks.website}
                    onChange={(e) => setMarketingLinks({ ...marketingLinks, website: e.target.value })}
                    placeholder="https://your-af-site.rw/rebate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-link">Mobile App Link</Label>
                  <Input
                    id="app-link"
                    value={marketingLinks.appLink}
                    onChange={(e) => setMarketingLinks({ ...marketingLinks, appLink: e.target.value })}
                    placeholder="https://play.google.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-link">WhatsApp Channel/Contact</Label>
                  <Input
                    id="whatsapp-link"
                    value={marketingLinks.whatsapp}
                    onChange={(e) => setMarketingLinks({ ...marketingLinks, whatsapp: e.target.value })}
                    placeholder="https://wa.me/2507xxxxxxx"
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <Button onClick={handleSaveMarketingLinks} className="bg-[#023F40] hover:bg-[#035f60]">
                    Save Outreach Links
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#023F40] mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </h3>

            {isRgfStaff && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
                <div>
                  <p className="font-medium text-gray-900">Silent SMS Mode</p>
                  <p className="text-sm text-gray-600">Suppress SMS alerts while keeping email and in-app notifications</p>
                </div>
                <Switch checked={silentSms} onCheckedChange={setSilentSms} />
              </div>
            )}

            <div className="space-y-4 mb-6">
              <p className="text-sm font-medium text-gray-700">Channels</p>
              {[
                { key: 'email', label: 'Email' },
                { key: 'sms', label: 'SMS' },
                { key: 'inApp', label: 'In-App' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{label}</span>
                  <Switch
                    checked={notifyPrefs[key as keyof typeof notifyPrefs] as boolean}
                    onCheckedChange={(checked) => setNotifyPrefs({ ...notifyPrefs, [key]: checked })}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Event Types</p>
              {NOTIFICATION_EVENTS.map((event) => (
                <div key={event.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{event.label}</span>
                  <Switch
                    checked={notifyPrefs.events[event.id]}
                    onCheckedChange={(checked) =>
                      setNotifyPrefs({
                        ...notifyPrefs,
                        events: { ...notifyPrefs.events, [event.id]: checked },
                      })
                    }
                  />
                </div>
              ))}
            </div>

            <div className="pt-6 flex justify-end">
              <Button onClick={handleSaveNotificationPrefs} className="bg-[#023F40] hover:bg-[#035f60]">
                Save Preferences
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#023F40] mb-4">Change Password</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password *</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button onClick={handlePasswordChange} disabled={loading} className="bg-[#023F40] hover:bg-[#035f60] gap-2">
                  <Lock className="w-4 h-4" />
                  Update Password
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6 mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#023F40] mb-4 flex items-center gap-2">
              <ScrollText className="w-5 h-5" />
              Audit & Activity Log
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="pb-3 pr-4">Action</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Time</th>
                    <th className="pb-3">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_ACTIVITY.map((entry, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3 pr-4">{entry.action}</td>
                      <td className="py-3 pr-4">{entry.date}</td>
                      <td className="py-3 pr-4">{entry.time}</td>
                      <td className="py-3">{entry.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
