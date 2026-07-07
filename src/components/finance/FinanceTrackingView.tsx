import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { DollarSign, Filter, Building2, Bike, Clock } from 'lucide-react';

interface FinanceRecord {
  ticketNumber: string;
  applicantName: string;
  assetFinancier: string;
  submittedAt: string;
  vehicleType: 'New E-Moto' | 'Retrofit';
  isWoman: boolean;
  daysSinceSubmission: number;
  rebateAmount: number;
  status: 'waiting-possession' | 'possession-confirmed' | 'disbursed';
}

const MOCK_RECORDS: FinanceRecord[] = [
  { ticketNumber: 'REB-001', applicantName: 'Jean Claude Ndayisaba', assetFinancier: 'Bboxx', submittedAt: '2026-04-26', vehicleType: 'New E-Moto', isWoman: false, daysSinceSubmission: 4, rebateAmount: 150000, status: 'waiting-possession' },
  { ticketNumber: 'REB-002', applicantName: 'Grace UWASE', assetFinancier: 'REM', submittedAt: '2026-04-27', vehicleType: 'Retrofit', isWoman: true, daysSinceSubmission: 3, rebateAmount: 200000, status: 'waiting-possession' },
  { ticketNumber: 'REB-004', applicantName: 'Jean HABIMANA', assetFinancier: 'Bboxx', submittedAt: '2026-05-01', vehicleType: 'New E-Moto', isWoman: false, daysSinceSubmission: 1, rebateAmount: 150000, status: 'possession-confirmed' },
  { ticketNumber: 'REB-010', applicantName: 'Patrick Ndagijimana', assetFinancier: 'Equity Bank', submittedAt: '2026-03-10', vehicleType: 'New E-Moto', isWoman: false, daysSinceSubmission: 22, rebateAmount: 150000, status: 'disbursed' },
];

export function FinanceTrackingView() {
  const [filterAf, setFilterAf] = useState('all');
  const [filterStatus, setFilterStatus] = useState('waiting-possession');
  const [search, setSearch] = useState('');

  const filtered = MOCK_RECORDS.filter((r) => {
    if (filterAf !== 'all' && r.assetFinancier !== filterAf) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (search && !r.applicantName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const waitingCount = MOCK_RECORDS.filter((r) => r.status === 'waiting-possession').length;
  const disbursedTotal = MOCK_RECORDS.filter((r) => r.status === 'disbursed').reduce((s, r) => s + r.rebateAmount, 0);
  const possessionConfirmed = MOCK_RECORDS.filter((r) => r.status === 'possession-confirmed').length;

  const statusBadge = (status: FinanceRecord['status']) => {
    switch (status) {
      case 'waiting-possession':
        return <Badge className="bg-amber-100 text-amber-800">Waiting for AF possession confirmation</Badge>;
      case 'possession-confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Possession confirmed — escrow eligible</Badge>;
      case 'disbursed':
        return <Badge className="bg-green-100 text-green-800">Disbursed from escrow</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">Finance Tracking</h2>
        <p className="text-gray-600 mt-1 text-sm">
          Track rebate disbursements from AF escrow accounts. Funds are wired offline; use this page to verify amounts.
        </p>
        <p className="text-xs text-amber-700 mt-2 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          View-only at launch. Bank integration and escrow input will be added per RGF guidance.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Waiting for possession</p>
            <p className="text-2xl font-bold text-amber-600">{waitingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Possession confirmed</p>
            <p className="text-2xl font-bold text-blue-600">{possessionConfirmed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total submitted</p>
            <p className="text-2xl font-bold">{MOCK_RECORDS.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Disbursed to date</p>
            <p className="text-2xl font-bold text-green-600">RWF {disbursedTotal.toLocaleString()}</p>
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
            <Input placeholder="Search applicant..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={filterAf} onValueChange={setFilterAf}>
              <SelectTrigger><SelectValue placeholder="Asset Financier" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All AFs</SelectItem>
                <SelectItem value="Bboxx">Bboxx</SelectItem>
                <SelectItem value="REM">REM</SelectItem>
                <SelectItem value="Equity Bank">Equity Bank</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="waiting-possession">Waiting for possession</SelectItem>
                <SelectItem value="possession-confirmed">Possession confirmed</SelectItem>
                <SelectItem value="disbursed">Disbursed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-amber-800">
            Default report: RGF waiting for AF confirmation of possession ({waitingCount})
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="pb-3 pr-4">Applicant</th>
                <th className="pb-3 pr-4">Ticket</th>
                <th className="pb-3 pr-4">AF</th>
                <th className="pb-3 pr-4">Submitted</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Women</th>
                <th className="pb-3 pr-4">Days</th>
                <th className="pb-3 pr-4">Amount (RWF)</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.ticketNumber} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium">{r.applicantName}</td>
                  <td className="py-3 pr-4">{r.ticketNumber}</td>
                  <td className="py-3 pr-4">{r.assetFinancier}</td>
                  <td className="py-3 pr-4">{r.submittedAt}</td>
                  <td className="py-3 pr-4">{r.vehicleType}</td>
                  <td className="py-3 pr-4">{r.isWoman ? 'Yes' : 'No'}</td>
                  <td className="py-3 pr-4">{r.daysSinceSubmission}</td>
                  <td className="py-3 pr-4">{r.rebateAmount.toLocaleString()}</td>
                  <td className="py-3">{statusBadge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> Escrow held until possession confirmed</span>
        <span className="flex items-center gap-1"><Bike className="w-4 h-4" /> Disbursed after AF notification</span>
        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Offline wiring by RGF Finance</span>
        <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> System verifies disbursed amounts</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Escrow reconciliation (view-only)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="pb-2 pr-3">AF</th>
                <th className="pb-2 pr-3">Escrow balance</th>
                <th className="pb-2 pr-3">Authorized this week</th>
                <th className="pb-2 pr-3">Disbursed</th>
                <th className="pb-2">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {[
                { af: 'Bboxx', escrow: 45000000, authorized: 300000, disbursed: 150000, remaining: 44550000 },
                { af: 'REM', escrow: 32000000, authorized: 200000, disbursed: 0, remaining: 31800000 },
              ].map((r) => (
                <tr key={r.af} className="border-b last:border-0">
                  <td className="py-2 pr-3 font-medium">{r.af}</td>
                  <td className="py-2 pr-3">RWF {r.escrow.toLocaleString()}</td>
                  <td className="py-2 pr-3">RWF {r.authorized.toLocaleString()}</td>
                  <td className="py-2 pr-3">RWF {r.disbursed.toLocaleString()}</td>
                  <td className="py-2">RWF {r.remaining.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-4">
            Finance reconciliation and top-up tracking per spec slides 33–38 — detailed bank integration deferred for discussion.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
