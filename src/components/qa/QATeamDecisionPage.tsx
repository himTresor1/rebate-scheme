import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { formatDisplayDate } from '../../utils/dateFormat';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { FileSpreadsheet, FileText } from 'lucide-react';
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
import { matchesGenderFilter, matchesVehicleTypeFilter } from '../../utils/filterLabels';
import { QA_DEFAULT_FILTER_VALUES, QaStandardFilters } from './QaStandardFilters';
import { exportReportToExcel, exportReportToPdf, ReportColumn } from '../../utils/reportExport';

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
  const [query, setQuery] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [filterVehicleType, setFilterVehicleType] = useState('all');
  const [filterProvider, setFilterProvider] = useState('all');
  const [filterAssembler, setFilterAssembler] = useState('all');
  const [filterAf, setFilterAf] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState(QA_DEFAULT_FILTER_VALUES.sortBy);
  const [rejectRowTarget, setRejectRowTarget] = useState<string | null>(null);
  const [rejectRowReason, setRejectRowReason] = useState('');

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
    const list = rows.filter((r) => {
      const submitted = new Date(r.afSubmittedAt).getTime();
      if (submitted < from || submitted > to) return false;
      const q = query.toLowerCase();
      if (q && !r.ticket.toLowerCase().includes(q) && !r.applicant.toLowerCase().includes(q)) return false;
      if (filterAf !== 'all' && r.af !== filterAf) return false;
      if (!matchesGenderFilter(r.woman, filterGender)) return false;
      if (!matchesVehicleTypeFilter(r.retrofit, filterVehicleType)) return false;
      if (filterProvider !== 'all' && r.provider !== filterProvider) return false;
      if (filterAssembler !== 'all' && r.assembler !== filterAssembler) return false;

      const decision = decisions[r.id]?.decision;
      if (filterStatus === 'no-possession' && r.hasPossession) return false;
      if (filterStatus === 'in-process' && decision) return false;
      if (filterStatus === 'approved' && decision !== 'yes') return false;
      if (filterStatus === 'rejected' && decision !== 'no') return false;
      if (filterStatus === 'submitted') return false;
      if (filterStatus === 'disbursed') return false;
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'amount-high') return b.rebateAmount - a.rebateAmount;
      return new Date(a.afSubmittedAt).getTime() - new Date(b.afSubmittedAt).getTime();
    });
  }, [
    rows,
    query,
    filterAf,
    filterGender,
    filterVehicleType,
    filterProvider,
    filterAssembler,
    filterStatus,
    dateFrom,
    dateTo,
    sortBy,
    decisions,
  ]);

  const totalAmount = filtered.reduce((s, r) => s + r.rebateAmount, 0);
  const withPossessionCount = filtered.filter((r) => r.hasPossession).length;
  const withoutPossessionCount = filtered.length - withPossessionCount;
  const possessionShare =
    filtered.length === 0 ? 0 : Math.round((withPossessionCount / filtered.length) * 100);

  const possessionOverview = [
    { name: 'With possession', count: withPossessionCount, fill: '#6DB27F' },
    { name: 'No possession yet', count: withoutPossessionCount, fill: '#023F40' },
  ].filter((d) => d.count > 0);

  const byAf = useMemo(() => {
    const map = new Map<string, { count: number; amount: number; withPossession: number; withoutPossession: number }>();
    for (const r of filtered) {
      const entry = map.get(r.af) || { count: 0, amount: 0, withPossession: 0, withoutPossession: 0 };
      entry.count += 1;
      entry.amount += r.rebateAmount;
      if (r.hasPossession) entry.withPossession += 1;
      else entry.withoutPossession += 1;
      map.set(r.af, entry);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([af, v]) => ({
        name: af,
        count: v.count,
        amount: Math.round(v.amount),
        withPossession: v.withPossession,
        withoutPossession: v.withoutPossession,
      }));
  }, [filtered]);

  const AF_CHART_COLORS = ['#023F40', '#6DB27F', '#047a7c', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

  const dateRangeLabel =
    dateFrom && dateTo
      ? `${formatDisplayDate(dateFrom)} – ${formatDisplayDate(dateTo)}`
      : dateFrom
        ? `From ${formatDisplayDate(dateFrom)}`
        : dateTo
          ? `Until ${formatDisplayDate(dateTo)}`
          : 'All dates';

  const handleApproveRow = (id: string, ticket: string) => {
    setDecisions((prev) => ({ ...prev, [id]: { decision: 'yes', comment: '' } }));
    toast.success(`Decision recorded: YES for ${ticket}`);
  };

  const openRejectRow = (id: string) => {
    setRejectRowTarget(id);
    setRejectRowReason('');
  };

  const handleConfirmRejectRow = () => {
    if (!rejectRowTarget) return;
    if (!rejectRowReason.trim()) {
      toast.error('A comment is required to reject this rebate.');
      return;
    }
    const ticket = filtered.find((r) => r.id === rejectRowTarget)?.ticket || rejectRowTarget;
    setDecisions((prev) => ({
      ...prev,
      [rejectRowTarget]: { decision: 'no', comment: rejectRowReason.trim() },
    }));
    setRejectRowTarget(null);
    setRejectRowReason('');
    toast.warning(`Decision recorded: NO for ${ticket}`);
  };

  const decisionReportColumns: ReportColumn[] = [
    { header: 'Ticket No.', key: 'ticket' },
    { header: 'Date of AF Submission', key: 'afSubmittedAt' },
    { header: 'Date of Rebate Team Verification', key: 'verifiedAt' },
    { header: 'Applicant Name', key: 'applicant' },
    { header: 'Gender', key: 'gender' },
    { header: 'Retrofit', key: 'retrofit' },
    { header: 'Asset Financier', key: 'af' },
    { header: 'E-Moto Provider', key: 'provider' },
    { header: 'Retrofit Assembler', key: 'assembler' },
    { header: 'E-Moto Retail Cost (RWF)', key: 'retailCost' },
    { header: 'Rebate Amount (RWF)', key: 'rebateAmount' },
    { header: 'Rebate Percentage (%)', key: 'rebatePercent' },
    { header: 'QA Team Decision [YES/NO]', key: 'decision' },
    { header: 'Comment (from ticket review)', key: 'comment' },
  ];

  const buildDecisionReportRows = () =>
    filtered.map((r) => {
      const d = decisions[r.id] || { decision: '', comment: '' };
      return {
        ticket: r.ticket,
        afSubmittedAt: formatDisplayDate(r.afSubmittedAt),
        verifiedAt: formatDisplayDate(r.verifiedAt),
        applicant: r.applicant,
        gender: r.woman ? 'Woman' : 'Man',
        retrofit: r.retrofit ? 'Yes' : 'No',
        af: r.af,
        provider: r.provider,
        assembler: r.assembler,
        retailCost: r.retailCost,
        rebateAmount: r.rebateAmount,
        rebatePercent: r.rebatePercent,
        decision: d.decision === 'yes' ? 'YES' : d.decision === 'no' ? 'NO' : '',
        comment: d.comment || '',
      };
    });

  const handleDownloadExcel = () => {
    if (filtered.length === 0) {
      toast.error('No rebates to include in the report.');
      return;
    }
    exportReportToExcel({
      filename: 'qa-approved-rebate-report',
      title: `Rebates Approved by RGF Rebate Quality Assurance Team — Date range: ${dateRangeLabel}`,
      columns: decisionReportColumns,
      rows: buildDecisionReportRows(),
    });
    toast.success('Excel report downloaded');
  };

  const handleDownloadPdf = () => {
    if (filtered.length === 0) {
      toast.error('No rebates to include in the report.');
      return;
    }
    exportReportToPdf({
      filename: 'qa-approved-rebate-report',
      title: `Rebates Approved by RGF Rebate Quality Assurance Team — Date range: ${dateRangeLabel}`,
      columns: decisionReportColumns,
      rows: buildDecisionReportRows(),
    });
    toast.success('PDF report downloaded');
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
          Rebate QA Team Review
        </h1>
        <p className="text-sm text-gray-600 mt-1 max-w-4xl print:max-w-none">
          Use this page in QA meetings to decide on rebates verified by the Rebate Team. Click a Ticket No. for
          full details and documents. Approved decisions feed the Approved Rebate Report for CFO disbursement.
        </p>
        <p className="hidden print:block text-xs text-gray-500 mt-2">
          Rebates Approved by RGF Rebate Quality Assurance Team — Date range: {dateRangeLabel}
        </p>
      </div>

      <p className="text-sm text-gray-600 print:hidden">
        Showing verified rebates for <span className="font-medium text-[#023F40]">{dateRangeLabel}</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-2">
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
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">With e-moto possession</p>
            <p className="text-2xl font-bold text-[#023F40]">{withPossessionCount}</p>
            <p className="text-xs text-gray-500 mt-1">{possessionShare}% of verified rebates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">No e-moto possession yet</p>
            <p className="text-2xl font-bold text-[#023F40]">{withoutPossessionCount}</p>
            <p className="text-xs text-gray-500 mt-1">Excluded from CFO disbursement until confirmed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-1">Rebates per Asset Financier</h3>
            <p className="text-sm text-gray-500">Number of Approved Rebates Awaiting Disbursement Authorization</p>
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
            <h3 className="font-semibold text-gray-900 mb-1">Rebate Amount per Asset Financier</h3>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-1">E-Moto Possession Overview</h3>
            <p className="text-sm text-gray-500">
              Possession status relative to verified rebates ({withPossessionCount} of {filtered.length} confirmed)
            </p>
          </div>
          {possessionOverview.length === 0 ? (
            <p className="text-sm text-gray-500 py-10 text-center">No rebates in range</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart id="qa-decision-possession-pie">
                <Pie
                  data={possessionOverview}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }: { name: string; count: number }) => `${name}: ${count}`}
                  outerRadius={100}
                  dataKey="count"
                  isAnimationActive={false}
                >
                  {possessionOverview.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
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
            <h3 className="font-semibold text-gray-900 mb-1">Possession by Asset Financier</h3>
            <p className="text-sm text-gray-500">With vs without e-moto possession confirmation</p>
          </div>
          {byAf.length === 0 ? (
            <p className="text-sm text-gray-500 py-10 text-center">No rebates in range</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={byAf}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                id="qa-decision-possession-af-bar"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis allowDecimals={false} stroke="#6b7280" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar
                  dataKey="withPossession"
                  name="With possession"
                  stackId="possession"
                  fill="#6DB27F"
                  radius={[0, 0, 0, 0]}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="withoutPossession"
                  name="No possession yet"
                  stackId="possession"
                  fill="#023F40"
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <QaStandardFilters
        values={{
          query,
          status: filterStatus,
          dateFrom,
          dateTo,
          gender: filterGender,
          vehicleType: filterVehicleType,
          assetFinancier: filterAf,
          eMotoProvider: filterProvider,
          retrofitAssembler: filterAssembler,
          sortBy,
        }}
        onChange={(patch) => {
          if (patch.query !== undefined) setQuery(patch.query);
          if (patch.status !== undefined) setFilterStatus(patch.status);
          if (patch.dateFrom !== undefined) setDateFrom(patch.dateFrom);
          if (patch.dateTo !== undefined) setDateTo(patch.dateTo);
          if (patch.gender !== undefined) setFilterGender(patch.gender);
          if (patch.vehicleType !== undefined) setFilterVehicleType(patch.vehicleType);
          if (patch.assetFinancier !== undefined) setFilterAf(patch.assetFinancier);
          if (patch.eMotoProvider !== undefined) setFilterProvider(patch.eMotoProvider);
          if (patch.retrofitAssembler !== undefined) setFilterAssembler(patch.retrofitAssembler);
          if (patch.sortBy !== undefined) setSortBy(patch.sortBy);
        }}
        financiers={financiers}
        providers={providers}
        assemblers={assemblers}
        showingCount={filtered.length}
        totalCount={rows.length}
        showingLabel="verified rebates for QA decision"
      />

      <Card className="print:shadow-none print:border-0">
        <CardHeader>
          <CardTitle className="text-base text-[#023F40]">
            Verified rebates for {dateRangeLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-600">No verified rebates match the filters.</div>
          ) : (
            <table className="w-full min-w-[1600px] text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="pb-2 pr-3 font-medium">Ticket No.</th>
                  <th className="pb-2 pr-3 font-medium">Date of AF Submission</th>
                  <th className="pb-2 pr-3 font-medium">Date of Rebate Team Verification</th>
                  <th className="pb-2 pr-3 font-medium">Applicant Name</th>
                  <th className="pb-2 pr-3 font-medium">Gender</th>
                  <th className="pb-2 pr-3 font-medium">Retrofit</th>
                  <th className="pb-2 pr-3 font-medium">Asset Financier</th>
                  <th className="pb-2 pr-3 font-medium">E-Moto Provider</th>
                  <th className="pb-2 pr-3 font-medium">Retrofit Assembler</th>
                  <th className="pb-2 pr-3 font-medium">E-Moto Retail Cost (RWF)</th>
                  <th className="pb-2 pr-3 font-medium">Rebate Amount (RWF)</th>
                  <th className="pb-2 pr-3 font-medium">Rebate Percentage (%)</th>
                  <th className="pb-2 pr-3 font-medium">QA Team Decision [YES/NO]</th>
                  <th className="pb-2 pr-3 font-medium">Comment (from ticket review)</th>
                  <th className="pb-2 font-medium print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const d = decisions[r.id] || { decision: '', comment: '' };
                  return (
                    <tr key={r.id} className="border-b align-top">
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
                      <td className="py-2 pr-3">{r.woman ? 'Woman' : 'Man'}</td>
                      <td className="py-2 pr-3">{r.retrofit ? 'Yes' : 'No'}</td>
                      <td className="py-2 pr-3">{r.af}</td>
                      <td className="py-2 pr-3">{r.provider}</td>
                      <td className="py-2 pr-3">{r.assembler}</td>
                      <td className="py-2 pr-3">{formatNumber(r.retailCost)}</td>
                      <td className="py-2 pr-3">{formatNumber(r.rebateAmount)}</td>
                      <td className="py-2 pr-3">{r.rebatePercent}</td>
                      <td className="py-2 pr-3">
                        {d.decision === 'yes' ? 'YES' : d.decision === 'no' ? 'NO' : '—'}
                      </td>
                      <td className="py-2 pr-3 max-w-[220px]">
                        <span className={d.comment ? 'text-gray-800' : 'text-gray-400'}>
                          {d.comment || '—'}
                        </span>
                      </td>
                      <td className="py-2 print:hidden">
                        {d.decision ? (
                          <span className="text-xs text-gray-400">Done</span>
                        ) : (
                          <div className="flex gap-2 whitespace-nowrap">
                            <Button
                              size="sm"
                              className="h-7 bg-[#6DB27F] hover:bg-[#5da170]"
                              onClick={() => handleApproveRow(r.id, r.ticket)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7"
                              onClick={() => openRejectRow(r.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
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

      <div className="flex flex-wrap items-end justify-end gap-2 print:hidden">
        <Button variant="outline" onClick={handleDownloadPdf}>
          <FileText className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button className="bg-[#6DB27F] hover:bg-[#5da170]" onClick={handleDownloadExcel}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Download Excel
        </Button>
      </div>

      <Dialog
        open={!!rejectRowTarget}
        onOpenChange={(open) => {
          if (!open) {
            setRejectRowTarget(null);
            setRejectRowReason('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject rebate (NO)</DialogTitle>
            <DialogDescription>
              A comment is required and will appear in the Comment column.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-row-reason">Comment</Label>
            <Textarea
              id="reject-row-reason"
              placeholder="Explain why this rebate is rejected…"
              value={rejectRowReason}
              onChange={(e) => setRejectRowReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectRowTarget(null);
                setRejectRowReason('');
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmRejectRow}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
