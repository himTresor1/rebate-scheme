import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Mail, Copy, Trash2, UserPlus, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { TableSkeleton } from '../ui/skeletons';

interface Invitation {
  id: string;
  email: string;
  organizationType: 'BANK' | 'MFI' | 'E_MOTO';
  organizationName: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

export function InvitationManager() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    organizationName: '',
    organizationType: 'BANK' as 'BANK' | 'MFI' | 'E_MOTO'
  });

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const data = await api.getInvitations();
      setInvitations(data || []);
    } catch (error: any) {
      console.error('Error loading invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!formData.email || !formData.organizationName) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const invitation = await api.sendInvitation(formData);
      setInvitations([invitation, ...invitations]);
      
      // Copy invitation link to clipboard
      const inviteUrl = `${window.location.origin}/invite/${invitation.token}`;
      await navigator.clipboard.writeText(inviteUrl);
      
      toast.success('Invitation sent! Link copied to clipboard.');
      setShowInviteDialog(false);
      setFormData({
        email: '',
        organizationName: '',
        organizationType: 'BANK'
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    }
  };

  const handleCopyLink = async (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('Invitation link copied!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleDeleteInvitation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invitation?')) {
      return;
    }

    try {
      await api.deleteInvitation(id.replace('invitation:', ''));
      setInvitations(invitations.filter(inv => inv.id !== id));
      toast.success('Invitation deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete invitation');
    }
  };

  const handleResendInvitation = async (invitation: Invitation) => {
    try {
      const newInvitation = await api.resendInvitation(invitation.id.replace('invitation:', ''));
      setInvitations(invitations.map(inv => inv.id === invitation.id ? newInvitation : inv));
      
      // Copy new link
      const inviteUrl = `${window.location.origin}/invite/${newInvitation.token}`;
      await navigator.clipboard.writeText(inviteUrl);
      
      toast.success('Invitation resent! New link copied to clipboard.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend invitation');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Financier Invitations</CardTitle>
          <CardDescription>
            Invite banks, MFIs, and E-Moto companies to join the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={5} columns={5} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Asset Financier Invitations</CardTitle>
              <CardDescription>
                Invite banks, MFIs, and E-Moto companies to join the system
              </CardDescription>
            </div>
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#023F40] hover:bg-[#035f60]">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Send Invitation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Asset Financier</DialogTitle>
                  <DialogDescription>
                    Send an invitation to a bank, MFI, or E-Moto company to register
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@organization.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organization Name *</Label>
                    <Input
                      id="organizationName"
                      placeholder="e.g., Bank of Kigali"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizationType">Organization Type *</Label>
                    <Select
                      value={formData.organizationType}
                      onValueChange={(value) => setFormData({ ...formData, organizationType: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BANK">Commercial Bank</SelectItem>
                        <SelectItem value="MFI">Microfinance Institution (MFI)</SelectItem>
                        <SelectItem value="E_MOTO">E-Moto Company</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendInvitation} className="bg-[#023F40] hover:bg-[#035f60]">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No invitations sent yet</p>
              <p className="text-sm text-gray-400 mb-4">
                Send your first invitation to onboard an asset financier
              </p>
              <Button onClick={() => setShowInviteDialog(true)} variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Send First Invitation
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Organization</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Email</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Type</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Invited</th>
                    <th className="text-right p-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((invitation) => (
                    <tr key={invitation.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium text-gray-900">{invitation.organizationName}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-gray-600">{invitation.email}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {invitation.organizationType === 'E_MOTO' ? 'E-Moto' : invitation.organizationType}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invitation.status)}
                          {getStatusBadge(invitation.status)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-gray-600">
                          {new Date(invitation.invitedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          {invitation.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopyLink(invitation.token)}
                                title="Copy invitation link"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleResendInvitation(invitation)}
                                title="Resend invitation"
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteInvitation(invitation.id)}
                            title="Delete invitation"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
