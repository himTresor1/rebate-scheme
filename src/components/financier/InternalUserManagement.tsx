import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { User, Plus, Edit, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface InternalUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  permissions: {
    applicationEntry: boolean;
    feedbackResolution: boolean;
    financialSetup: boolean;
    loanServicing: boolean;
  };
}

export function InternalUserManagement({ organizationId }: { organizationId: string }) {
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<InternalUser | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#023F40]">Internal User Management</h2>
          <p className="text-gray-600 mt-1">
            Manage Rebate Team accounts and operational permissions
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-[#023F40] hover:bg-[#035f60]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Rebate Team Member
        </Button>
      </div>

      {/* Placeholder - Full implementation would follow user story #7 requirements */}
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-medium text-gray-900 mb-2">Internal User Management</h3>
        <p className="text-gray-600">
          This feature allows you to create Rebate Team accounts with granular permissions for:
        </p>
        <ul className="mt-4 text-sm text-gray-600 space-y-1 max-w-md mx-auto">
          <li>✓ Application Entry</li>
          <li>✓ Feedback Resolution</li>
          <li>✓ Financial Setup</li>
          <li>✓ Loan Servicing</li>
        </ul>
        <p className="mt-4 text-sm text-gray-500">
          Full implementation available per user story requirements
        </p>
      </div>
    </div>
  );
}
