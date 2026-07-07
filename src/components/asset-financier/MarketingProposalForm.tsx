import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { calculateRebateAmount, generateTicketPreview } from '../../utils/rebateCalculation';

interface MarketingProposalFormProps {
  organizationName?: string;
}

export function MarketingProposalForm({ organizationName = 'your AF' }: MarketingProposalFormProps) {
  const [ticketNumber] = useState(() => generateTicketPreview());
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    isWoman: '',
    isRetrofit: 'no',
    retailCost: '',
    phone: '',
  });

  const rebatePreview = calculateRebateAmount(Number(form.retailCost) || 0, {
    isWoman: form.isWoman === 'yes',
    isRetrofit: form.isRetrofit === 'yes',
  });

  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.nationalId || !form.isWoman || !form.retailCost) {
      toast.error('Please complete all mandatory fields before submitting to AF');
      return;
    }
    toast.success(`Proposal sent to ${organizationName} decision-makers`, {
      description: `Ticket ${ticketNumber} queued for internal AF review (not sent to RGF).`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">Marketing / Agent Rebate Proposal</h2>
        <p className="text-sm text-gray-600 mt-1">
          Submit rebate proposal information to {organizationName} finance decision-makers. This does not submit to RGF.
        </p>
        <p className="text-xs text-amber-700 mt-2">Ticket preview: {ticketNumber}</p>
      </div>

      <div className="bg-white rounded-lg border p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input placeholder="First name(s) *" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        <Input placeholder="Last name(s) *" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        <Input placeholder="National ID *" value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} />
        <Input placeholder="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Select value={form.isWoman} onValueChange={(v) => setForm({ ...form, isWoman: v })}>
          <SelectTrigger><SelectValue placeholder="Woman? *" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
        <Select value={form.isRetrofit} onValueChange={(v) => setForm({ ...form, isRetrofit: v })}>
          <SelectTrigger><SelectValue placeholder="Retrofit?" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="no">No — New E-Moto</SelectItem>
            <SelectItem value="yes">Yes — Retrofit</SelectItem>
          </SelectContent>
        </Select>
        <Input type="number" placeholder="Retail cost (RWF) *" value={form.retailCost} onChange={(e) => setForm({ ...form, retailCost: e.target.value })} />
        <Input readOnly className="bg-gray-50 font-semibold" value={rebatePreview > 0 ? `RWF ${rebatePreview.toLocaleString()}` : ''} placeholder="Rebate amount (auto)" />
      </div>

      <Button className="bg-[#023F40] hover:bg-[#035f60]" onClick={handleSubmit}>
        Submit proposal to AF
      </Button>
    </div>
  );
}
