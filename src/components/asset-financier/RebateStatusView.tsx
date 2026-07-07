import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileText, Filter, Bike, Clock, DollarSign, Pencil, ArrowUpDown } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { FinancingDetailsView } from '../shared/FinancingDetailsView';
import { getSlaBadge } from '../../utils/slaBadges';
import { toast } from 'sonner';

interface RebateRecord {
  ticketNumber: string;
  applicantName: string;
  submittedAt: string;
  submittedBy: string;
  financier: string;
  vehicleType: 'New E-Moto' | 'Retrofit';
  isWoman: boolean;
  daysSinceSubmission: number;
  rebateAmount: number;
  possessionStatus: 'waiting-af-confirmation' | 'in-escrow' | 'disbursed';
  pipelineCategory: 'proposed' | 'awaiting-auth' | 'disbursed';
}

const MOCK_RECORDS: RebateRecord[] = [
  { ticketNumber: 'REB-001', applicantName: 'Jean Claude Ndayisaba', submittedAt: '2026-04-26', submittedBy: 'Grace Mukandori', financier: 'Bboxx', vehicleType: 'New E-Moto', isWoman: false, daysSinceSubmission: 4, rebateAmount: 150000, possessionStatus: 'waiting-af-confirmation', pipelineCategory: 'awaiting-auth' },
  { ticketNumber: 'REB-002', applicantName: 'Grace UWASE', submittedAt: '2026-04-27', submittedBy: 'Kevin Agent', financier: 'REM', vehicleType: 'Retrofit', isWoman: true, daysSinceSubmission: 3, rebateAmount: 200000, possessionStatus: 'waiting-af-confirmation', pipelineCategory: 'awaiting-auth' },
  { ticketNumber: 'REB-004', applicantName: 'Jean HABIMANA', submittedAt: '2026-05-01', submittedBy: 'Grace Mukandori', financier: 'Bboxx', vehicleType: 'New E-Moto', isWoman: false, daysSinceSubmission: 1, rebateAmount: 150000, possessionStatus: 'in-escrow', pipelineCategory: 'awaiting-auth' },
  { ticketNumber: 'REB-005', applicantName: 'Marie Claire Uwimana', submittedAt: '2026-03-15', submittedBy: 'Grace Mukandori', financier: 'Bank of Kigali', vehicleType: 'New E-Moto', isWoman: true, daysSinceSubmission: 45, rebateAmount: 187500, possessionStatus: 'disbursed', pipelineCategory: 'disbursed' },
  { ticketNumber: 'REB-007', applicantName: 'Emmanuel Gosha', submittedAt: '2026-05-03', submittedBy: 'Kevin Agent', financier: 'Equity Bank', vehicleType: 'New E-Moto', isWoman: false, daysSinceSubmission: 0, rebateAmount: 180000, possessionStatus: 'in-escrow', pipelineCategory: 'proposed' },
];

type SortOption = 'date-oldest' | 'date-newest' | 'days-high' | 'days-low' | 'amount-high' | 'amount-low' | 'name-az';

export function RebateStatusView({
  title = 'Rebate Status',
  description = 'Rebates you have submitted to RGF and their e-moto possession status (to authorize escrow disbursements).',
  mode = 'default',
}: {
  title?: string;
  description?: string;
  mode?: 'default' | 'possession-analysis';
} = {}) {
  const [filterWoman, setFilterWoman] = useState<string>('all');
  const [filterRetrofit, setFilterRetrofit] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSubmitter, setFilterSubmitter] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [filterPossession, setFilterPossession] = useState<string>(
    mode === 'possession-analysis' ? 'not-in-possession' : 'all'
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    mode === 'possession-analysis' ? 'date-oldest' : 'date-newest'
  );
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<RebateRecord[]>(MOCK_RECORDS);
  const [detailTarget, setDetailTarget] = useState<RebateRecord | null>(null);
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
    if (filterCategory !== 'all' && r.pipelineCategory !== filterCategory) return false;
    if (filterSubmitter !== 'all' && r.submittedBy !== filterSubmitter) return false;
    if (filterDateRange === 'day' && r.daysSinceSubmission > 1) return false;
    if (filterDateRange === 'week' && r.daysSinceSubmission > 7) return false;
    if (filterDateRange === 'month' && r.daysSinceSubmission > 30) return false;
    if (filterDateRange === 'year' && r.daysSinceSubmission > 365) return false;
    if (filterPossession === 'not-in-possession' && r.possessionStatus === 'disbursed') return false;
    if (filterPossession === 'in-possession' && r.possessionStatus !== 'disbursed') return false;
    if (filterPossession === 'waiting-af' && r.possessionStatus !== 'waiting-af-confirmation') return false;
    if (filterPossession === 'in-escrow' && r.possessionStatus !== 'in-escrow') return false;
    if (search && !r.applicantName.toLowerCase().includes(search.toLowerCase()) && !r.ticketNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
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

  const proposedCount = records.filter((r) => r.pipelineCategory === 'proposed').length;
  const awaitingAuthCount = records.filter((r) => r.pipelineCategory === 'awaiting-auth').length;
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

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Proposed (not to RGF)</p>
            <p className="text-2xl font-bold text-purple-600">{proposedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Awaiting RGF auth</p>
            <p className="text-2xl font-bold text-[#023F40]">{awaitingAuthCount}</p>
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
            <Select value={filterPossession} onValueChange={setFilterPossession}>
              <SelectTrigger><SelectValue placeholder="Possession status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All possession statuses</SelectItem>
                <SelectItem value="not-in-possession">Not yet in possession (escrow)</SelectItem>
                <SelectItem value="in-possession">In possession (disbursed)</SelectItem>
                <SelectItem value="waiting-af">Waiting for AF confirmation</SelectItem>
                <SelectItem value="in-escrow">In escrow — no e-moto yet</SelectItem>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {mode === 'default' && (
              <>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger><SelectValue placeholder="Pipeline" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All pipeline</SelectItem>
                    <SelectItem value="proposed">Proposed</SelectItem>
                    <SelectItem value="awaiting-auth">Awaiting RGF auth</SelectItem>
                    <SelectItem value="disbursed">Disbursed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSubmitter} onValueChange={setFilterSubmitter}>
                  <SelectTrigger><SelectValue placeholder="Submitter" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All submitters</SelectItem>
                    <SelectItem value="Grace Mukandori">Grace Mukandori</SelectItem>
                    <SelectItem value="Kevin Agent">Kevin Agent</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
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
          <CardTitle className="text-base text-amber-800 flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4" />
            {mode === 'possession-analysis'
              ? `Possession pipeline (${sorted.length} records)`
              : `Default report: RGF waiting for your confirmation of possession (${waitingCount})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto px-4 sm:px-6 pb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="pb-3 pr-4 pl-2">Applicant</th>
                <th className="pb-3 pr-4">Ticket</th>
                <th className="pb-3 pr-4">Submitted</th>
                {mode === 'possession-analysis' && <th className="pb-3 pr-4">Financier</th>}
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Women</th>
                <th className="pb-3 pr-4">Days</th>
                <th className="pb-3 pr-4">SLA</th>
                <th className="pb-3 pr-4">Rebate (RWF)</th>
                <th className="pb-3 pr-2">Status</th>
                {mode === 'default' && <th className="pb-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.ticketNumber} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-4 pr-4 pl-2 font-medium">{r.applicantName}</td>
                  <td className="py-4 pr-4 text-[#023F40]">{r.ticketNumber}</td>
                  <td className="py-4 pr-4">{r.submittedAt}</td>
                  {mode === 'possession-analysis' && <td className="py-4 pr-4">{r.financier}</td>}
                  <td className="py-4 pr-4">{r.vehicleType}</td>
                  <td className="py-4 pr-4">{r.isWoman ? 'Yes' : 'No'}</td>
                  <td className="py-4 pr-4">{r.daysSinceSubmission}</td>
                  <td className="py-4 pr-4">{getSlaBadge(r.daysSinceSubmission)}</td>
                  <td className="py-4 pr-4">{r.rebateAmount.toLocaleString()}</td>
                  <td className="py-4 pr-2">{statusBadge(r.possessionStatus)}</td>
                  {mode === 'default' && (
                  <td className="py-4 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDetailTarget(r)}>Details</Button>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(r)}>
                      <Pencil className="w-3 h-3 mr-1" />
                      Amend
                    </Button>
                  </td>
                  )}
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

      <Dialog open={!!detailTarget} onOpenChange={() => setDetailTarget(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {detailTarget && (
            <FinancingDetailsView
              embedded
              data={{
                ticketNumber: detailTarget.ticketNumber,
                applicantName: detailTarget.applicantName,
                status: detailTarget.pipelineCategory,
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
