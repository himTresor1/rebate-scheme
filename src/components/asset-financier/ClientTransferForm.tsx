import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

export function ClientTransferForm() {
  const [originalTicket, setOriginalTicket] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    isWoman: '',
    phone: '',
  });

  const handleSubmit = () => {
    if (!originalTicket.trim() || !form.firstName || !form.lastName || !form.nationalId || !form.isWoman) {
      toast.error('Ticket number and all mandatory new-client fields are required');
      return;
    }
    toast.success('Client transfer notification submitted to RGF', {
      description: `Ticket ${originalTicket} reassignment queued for RGF verification.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">Notification of Change in Client</h2>
        <p className="text-sm text-gray-600 mt-1">
          Notify RGF when an approved rebate is transferred to a new client. Original ticket remains active; no new disbursement.
        </p>
      </div>

      <div className="bg-white border rounded-lg p-6 space-y-4">
        <Input placeholder="Original ticket number being transferred *" value={originalTicket} onChange={(e) => setOriginalTicket(e.target.value)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="New client first name(s) *" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <Input placeholder="New client last name(s) *" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <Input placeholder="National ID *" value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} />
          <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Select value={form.isWoman} onValueChange={(v) => setForm({ ...form, isWoman: v })}>
            <SelectTrigger><SelectValue placeholder="Woman? *" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-amber-700">Upload fields for new client documents follow the same mandatory set as initial submission (demo UI).</p>
        <Button className="bg-[#023F40] hover:bg-[#035f60]" onClick={handleSubmit}>Submit transfer to RGF</Button>
      </div>
    </div>
  );
}
