import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Bike, Bell, CheckCircle2, Filter } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface PossessionRecord {
  ticketNumber: string;
  applicantName: string;
  submittedAt: string;
  vehicleType: 'New E-Moto' | 'Retrofit';
  brand: string;
  isWoman: boolean;
  daysSinceSubmission: number;
  rebateAmount: number;
  hasPossession: boolean;
}

const MOCK_RECORDS: PossessionRecord[] = [
  { ticketNumber: 'REB-001', applicantName: 'Jean Claude Ndayisaba', submittedAt: '2026-04-26', vehicleType: 'New E-Moto', brand: 'Ampersand', isWoman: false, daysSinceSubmission: 4, rebateAmount: 150000, hasPossession: false },
  { ticketNumber: 'REB-002', applicantName: 'Grace UWASE', submittedAt: '2026-04-27', vehicleType: 'Retrofit', brand: 'Ampersand', isWoman: true, daysSinceSubmission: 3, rebateAmount: 200000, hasPossession: false },
  { ticketNumber: 'REB-004', applicantName: 'Jean HABIMANA', submittedAt: '2026-05-01', vehicleType: 'New E-Moto', brand: 'Ampersand', isWoman: false, daysSinceSubmission: 1, rebateAmount: 150000, hasPossession: false },
  { ticketNumber: 'REB-003', applicantName: 'Alice Mutoni', submittedAt: '2026-03-20', vehicleType: 'New E-Moto', brand: 'Spiro', isWoman: true, daysSinceSubmission: 12, rebateAmount: 175000, hasPossession: true },
];

export function PossessionConfirmationView() {
  const [records, setRecords] = useState(MOCK_RECORDS);
  const [filter, setFilter] = useState('pending');
  const [confirmTarget, setConfirmTarget] = useState<PossessionRecord | null>(null);
  const [confirming, setConfirming] = useState(false);

  const pending = records.filter((r) => !r.hasPossession);
  const provided = records.filter((r) => r.hasPossession);

  const displayed = filter === 'pending' ? pending : filter === 'provided' ? provided : records;

  const handleConfirmPossession = async () => {
    if (!confirmTarget) return;
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 800));
    setRecords((prev) =>
      prev.map((r) => (r.ticketNumber === confirmTarget.ticketNumber ? { ...r, hasPossession: true } : r))
    );
    toast.success('RGF notified of e-moto possession', {
      description: `${confirmTarget.applicantName} — AF may access escrow for RWF ${confirmTarget.rebateAmount.toLocaleString()}`,
    });
    setConfirming(false);
    setConfirmTarget(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">E-Moto Possession Status</h2>
        <p className="text-gray-600 mt-1 text-sm">
          Confirm when individuals have taken possession of their e-moto. RGF uses this to authorize escrow disbursements.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">E-motos provided</p>
            <p className="text-2xl font-bold text-green-600">{provided.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">No e-moto yet</p>
            <p className="text-2xl font-bold text-amber-600">{pending.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total rebates submitted</p>
            <p className="text-2xl font-bold text-[#023F40]">{records.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Default report: No e-moto provided yet ({pending.length})
            </CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending possession</SelectItem>
                <SelectItem value="provided">E-moto provided</SelectItem>
                <SelectItem value="all">All rebates</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="pb-3 pr-4">Applicant</th>
                <th className="pb-3 pr-4">Ticket</th>
                <th className="pb-3 pr-4">Submitted</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Brand</th>
                <th className="pb-3 pr-4">Women</th>
                <th className="pb-3 pr-4">Days</th>
                <th className="pb-3 pr-4">Rebate (RWF)</th>
                <th className="pb-3">Notify RGF</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((r) => (
                <tr key={r.ticketNumber} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium">{r.applicantName}</td>
                  <td className="py-3 pr-4 text-[#023F40]">{r.ticketNumber}</td>
                  <td className="py-3 pr-4">{r.submittedAt}</td>
                  <td className="py-3 pr-4">{r.vehicleType}</td>
                  <td className="py-3 pr-4">{r.brand}</td>
                  <td className="py-3 pr-4">{r.isWoman ? 'Yes' : 'No'}</td>
                  <td className="py-3 pr-4">{r.daysSinceSubmission}</td>
                  <td className="py-3 pr-4">{r.rebateAmount.toLocaleString()}</td>
                  <td className="py-3">
                    {r.hasPossession ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Confirmed
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-[#023F40] hover:bg-[#035f60]"
                        onClick={() => setConfirmTarget(r)}
                      >
                        <Bell className="w-3 h-3 mr-1" />
                        Notify RGF
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={!!confirmTarget} onOpenChange={() => setConfirmTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm e-moto possession</DialogTitle>
            <DialogDescription>
              Notify RGF that <strong>{confirmTarget?.applicantName}</strong> ({confirmTarget?.ticketNumber}) has taken possession of their e-moto.
              This allows your organization to access the rebate amount from the escrow account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg text-sm">
            <Bike className="w-8 h-8 text-[#023F40]" />
            <div>
              <p className="font-medium">Rebate amount: RWF {confirmTarget?.rebateAmount.toLocaleString()}</p>
              <p className="text-gray-600">Funds will be released from escrow after RGF records this confirmation.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmTarget(null)}>Cancel</Button>
            <Button className="bg-[#023F40] hover:bg-[#035f60]" onClick={handleConfirmPossession} disabled={confirming}>
              {confirming ? 'Submitting...' : 'Confirm possession'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
