import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileText, Filter, Bike, Clock, DollarSign, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

interface RebateRecord {
  ticketNumber: string;
  applicantName: string;
  submittedAt: string;
  vehicleType: 'New E-Moto' | 'Retrofit';
  isWoman: boolean;
  daysSinceSubmission: number;
  rebateAmount: number;
  possessionStatus: 'waiting-af-confirmation' | 'in-escrow' | 'disbursed';
}

const MOCK_RECORDS: RebateRecord[] = [
  { ticketNumber: 'REB-001', applicantName: 'Jean Claude Ndayisaba', submittedAt: '2026-04-26', vehicleType: 'New E-Moto', isWoman: false, daysSinceSubmission: 4, rebateAmount: 150000, possessionStatus: 'waiting-af-confirmation' },
  { ticketNumber: 'REB-002', applicantName: 'Grace UWASE', submittedAt: '2026-04-27', vehicleType: 'Retrofit', isWoman: true, daysSinceSubmission: 3, rebateAmount: 200000, possessionStatus: 'waiting-af-confirmation' },
  { ticketNumber: 'REB-004', applicantName: 'Jean HABIMANA', submittedAt: '2026-05-01', vehicleType: 'New E-Moto', isWoman: false, daysSinceSubmission: 1, rebateAmount: 150000, possessionStatus: 'in-escrow' },
  { ticketNumber: 'REB-005', applicantName: 'Marie Claire Uwimana', submittedAt: '2026-03-15', vehicleType: 'New E-Moto', isWoman: true, daysSinceSubmission: 45, rebateAmount: 187500, possessionStatus: 'disbursed' },
];

export function RebateStatusView({
  title = 'Rebate Status',
  description = 'Rebates you have submitted to RGF and their e-moto possession status (to authorize escrow disbursements).',
}: {
  title?: string;
  description?: string;
} = {}) {
  const [filterWoman, setFilterWoman] = useState<string>('all');
  const [filterRetrofit, setFilterRetrofit] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<RebateRecord[]>(MOCK_RECORDS);
  const [editTarget, setEditTarget] = useState<RebateRecord | null>(null);
  const [editBrand, setEditBrand] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editReason, setEditReason] = useState('');
  const [requestRefund, setRequestRefund] = useState(false);

  const filtered = records.filter((r) => {
    if (filterWoman === 'yes' && !r.isWoman) return false;
    if (filterWoman === 'no' && r.isWoman) return false;
    if (filterRetrofit === 'yes' && r.vehicleType !== 'Retrofit') return false;
    if (filterRetrofit === 'no' && r.vehicleType === 'Retrofit') return false;
    if (search && !r.applicantName.toLowerCase().includes(search.toLowerCase()) && !r.ticketNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const waitingCount = records.filter((r) => r.possessionStatus === 'waiting-af-confirmation').length;
  const escrowCount = records.filter((r) => r.possessionStatus === 'in-escrow').length;
  const disbursedCount = records.filter((r) => r.possessionStatus === 'disbursed').length;

  const openEditDialog = (record: RebateRecord) => {
    setEditTarget(record);
    setEditBrand('Ampersand');
    setEditAmount(String(record.rebateAmount));
    setEditReason('');
    setRequestRefund(false);
  };

  const saveLeaseAmendment = () => {
    if (!editTarget) return;
    if (!editReason.trim()) {
      toast.error('Please provide a reason for lease changes');
      return;
    }
    setRecords((prev) =>
      prev.map((r) =>
        r.ticketNumber === editTarget.ticketNumber
          ? {
              ...r,
              rebateAmount: Number(editAmount) || r.rebateAmount,
            }
          : r
      )
    );
    toast.success('Lease amendment submitted for RGF review', {
      description: requestRefund
        ? 'Refund request included with amendment rationale.'
        : 'Brand/amount change captured with rationale.',
    });
    setEditTarget(null);
  };

  const statusBadge = (status: RebateRecord['possessionStatus']) => {
    switch (status) {
      case 'waiting-af-confirmation':
        return <Badge className="bg-amber-100 text-amber-800">Waiting for possession confirmation</Badge>;
      case 'in-escrow':
        return <Badge className="bg-blue-100 text-blue-800">In escrow — no e-moto yet</Badge>;
      case 'disbursed':
        return <Badge className="bg-green-100 text-green-800">Disbursed</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">{title}</h2>
        <p className="text-gray-600 mt-1 text-sm">{description}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total submitted</p>
            <p className="text-2xl font-bold text-[#023F40]">{records.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Awaiting possession</p>
            <p className="text-2xl font-bold text-amber-600">{waitingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">In escrow</p>
            <p className="text-2xl font-bold text-blue-600">{escrowCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Disbursed</p>
            <p className="text-2xl font-bold text-green-600">{disbursedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="Search name or ticket..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={filterWoman} onValueChange={setFilterWoman}>
              <SelectTrigger><SelectValue placeholder="Women" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All applicants</SelectItem>
                <SelectItem value="yes">Women only</SelectItem>
                <SelectItem value="no">Non-women</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRetrofit} onValueChange={setFilterRetrofit}>
              <SelectTrigger><SelectValue placeholder="Retrofit" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="yes">Retrofit only</SelectItem>
                <SelectItem value="no">New e-moto only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-amber-800">
            Default report: RGF waiting for your confirmation of possession ({waitingCount})
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="pb-3 pr-4">Applicant</th>
                <th className="pb-3 pr-4">Ticket</th>
                <th className="pb-3 pr-4">Submitted</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Women</th>
                <th className="pb-3 pr-4">Days</th>
                <th className="pb-3 pr-4">Rebate (RWF)</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.ticketNumber} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium">{r.applicantName}</td>
                  <td className="py-3 pr-4 text-[#023F40]">{r.ticketNumber}</td>
                  <td className="py-3 pr-4">{r.submittedAt}</td>
                  <td className="py-3 pr-4">{r.vehicleType}</td>
                  <td className="py-3 pr-4">{r.isWoman ? 'Yes' : 'No'}</td>
                  <td className="py-3 pr-4">{r.daysSinceSubmission}</td>
                  <td className="py-3 pr-4">{r.rebateAmount.toLocaleString()}</td>
                  <td className="py-3">{statusBadge(r.possessionStatus)}</td>
                  <td className="py-3">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(r)}>
                      <Pencil className="w-3 h-3 mr-1" />
                      Amend
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
        <span className="flex items-center gap-1"><Bike className="w-4 h-4" /> E-motos provided: {disbursedCount}</span>
        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> No e-moto yet: {escrowCount + waitingCount}</span>
        <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> Total rebate to date: RWF {records.reduce((s, r) => s + r.rebateAmount, 0).toLocaleString()}</span>
      </div>

      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Amend Lease Data</DialogTitle>
            <DialogDescription>
              Update lease details if brand, rebate amount, or refund status has changed after submission.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="brand">E-Moto Brand</Label>
              <Select value={editBrand} onValueChange={setEditBrand}>
                <SelectTrigger id="brand">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ampersand">Ampersand</SelectItem>
                  <SelectItem value="Spiro">Spiro</SelectItem>
                  <SelectItem value="Safi">Safi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Rebate Amount (RWF)</Label>
              <Input id="amount" type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
            </div>
            <div className="flex items-center justify-between p-3 rounded border">
              <span className="text-sm">Request refund adjustment</span>
              <input
                type="checkbox"
                checked={requestRefund}
                onChange={(e) => setRequestRefund(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
            <div>
              <Label htmlFor="reason">Rationale for change *</Label>
              <Textarea
                id="reason"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="Explain why this lease data changed..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button className="bg-[#023F40] hover:bg-[#035f60]" onClick={saveLeaseAmendment}>Submit amendment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
