import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Bike, Bell, CheckCircle2, Filter, ArrowUpDown, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { FinancingDetailsView } from '../shared/FinancingDetailsView';
import { Input } from '../ui/input';
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

type SortOption = 'date-oldest' | 'date-newest' | 'days-high' | 'days-low' | 'amount-high' | 'amount-low' | 'name-az';

export function PossessionConfirmationView() {
  const [records, setRecords] = useState(MOCK_RECORDS);
  const [filter, setFilter] = useState('pending');
  const [sortBy, setSortBy] = useState<SortOption>('date-oldest');
  const [filterWoman, setFilterWoman] = useState('all');
  const [filterRetrofit, setFilterRetrofit] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [search, setSearch] = useState('');
  const [confirmTarget, setConfirmTarget] = useState<PossessionRecord | null>(null);
  const [detailTarget, setDetailTarget] = useState<PossessionRecord | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [possessionProofName, setPossessionProofName] = useState('');
  const [possessionDate, setPossessionDate] = useState('');

  const pending = records.filter((r) => !r.hasPossession);
  const provided = records.filter((r) => r.hasPossession);

  const reportTitle =
    filter === 'provided'
      ? `Possession confirmed (${provided.length})`
      : filter === 'all'
      ? `All possession records (${records.length})`
      : `Default report: No e-moto provided yet (${pending.length})`;

  const baseFiltered = (filter === 'pending' ? pending : filter === 'provided' ? provided : records)
    .filter((r) => {
      if (filterWoman === 'yes' && !r.isWoman) return false;
      if (filterWoman === 'no' && r.isWoman) return false;
      if (filterRetrofit === 'yes' && r.vehicleType !== 'Retrofit') return false;
      if (filterRetrofit === 'no' && r.vehicleType === 'Retrofit') return false;
      if (filterDateRange === 'day' && r.daysSinceSubmission > 1) return false;
      if (filterDateRange === 'week' && r.daysSinceSubmission > 7) return false;
      if (filterDateRange === 'month' && r.daysSinceSubmission > 30) return false;
      if (filterDateRange === 'year' && r.daysSinceSubmission > 365) return false;
      if (search && !r.applicantName.toLowerCase().includes(search.toLowerCase()) && !r.ticketNumber.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

  const displayed = [...baseFiltered].sort((a, b) => {
    switch (sortBy) {
      case 'date-oldest':
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      case 'date-newest':
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      case 'days-high':
        return b.daysSinceSubmission - a.daysSinceSubmission;
      case 'days-low':
        return a.daysSinceSubmission - b.daysSinceSubmission;
      case 'amount-high':
        return b.rebateAmount - a.rebateAmount;
      case 'amount-low':
        return a.rebateAmount - b.rebateAmount;
      case 'name-az':
        return a.applicantName.localeCompare(b.applicantName);
      default:
        return 0;
    }
  });

  const handleConfirmPossession = async () => {
    if (!confirmTarget) return;
    if (!possessionProofName) {
      toast.error('Signed AF/Client possession confirmation is required');
      return;
    }
    if (!possessionDate) {
      toast.error('Date of e-moto possession is required');
      return;
    }
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 800));
    setRecords((prev) =>
      prev.map((r) => (r.ticketNumber === confirmTarget.ticketNumber ? { ...r, hasPossession: true } : r))
    );
    toast.success('RGF notified of e-moto possession', {
      description: `${confirmTarget.applicantName} — possession proof received (${possessionProofName}), date ${possessionDate}`,
    });
    setConfirming(false);
    setConfirmTarget(null);
    setPossessionProofName('');
    setPossessionDate('');
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
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

      <Card className="max-w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters &amp; Sort
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input placeholder="Search name or ticket..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="date-oldest">Date received (oldest first)</SelectItem>
                <SelectItem value="date-newest">Date received (newest first)</SelectItem>
                <SelectItem value="days-high">Days since receipt (high to low)</SelectItem>
                <SelectItem value="days-low">Days since receipt (low to high)</SelectItem>
                <SelectItem value="amount-high">Rebate amount (high to low)</SelectItem>
                <SelectItem value="amount-low">Rebate amount (low to high)</SelectItem>
                <SelectItem value="name-az">Applicant name (A–Z)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger><SelectValue placeholder="Possession" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Not yet in possession</SelectItem>
                <SelectItem value="provided">E-moto provided</SelectItem>
                <SelectItem value="all">All rebates</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger><SelectValue placeholder="Date range" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="year">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              {reportTitle}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="w-full max-w-full overflow-x-auto px-4 sm:px-6 pb-6">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="pb-3 pr-4 pl-2">Applicant</th>
                <th className="pb-3 pr-4">Ticket</th>
                <th className="pb-3 pr-4">Submitted</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Brand</th>
                <th className="pb-3 pr-4">Women</th>
                <th className="pb-3 pr-4">Days</th>
                <th className="pb-3 pr-4">Rebate (RWF)</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((r) => (
                <tr key={r.ticketNumber} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-4 pr-4 pl-2 font-medium">{r.applicantName}</td>
                  <td className="py-4 pr-4 text-[#023F40]">{r.ticketNumber}</td>
                  <td className="py-4 pr-4">{r.submittedAt}</td>
                  <td className="py-4 pr-4">{r.vehicleType}</td>
                  <td className="py-4 pr-4">{r.brand}</td>
                  <td className="py-4 pr-4">{r.isWoman ? 'Yes' : 'No'}</td>
                  <td className="py-4 pr-4">{r.daysSinceSubmission}</td>
                  <td className="py-4 pr-4">{r.rebateAmount.toLocaleString()}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setDetailTarget(r)}>Details</Button>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={!!detailTarget} onOpenChange={() => setDetailTarget(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {detailTarget && (
            <FinancingDetailsView
              embedded
              data={{
                ticketNumber: detailTarget.ticketNumber,
                applicantName: detailTarget.applicantName,
                status: detailTarget.hasPossession ? 'Possession confirmed' : 'Awaiting possession',
                isWoman: detailTarget.isWoman,
                vehicleType: detailTarget.vehicleType,
                financier: 'Bank of Kigali',
                submittedAt: detailTarget.submittedAt,
                rebateAmount: detailTarget.rebateAmount,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmTarget(null);
            setPossessionProofName('');
            setPossessionDate('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm e-moto possession</DialogTitle>
            <DialogDescription>
              Confirm e-moto possession for <strong>{confirmTarget?.applicantName}</strong> ({confirmTarget?.ticketNumber}).
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg text-sm">
            <Bike className="w-8 h-8 text-[#023F40]" />
            <div>
              <p className="font-medium">Rebate amount: RWF {confirmTarget?.rebateAmount.toLocaleString()}</p>
              <p className="text-gray-600">Funds will be released from escrow after RGF records this confirmation.</p>
            </div>
          </div>
          <div className="space-y-3 border rounded-lg p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Signed AF/Client Confirmation of E-Moto Possession *
              </label>
              <button
                type="button"
                className="text-xs text-[#023F40] underline underline-offset-2 mb-2"
                onClick={() =>
                  toast.success('Template ready for download', {
                    description: 'AF_Client_Confirmation_of_E_Moto_Possession_Template.pdf',
                  })
                }
              >
                Get template here
              </button>
              <input
                type="file"
                id="possession-proof"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setPossessionProofName(file ? file.name : '');
                }}
                className="hidden"
              />
              {!possessionProofName ? (
                <label
                  htmlFor="possession-proof"
                  className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-3 px-4 cursor-pointer hover:border-[#023F40] hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                </label>
              ) : null}
              {possessionProofName && (
                <div className="bg-green-50 border border-green-200 rounded p-3 mt-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-green-700">Uploaded: {possessionProofName}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPossessionProofName('')}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of E-Moto Possession *
              </label>
              <input
                type="date"
                value={possessionDate}
                onChange={(e) => setPossessionDate(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
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
