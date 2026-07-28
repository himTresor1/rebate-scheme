import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DateInput } from '../ui/date-input';
import { formatDisplayDate } from '../../utils/dateFormat';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Filter, Printer, ThumbsDown, ThumbsUp } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { toast } from 'sonner';
import { User } from '../../utils/auth';
import { api } from '../../utils/api';
import { getQaPresentationApplications } from '../../utils/demoPipelineData';
import { getRebatePercent } from '../../utils/rebateCalculation';
import { formatNumber } from '../../utils/numberFormat';
import { QAReview } from './QAReview';
import { PageHeader } from '../PageHeader';
import { Greeting } from '../ui/Greeting';

type DecisionValue = 'yes' | 'no' | '';

type DecisionRow = {
  id: string;
  ticket: string;
  applicant: string;
  af: string;
  woman: boolean;
  retrofit: boolean;
  provider: string;
  assembler: string;
  retailCost: number;
  rebateAmount: number;
  rebatePercent: string;
  afSubmittedAt: string;
  verifiedAt: string;
  hasPossession: boolean;
  raw: any;
};

type RowDecision = {
  decision: DecisionValue;
  comment: string;
};

function enrichDecisionRow(app: any, index: number): DecisionRow {
  const woman = app.eligibilityCheck?.nationalIdCheck?.gender === 'Female' || index % 3 === 1;
  const retrofit = Boolean(app.isRetrofit);
  const retail = parseFloat(app.purchasePrice || `${3500000 + index * 50000}`) || 3500000;
  const amount = parseFloat(app.rebateAmount || '0') || Math.round(retail * (woman ? 0.25 : retrofit ? 0.2 : 0.18));
  const percent = getRebatePercent({ isWoman: woman, isRetrofit: retrofit });
  return {
    id: app.id,
    ticket: app.ticketNumber || app.registrationNumber || app.id.replace('application:', '').toUpperCase(),
    applicant: app.applicantName || app.companyName || 'Applicant',
    af: app.companyName || 'Asset Financier',
    woman,
    retrofit,
    provider: app.motorcycleBrand || 'Ampersand',
    assembler: app.retrofitAssembler || (retrofit ? 'REM' : 'N/A'),
    retailCost: retail,
    rebateAmount: amount,
    rebatePercent: percent,
    afSubmittedAt: app.createdAt,
    verifiedAt: app.verifiedAt || app.lastReviewedAt || app.createdAt,
    hasPossession: Boolean(
      app.documents?.some((d: any) => String(d.name || '').toLowerCase().includes('possession'))
    ) || index % 4 === 0,
    raw: app,
  };
}

interface QATeamDecisionPageProps {
  user: User;
}

export function QATeamDecisionPage({ user }: QATeamDecisionPageProps) {
  const [rows, setRows] = useState<DecisionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [decisions, setDecisions] = useState<Record<string, RowDecision>>({});
  const [batchApproval, setBatchApproval] = useState<DecisionValue>('');
  const [query, setQuery] = useState('');
  const [filterWomen, setFilterWomen] = useState('all');
  const [filterRetrofit, setFilterRetrofit] = useState('all');
  const [filterProvider, setFilterProvider] = useState('all');
  const [filterAssembler, setFilterAssembler] = useState('all');
  const [filterAf, setFilterAf] = useState('all');
  const [filterPossession, setFilterPossession] = useState('all');
  const [dateFrom, setDateFrom] = useState('2026-05-01');
  const [dateTo, setDateTo] = useState('2026-06-30');
  const [printOpen, setPrintOpen] = useState(false);
  const [printWithSignature, setPrintWithSignature] = useState(false);
  const [printFormat, setPrintFormat] = useState<'pdf' | 'excel'>('pdf');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchAction, setBatchAction] = useState<'yes' | 'no' | null>(null);
  const [batchReason, setBatchReason] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getAllApplications();
        const merged = getQaPresentationApplications(data);
        const qaStatuses = ['manager-review', 'qa-review', 'program-manager-review'];
        const decisionSource = merged.filter((app: any) => qaStatuses.includes(app.status));
        setRows(decisionSource.map((app, idx) => enrichDecisionRow(app, idx)));
      } catch (e) {
        console.error(e);
        toast.error('Failed to load verified rebates');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const providers = useMemo(
    () => Array.from(new Set(rows.map((r) => r.provider))).sort(),
    [rows]
  );
  const assemblers = useMemo(
    () => Array.from(new Set(rows.map((r) => r.assembler).filter((a) => a && a !== 'N/A'))).sort(),
    [rows]
  );
  const financiers = useMemo(
    () => Array.from(new Set(rows.map((r) => r.af))).sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom).getTime() : 0;
    const to = dateTo ? new Date(dateTo).getTime() + 86400000 - 1 : Number.MAX_SAFE_INTEGER;
    return rows.filter((r) => {
      const verified = new Date(r.verifiedAt).getTime();
      if (verified < from || verified > to) return false;
      const q = query.toLowerCase();
      if (q && !r.ticket.toLowerCase().includes(q) && !r.applicant.toLowerCase().includes(q)) return false;
      if (filterAf !== 'all' && r.af !== filterAf) return false;
      if (filterWomen === 'yes' && !r.woman) return false;
      if (filterWomen === 'no' && r.woman) return false;
      if (filterRetrofit === 'yes' && !r.retrofit) return false;
      if (filterRetrofit === 'no' && r.retrofit) return false;
      if (filterProvider !== 'all' && r.provider !== filterProvider) return false;
      if (filterAssembler !== 'all' && r.assembler !== filterAssembler) return false;
      if (filterPossession === 'without' && r.hasPossession) return false;
      if (filterPossession === 'with' && !r.hasPossession) return false;
      return true;
    });
  }, [
    rows,
    query,
    filterAf,
    filterWomen,
    filterRetrofit,
    filterProvider,
    filterAssembler,
    filterPossession,
    dateFrom,
    dateTo,
  ]);

  const totalAmount = filtered.reduce((s, r) => s + r.rebateAmount, 0);
  const byAf = useMemo(() => {
    const map = new Map<string, { count: number; amount: number }>();
    for (const r of filtered) {
      const entry = map.get(r.af) || { count: 0, amount: 0 };
      entry.count += 1;
      entry.amount += r.rebateAmount;
      map.set(r.af, entry);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([af, v]) => ({ name: af, count: v.count, amount: Math.round(v.amount) }));
  }, [filtered]);

  const AF_CHART_COLORS = ['#023F40', '#6DB27F', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

  const dateRangeLabel =
    dateFrom && dateTo
      ? `${formatDisplayDate(dateFrom)} – ${formatDisplayDate(dateTo)}`
      : 'Selected period';

  const setRowDecision = (id: string, decision: DecisionValue) => {
    setDecisions((prev) => ({
      ...prev,
      [id]: { decision, comment: prev[id]?.comment || '' },
    }));
  };

  const handleRowYes = (row: DecisionRow) => {
    setRowDecision(row.id, 'yes');
    toast.success(`Decision recorded: YES for ${row.ticket}`);
  };

  const handleRowNo = (row: DecisionRow) => {
    setRowDecision(row.id, 'no');
    toast.warning(`Decision recorded: NO for ${row.ticket}`, {
      description: 'Open the ticket to add the mandatory rejection comment.',
    });
  };

  const toggleRowSelection = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id));

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(filtered.map((r) => r.id)) : new Set());
  };

  const selectedCount = filtered.filter((r) => selectedIds.has(r.id)).length;

  const openBatchAction = (action: 'yes' | 'no') => {
    if (selectedCount === 0) return;
    setBatchAction(action);
    setBatchReason('');
  };

  const handleConfirmBatchAction = () => {
    if (!batchAction) return;
    if (!batchReason.trim()) {
      toast.error('A reason is required for bulk decisions.');
      return;
    }
    const ids = filtered.filter((r) => selectedIds.has(r.id)).map((r) => r.id);
    if (ids.length === 0) return;
    const reason = batchReason.trim();
    setDecisions((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        next[id] = { decision: batchAction, comment: reason };
      }
      return next;
    });
    setSelectedIds(new Set());
    setBatchAction(null);
    setBatchReason('');
    if (batchAction === 'yes') {
      toast.success(`Decision recorded: YES for ${ids.length} rebate(s)`);
    } else {
      toast.warning(`Decision recorded: NO for ${ids.length} rebate(s)`);
    }
  };

  const approvedRows = filtered.filter((r) => decisions[r.id]?.decision === 'yes');

  const exportExcel = (withSignature: boolean) => {
    const headers = [
      'Ticket No.',
      'Date of AF Submission',
      'Date of Rebate Team Verification',
      'Applicant Name',
      'Woman',
      'Retrofit',
      'Asset Financier',
      'E-Moto Provider',
      'Retrofit Assembler',
      'E-Moto Retail Cost (RWF)',
      'Rebate Amount (RWF)',
      'Rebate Percentage (%)',
      'QA Team Decision',
      'Comment',
    ];
    const dataRows = approvedRows.map((r) => [
      r.ticket,
      formatDisplayDate(r.afSubmittedAt),
      formatDisplayDate(r.verifiedAt),
      r.applicant,
      r.woman ? 'Yes' : 'No',
      r.retrofit ? 'Yes' : 'No',
      r.af,
      r.provider,
      r.assembler,
      formatNumber(r.retailCost),
      formatNumber(r.rebateAmount),
      r.rebatePercent,
      'YES',
      decisions[r.id]?.comment || '',
    ]);
    const csv = [headers, ...dataRows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qa_approved_rebate_report_${dateFrom}_${dateTo}${withSignature ? '_signature' : ''}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Excel report downloaded', {
      description: withSignature
        ? 'Include signature page when circulating to QA members.'
        : 'Rebates Approved by RGF Rebate Quality Assurance Team',
    });
  };

  const handlePrintReport = () => {
    if (batchApproval !== 'yes') {
      toast.error('Set batch Approval to YES before printing the approved report.');
      return;
    }
    const rejectedWithoutComment = filtered.filter((r) => {
      const d = decisions[r.id];
      return d?.decision === 'no' && !d.comment.trim();
    });
    if (rejectedWithoutComment.length > 0) {
      toast.error('Comment is mandatory for every rejected rebate.');
      return;
    }
    if (approvedRows.length === 0) {
      toast.error('No YES decisions to include in the approved report.');
      return;
    }
    setPrintOpen(true);
  };

  const confirmPrint = () => {
    setPrintOpen(false);
    if (printFormat === 'excel') {
      exportExcel(printWithSignature);
      return;
    }
    toast.info(
      printWithSignature
        ? 'Opening PDF print view with signature page…'
        : 'Opening PDF print view…'
    );
    setTimeout(() => window.print(), 150);
  };

  if (selectedApp) {
    return (
      <QAReview
        application={selectedApp}
        user={user}
        onDecisionCaptured={({ applicationId, decision, reason }) => {
          setDecisions((prev) => ({
            ...prev,
            [applicationId]: {
              decision: decision === 'approve' ? 'yes' : 'no',
              comment: reason,
            },
          }));
        }}
        onBack={() => setSelectedApp(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <p>Loading QA decisions…</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader />
      <Greeting name={user.name || 'QA Team Member'} />

      <div className="print:text-center">
        <h1 className="text-lg sm:text-xl font-semibold text-[#023F40]">
          Rebate QA Team Decision Page
        </h1>
        <p className="text-sm text-gray-600 mt-1 max-w-4xl print:max-w-none">
          Use this page in QA meetings to decide on rebates verified by the Rebate Team. Click a Ticket No. for
          full details and documents. Approved decisions feed the Approved Rebate Report for CFO disbursement.
        </p>
        <p className="hidden print:block text-xs text-gray-500 mt-2">
          Rebates Approved by RGF Rebate Quality Assurance Team — Date range: {dateRangeLabel}
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4 print:hidden">
        <div className="space-y-1">
          <Label className="text-xs text-gray-600">Verified rebates from</Label>
          <DateInput
            className="w-[170px]"
            value={dateFrom}
            onChange={setDateFrom}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-600">Verified rebates to</Label>
          <DateInput
            className="w-[170px]"
            value={dateTo}
            onChange={setDateTo}
          />
        </div>
        <p className="text-sm text-gray-600 pb-2">
          Showing verified rebates for <span className="font-medium text-[#023F40]">{dateRangeLabel}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Verified rebates requesting approval</p>
            <p className="text-2xl font-bold text-[#023F40]">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total verified rebates requesting approval (RWF)</p>
            <p className="text-2xl font-bold text-[#023F40]">{Math.round(totalAmount).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-1">Rebates per Asset Financier</h3>
            <p className="text-sm text-gray-500">Number of verified rebates in the selected period</p>
          </div>
          {byAf.length === 0 ? (
            <p className="text-sm text-gray-500 py-10 text-center">No rebates in range</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart id="qa-decision-af-count-pie">
                <Pie
                  data={byAf}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }: { name: string; count: number }) => `${name}: ${count}`}
                  outerRadius={100}
                  dataKey="count"
                  isAnimationActive={false}
                >
                  {byAf.map((entry, index) => (
                    <Cell
                      key={`qa-af-count-${entry.name}`}
                      fill={AF_CHART_COLORS[index % AF_CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: any) => [`${value} rebate(s)`, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-1">Value per Asset Financier</h3>
            <p className="text-sm text-gray-500">Total rebate value requesting approval (RWF)</p>
          </div>
          {byAf.length === 0 ? (
            <p className="text-sm text-gray-500 py-10 text-center">No rebates in range</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={byAf}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                id="qa-decision-af-value-bar"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis
                  stroke="#6b7280"
                  tickFormatter={(value: number) => `${(value / 1000000).toFixed(1)}M`}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: any) => [
                    new Intl.NumberFormat('en-RW', {
                      style: 'currency',
                      currency: 'RWF',
                      minimumFractionDigits: 0,
                    }).format(value),
                    'Rebate Value',
                  ]}
                />
                <Bar dataKey="amount" fill="#023F40" radius={[8, 8, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <Card className="print:hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Input placeholder="Search ticket/applicant..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <Select value={filterAf} onValueChange={setFilterAf}>
              <SelectTrigger>
                <SelectValue placeholder="Asset Financier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Asset Financiers</SelectItem>
                {financiers.map((af) => (
                  <SelectItem key={af} value={af}>
                    {af}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterWomen} onValueChange={setFilterWomen}>
              <SelectTrigger>
                <SelectValue placeholder="Women" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All applicants</SelectItem>
                <SelectItem value="yes">Women only</SelectItem>
                <SelectItem value="no">Non-women</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRetrofit} onValueChange={setFilterRetrofit}>
              <SelectTrigger>
                <SelectValue placeholder="Retrofit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="yes">Retrofit only</SelectItem>
                <SelectItem value="no">New e-moto only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterProvider} onValueChange={setFilterProvider}>
              <SelectTrigger>
                <SelectValue placeholder="E-Moto Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All E-Moto Providers</SelectItem>
                {providers.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterAssembler} onValueChange={setFilterAssembler}>
              <SelectTrigger>
                <SelectValue placeholder="Retrofit Assembler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Retrofit Assemblers</SelectItem>
                {assemblers.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPossession} onValueChange={setFilterPossession}>
              <SelectTrigger>
                <SelectValue placeholder="Possession" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All possession statuses</SelectItem>
                <SelectItem value="without">Verified without e-moto possession</SelectItem>
                <SelectItem value="with">With possession confirmation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-gray-500">
            Showing {filtered.length} of {rows.length} verified rebates for {dateRangeLabel}.
          </p>
        </CardContent>
      </Card>

      <Card className="print:shadow-none print:border-0">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base text-[#023F40]">
              Verified rebates for {dateRangeLabel}
            </CardTitle>
            {selectedCount > 0 && (
              <div className="flex items-center gap-2 print:hidden">
                <span className="text-sm text-gray-600">{selectedCount} selected</span>
                <Button
                  size="sm"
                  className="bg-[#6DB27F] hover:bg-[#5da170]"
                  onClick={() => openBatchAction('yes')}
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Approve selected (YES)
                </Button>
                <Button size="sm" variant="destructive" onClick={() => openBatchAction('no')}>
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  Reject selected (NO)
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-600">No verified rebates match the filters.</div>
          ) : (
            <table className="w-full min-w-[1500px] text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="pb-2 pr-3 font-medium print:hidden">
                    <Checkbox
                      checked={allFilteredSelected}
                      onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                      aria-label="Select all rebates"
                    />
                  </th>
                  <th className="pb-2 pr-3 font-medium">Ticket No.</th>
                  <th className="pb-2 pr-3 font-medium">Date of AF Submission</th>
                  <th className="pb-2 pr-3 font-medium">Date of Rebate Team Verification</th>
                  <th className="pb-2 pr-3 font-medium">Applicant Name</th>
                  <th className="pb-2 pr-3 font-medium">Woman</th>
                  <th className="pb-2 pr-3 font-medium">Retrofit</th>
                  <th className="pb-2 pr-3 font-medium">Asset Financier</th>
                  <th className="pb-2 pr-3 font-medium">E-Moto Provider</th>
                  <th className="pb-2 pr-3 font-medium">Retrofit Assembler</th>
                  <th className="pb-2 pr-3 font-medium">E-Moto Retail Cost (RWF)</th>
                  <th className="pb-2 pr-3 font-medium">Rebate Amount (RWF)</th>
                  <th className="pb-2 pr-3 font-medium">Rebate Percentage (%)</th>
                  <th className="pb-2 pr-3 font-medium">QA Team Decision [YES/NO]</th>
                  <th className="pb-2 font-medium">Comment (from ticket review)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const d = decisions[r.id] || { decision: '', comment: '' };
                  return (
                    <tr key={r.id} className="border-b align-top">
                      <td className="py-2 pr-3 print:hidden">
                        <Checkbox
                          checked={selectedIds.has(r.id)}
                          onCheckedChange={(checked) => toggleRowSelection(r.id, checked === true)}
                          aria-label={`Select ${r.ticket}`}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <button
                          type="button"
                          className="font-semibold text-blue-700 hover:underline print:text-black print:no-underline"
                          onClick={() => setSelectedApp(r.raw)}
                        >
                          {r.ticket}
                        </button>
                      </td>
                      <td className="py-2 pr-3">{formatDisplayDate(r.afSubmittedAt)}</td>
                      <td className="py-2 pr-3">{formatDisplayDate(r.verifiedAt)}</td>
                      <td className="py-2 pr-3">{r.applicant}</td>
                      <td className="py-2 pr-3">{r.woman ? 'Yes' : 'No'}</td>
                      <td className="py-2 pr-3">{r.retrofit ? 'Yes' : 'No'}</td>
                      <td className="py-2 pr-3">{r.af}</td>
                      <td className="py-2 pr-3">{r.provider}</td>
                      <td className="py-2 pr-3">{r.assembler}</td>
                      <td className="py-2 pr-3">{formatNumber(r.retailCost)}</td>
                      <td className="py-2 pr-3">{formatNumber(r.rebateAmount)}</td>
                      <td className="py-2 pr-3">{r.rebatePercent}</td>
                      <td className="py-2 pr-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1 print:hidden">
                          <Button
                            size="sm"
                            className={
                              d.decision === 'yes'
                                ? 'h-8 bg-[#6DB27F] hover:bg-[#5da170] text-white'
                                : 'h-8 bg-white border border-gray-300 text-gray-700 hover:bg-emerald-50 hover:border-[#6DB27F]'
                            }
                            onClick={() => handleRowYes(r)}
                          >
                            <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                            YES
                          </Button>
                          <Button
                            size="sm"
                            className={
                              d.decision === 'no'
                                ? 'h-8 bg-red-600 hover:bg-red-700 text-white'
                                : 'h-8 bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-400'
                            }
                            onClick={() => handleRowNo(r)}
                          >
                            <ThumbsDown className="w-3.5 h-3.5 mr-1" />
                            NO
                          </Button>
                        </div>
                        <span className="hidden print:inline">
                          {d.decision === 'yes' ? 'YES' : d.decision === 'no' ? 'NO' : '—'}
                        </span>
                      </td>
                      <td className="py-2 max-w-[220px]">
                        <span className={d.comment ? 'text-gray-800' : 'text-gray-400'}>
                          {d.comment || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="font-semibold">
                  <td colSpan={11} className="py-3 text-right pr-3">
                    Total for period
                  </td>
                  <td className="py-3" colSpan={3}>
                    RWF {Math.round(totalAmount).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div className="space-y-2">
          <Label>Approval for total [YES/NO]</Label>
          <div className="flex gap-2">
            <Button
              className={
                batchApproval === 'yes'
                  ? 'bg-[#6DB27F] hover:bg-[#5da170] text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-emerald-50 hover:border-[#6DB27F]'
              }
              onClick={() => setBatchApproval('yes')}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              YES
            </Button>
            <Button
              className={
                batchApproval === 'no'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-400'
              }
              onClick={() => setBatchApproval('no')}
            >
              <ThumbsDown className="w-4 h-4 mr-1" />
              NO
            </Button>
          </div>
          <p className="text-xs text-gray-500">Approval applies to the total at the bottom of this page.</p>
        </div>
        <Button className="bg-[#6DB27F] hover:bg-[#5da170]" onClick={handlePrintReport}>
          <Printer className="w-4 h-4 mr-2" />
          Print Approved Rebate Report
        </Button>
      </div>

      {printWithSignature && (
        <div className="hidden print:block mt-10 space-y-6 text-sm">
          <p className="font-semibold text-[#023F40]">QA Team Signature Page</p>
          {['QA Member 1', 'QA Member 2', 'QA Member 3'].map((name) => (
            <div key={name} className="grid grid-cols-3 gap-8 pt-6">
              <div>
                <p className="mb-8">{name}</p>
                <div className="border-b border-gray-800" />
                <p className="mt-1 text-xs">Signature</p>
              </div>
              <div>
                <div className="border-b border-gray-800 mt-14" />
                <p className="mt-1 text-xs">Date</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Print Approved Rebate Report</DialogTitle>
            <DialogDescription>
              Report title: Rebates Approved by RGF Rebate Quality Assurance Team. Date range will appear at the top.
              Each AF can receive their approved list separately after export.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Format</Label>
              <Select value={printFormat} onValueChange={(v) => setPrintFormat(v as 'pdf' | 'excel')}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF (print)</SelectItem>
                  <SelectItem value="excel">Excel (CSV)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Version</Label>
              <Select
                value={printWithSignature ? 'signature' : 'document'}
                onValueChange={(v) => setPrintWithSignature(v === 'signature')}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">1) Document only</SelectItem>
                  <SelectItem value="signature">2) Document with signature page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500">
              Includes {approvedRows.length} YES decision(s). Rejected rows need comments before batch approval.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrintOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#6DB27F] hover:bg-[#5da170]" onClick={confirmPrint}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={batchAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setBatchAction(null);
            setBatchReason('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {batchAction === 'yes'
                ? `Approve selected rebates (YES)`
                : `Reject selected rebates (NO)`}
            </DialogTitle>
            <DialogDescription>
              You are recording a {batchAction === 'yes' ? 'YES' : 'NO'} decision for {selectedCount}{' '}
              rebate(s). A reason is required and will appear in the Comment column.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="batch-decision-reason">Reason</Label>
            <Textarea
              id="batch-decision-reason"
              placeholder={
                batchAction === 'yes'
                  ? 'Brief reason for approving these rebates…'
                  : 'Explain why these rebates are rejected…'
              }
              value={batchReason}
              onChange={(e) => setBatchReason(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-gray-500">Required for both bulk approve and bulk reject.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBatchAction(null);
                setBatchReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              className={
                batchAction === 'yes'
                  ? 'bg-[#6DB27F] hover:bg-[#5da170]'
                  : undefined
              }
              variant={batchAction === 'no' ? 'destructive' : 'default'}
              onClick={handleConfirmBatchAction}
            >
              {batchAction === 'yes' ? 'Approve selected' : 'Reject selected'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
