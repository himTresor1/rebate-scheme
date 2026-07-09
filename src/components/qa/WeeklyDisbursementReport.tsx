import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Filter } from 'lucide-react';
import { toast } from 'sonner';

const MOCK_ROWS = [
  { af: 'Bboxx', ticket: 'REB-001', applicant: 'Jean Claude Ndayisaba', woman: false, retrofit: false, provider: 'Bboxx', assembler: 'N/A', retailCost: 830000, amount: 150000, hasPossession: true },
  { af: 'Bboxx', ticket: 'REB-004', applicant: 'Jean HABIMANA', woman: false, retrofit: false, provider: 'Bboxx', assembler: 'N/A', retailCost: 810000, amount: 150000, hasPossession: true },
  { af: 'Jali', ticket: 'REB-014', applicant: 'Grace UWASE', woman: true, retrofit: true, provider: 'Spiro', assembler: 'Green Volt', retailCost: 780000, amount: 200000, hasPossession: false },
  { af: 'Watu', ticket: 'REB-021', applicant: 'Alice M', woman: true, retrofit: false, provider: 'Ampersand', assembler: 'N/A', retailCost: 860000, amount: 170000, hasPossession: false },
];

interface WeeklyDisbursementReportProps {
  mode?: 'cfo-authorization' | 'af-notification';
}

export function WeeklyDisbursementReport({ mode = 'cfo-authorization' }: WeeklyDisbursementReportProps) {
  const [query, setQuery] = useState('');
  const [filterAf, setFilterAf] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterWomen, setFilterWomen] = useState('all');
  const [filterRetrofit, setFilterRetrofit] = useState('all');
  const [filterProvider, setFilterProvider] = useState('all');

  const afs = Array.from(new Set(MOCK_ROWS.map((r) => r.af)));
  const providers = Array.from(new Set(MOCK_ROWS.map((r) => r.provider)));
  const filteredRows = useMemo(() => {
    return MOCK_ROWS.filter((r) => {
      const q = query.toLowerCase();
      if (q && !r.ticket.toLowerCase().includes(q) && !r.applicant.toLowerCase().includes(q)) return false;
      if (filterAf !== 'all' && r.af !== filterAf) return false;
      if (filterWomen === 'yes' && !r.woman) return false;
      if (filterWomen === 'no' && r.woman) return false;
      if (filterRetrofit === 'yes' && !r.retrofit) return false;
      if (filterRetrofit === 'no' && r.retrofit) return false;
      if (filterProvider !== 'all' && r.provider !== filterProvider) return false;
      // date range retained for UI parity in demo
      if (filterDateRange !== 'all') return true;
      return true;
    });
  }, [query, filterAf, filterDateRange, filterWomen, filterRetrofit, filterProvider]);

  const total = filteredRows.reduce((s, r) => s + r.amount, 0);
  const women = filteredRows.filter((r) => r.woman).length;
  const retrofits = filteredRows.filter((r) => r.retrofit).length;
  const noPossession = filteredRows.filter((r) => !r.hasPossession).length;

  const exportExcel = () => {
    const headers = [
      'Asset Financier',
      'Ticket No',
      'Applicant Name',
      'Woman',
      'Retrofit',
      'E-Moto Provider',
      'Retrofit Assembler',
      'E-Moto Retail Cost (RWF)',
      'Rebate Amount For Disbursement Approval (RWF)',
    ];
    const rows = filteredRows.map((r) => [
      r.af,
      r.ticket,
      r.applicant,
      r.woman ? 'Yes' : 'No',
      r.retrofit ? 'Yes' : 'No',
      r.provider,
      r.assembler,
      r.retailCost.toString(),
      r.amount.toString(),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qa_request_to_cfo_weekly_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Weekly report downloaded for CFO signature.', {
      description: 'Use this report for CFO request, signature and date.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">Quality Assurance Team Request to CFO for Disbursement Authorization</h2>
        <p className="text-sm text-gray-600 mt-1">
          QA presents this weekly request to CFO for disbursement approval. Download and share report for signature/date.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Awaiting Q&A review</p><p className="text-2xl font-bold text-[#023F40]">{filteredRows.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Total rebate amount reviewed</p><p className="text-2xl font-bold text-[#023F40]">RWF {total.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Total QA rebates reviewed</p><p className="text-2xl font-bold text-[#023F40]">{filteredRows.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Of which women</p><p className="text-2xl font-bold text-[#023F40]">{women}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Of which retrofits</p><p className="text-2xl font-bold text-[#023F40]">{retrofits}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">No e-moto possession</p><p className="text-2xl font-bold text-[#023F40]">{noPossession}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Filter className="w-4 h-4" />Multiple Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Input placeholder="Search ticket/applicant..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select value={filterAf} onValueChange={setFilterAf}>
            <SelectTrigger><SelectValue placeholder="Asset financier" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All financiers</SelectItem>{afs.map((af) => <SelectItem key={af} value={af}>{af}</SelectItem>)}</SelectContent>
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
          <Select value={filterWomen} onValueChange={setFilterWomen}>
            <SelectTrigger><SelectValue placeholder="Women" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="yes">Women only</SelectItem><SelectItem value="no">Non-women</SelectItem></SelectContent>
          </Select>
          <Select value={filterRetrofit} onValueChange={setFilterRetrofit}>
            <SelectTrigger><SelectValue placeholder="Retrofit" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="yes">Retrofit only</SelectItem><SelectItem value="no">Non-retrofit</SelectItem></SelectContent>
          </Select>
          <Select value={filterProvider} onValueChange={setFilterProvider}>
            <SelectTrigger><SelectValue placeholder="E-Moto Provider" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All providers</SelectItem>{providers.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-[#023F40] hover:bg-[#035f60]" onClick={exportExcel}>
          Print Report as Excel Report with request and signature/date
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default Report for Week</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[1300px] text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="pb-2 pr-3">Name of Asset Financier</th>
                <th className="pb-2 pr-3">Ticket No.</th>
                <th className="pb-2 pr-3">Applicant Name</th>
                <th className="pb-2 pr-3">Woman</th>
                <th className="pb-2 pr-3">Retrofit</th>
                <th className="pb-2 pr-3">Asset Financier</th>
                <th className="pb-2 pr-3">E-Moto Provider</th>
                <th className="pb-2 pr-3">Retrofit Assembler</th>
                <th className="pb-2 pr-3">E-Moto Retail Cost (RWF)</th>
                <th className="pb-2">Rebate Amount for Disbursement Approval (RWF)</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r) => (
                <tr key={r.ticket} className="border-b last:border-0">
                  <td className="py-2 pr-3">{r.af}</td>
                  <td className="py-2 pr-3">{r.ticket}</td>
                  <td className="py-2 pr-3">{r.applicant}</td>
                  <td className="py-2 pr-3">{r.woman ? 'Yes' : 'No'}</td>
                  <td className="py-2 pr-3">{r.retrofit ? 'Yes' : 'No'}</td>
                  <td className="py-2 pr-3">{r.af}</td>
                  <td className="py-2 pr-3">{r.provider}</td>
                  <td className="py-2 pr-3">{r.assembler}</td>
                  <td className="py-2 pr-3">{r.retailCost.toLocaleString()}</td>
                  <td className="py-2">{r.amount.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td colSpan={9} className="py-3 text-right pr-3">TOTAL FOR WEEK</td>
                <td className="py-3">RWF {total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
