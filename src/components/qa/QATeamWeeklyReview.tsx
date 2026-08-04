import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { FileDown, Send, X } from 'lucide-react';

interface ReviewRow {
  id: string;
  ticket: string;
  af: string;
  applicant: string;
  amount: number;
  score: number;
  analystRec: 'approve' | 'reject';
  managerRec: 'approve' | 'reject';
  possession: boolean;
  issues: string;
  included: boolean;
}

const INITIAL_ROWS: ReviewRow[] = [
  {
    id: '1',
    ticket: 'REB-001',
    af: 'Bboxx',
    applicant: 'Jean Claude Ndayisaba',
    amount: 150000,
    score: 88,
    analystRec: 'approve',
    managerRec: 'approve',
    possession: true,
    issues: '',
    included: true,
  },
  {
    id: '2',
    ticket: 'REB-002',
    af: 'REM',
    applicant: 'Grace UWASE',
    amount: 200000,
    score: 92,
    analystRec: 'approve',
    managerRec: 'approve',
    possession: false,
    issues: 'Possession not yet confirmed — exclude from weekly batch',
    included: false,
  },
  {
    id: '3',
    ticket: 'REB-004',
    af: 'Bboxx',
    applicant: 'Jean HABIMANA',
    amount: 150000,
    score: 76,
    analystRec: 'approve',
    managerRec: 'approve',
    possession: true,
    issues: '',
    included: true,
  },
];

export function QATeamWeeklyReview() {
  const [rows, setRows] = useState<ReviewRow[]>(INITIAL_ROWS);
  const [filterAf, setFilterAf] = useState('all');
  const [search, setSearch] = useState('');
  const [batchNotes, setBatchNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filtered = rows.filter((r) => {
    if (filterAf !== 'all' && r.af !== filterAf) return false;
    if (search && !r.applicant.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const includedRows = rows.filter((r) => r.included);
  const weeklyTotal = includedRows.reduce((s, r) => s + r.amount, 0);

  const toggleIncluded = (id: string, checked: boolean) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, included: checked } : r))
    );
  };

  const updateIssues = (id: string, issues: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, issues } : r)));
  };

  const submitToCFO = async () => {
    if (includedRows.length === 0) {
      toast.error('Select at least one case for weekly disbursement');
      return;
    }
    if (!batchNotes.trim()) {
      toast.error('QA Team batch notes are required');
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success(`Weekly disbursement request sent to CFO (${includedRows.length} cases)`, {
      description: `Total RWF ${weeklyTotal.toLocaleString()} — generate authorization report on Weekly Report page.`,
    });
    setSubmitting(false);
  };

  const exportExcel = () => {
    toast.success('QA weekly review exported (demo)', {
      description: 'Excel export will be wired after launch.',
    });
  };

  const recBadge = (rec: 'approve' | 'reject') =>
    rec === 'approve' ? (
      <Badge className="bg-green-100 text-green-800">Approve</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Reject</Badge>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl text-[#023F40]">QA Team Review</h2>
          <p className="text-sm text-gray-600 mt-1">
            Weekly accountability check before CFO disbursement authorization. QA Team confirms which verified rebates are included in the weekly batch.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportExcel}>
            <FileDown className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Cases this week</p>
            <p className="text-2xl font-bold">{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Included in batch</p>
            <p className="text-2xl font-bold text-green-600">{includedRows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Weekly total</p>
            <p className="text-2xl font-bold">RWF {weeklyTotal.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Without possession</p>
            <p className="text-2xl font-bold text-amber-600">
              {rows.filter((r) => !r.possession).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Filters</CardTitle>
            {(search !== '' || filterAf !== 'all') && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-gray-600 hover:text-gray-900"
                onClick={() => {
                  setSearch('');
                  setFilterAf('all');
                }}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input placeholder="Search applicant..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={filterAf} onValueChange={setFilterAf}>
            <SelectTrigger><SelectValue placeholder="Asset Financier" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All AFs</SelectItem>
              <SelectItem value="Bboxx">Bboxx</SelectItem>
              <SelectItem value="REM">REM</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verified rebates — week ending 01 June 2026</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="pb-2 pr-2">Include</th>
                <th className="pb-2 pr-3">Ticket</th>
                <th className="pb-2 pr-3">AF</th>
                <th className="pb-2 pr-3">Applicant</th>
                <th className="pb-2 pr-3">Amount</th>
                <th className="pb-2 pr-3">Score</th>
                <th className="pb-2 pr-3">Analyst</th>
                <th className="pb-2 pr-3">Rebate Team</th>
                <th className="pb-2 pr-3">Possession</th>
                <th className="pb-2">Issues / notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b last:border-0 align-top">
                  <td className="py-3 pr-2">
                    <Checkbox
                      checked={r.included}
                      onCheckedChange={(c) => toggleIncluded(r.id, c === true)}
                      disabled={!r.possession}
                    />
                  </td>
                  <td className="py-3 pr-3 font-medium">{r.ticket}</td>
                  <td className="py-3 pr-3">{r.af}</td>
                  <td className="py-3 pr-3">{r.applicant}</td>
                  <td className="py-3 pr-3">RWF {r.amount.toLocaleString()}</td>
                  <td className="py-3 pr-3">{r.score}%</td>
                  <td className="py-3 pr-3">{recBadge(r.analystRec)}</td>
                  <td className="py-3 pr-3">{recBadge(r.managerRec)}</td>
                  <td className="py-3 pr-3">
                    {r.possession ? (
                      <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                    )}
                  </td>
                  <td className="py-3 min-w-[180px]">
                    <Input
                      className="h-8 text-xs"
                      value={r.issues}
                      onChange={(e) => updateIssues(r.id, e.target.value)}
                      placeholder="Issues or exclusion reason"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">QA Team batch notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={batchNotes}
            onChange={(e) => setBatchNotes(e.target.value)}
            placeholder="Document QA Team accountability check, exclusions, and readiness for CFO weekly authorization..."
            rows={3}
          />
          <Button
            className="bg-[#023F40] hover:bg-[#035f60]"
            onClick={submitToCFO}
            disabled={submitting}
          >
            <Send className="w-4 h-4 mr-2" />
            {submitting ? 'Submitting...' : 'Submit weekly disbursement request to CFO'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
