import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { formatDisplayDate } from '../../utils/dateFormat';
import { formatNumber, formatRwfAmount } from '../../utils/numberFormat';
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
import { FileText, Send } from 'lucide-react';
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
import { Textarea } from '../ui/textarea';
import { matchesGenderFilter, matchesVehicleTypeFilter } from '../../utils/filterLabels';
import { QA_DEFAULT_FILTER_VALUES, QaStandardFilters } from './QaStandardFilters';
import { exportReportToExcel, exportReportToPdf, ReportColumn } from '../../utils/reportExport';

const AF_CHART_COLORS = ['#023F40', '#6DB27F', '#047a7c', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

type CfoRequestRow = {
  af: string;
  ticket: string;
  applicant: string;
  woman: boolean;
  retrofit: boolean;
  provider: string;
  assembler: string;
  retailCost: number;
  amount: number;
  rebatePercent: string;
  afSubmittedAt: string;
  rebateVerifiedAt: string;
  qaApprovedAt: string;
  hasPossession: boolean;
};

const MOCK_CFO_REQUEST_ROWS: CfoRequestRow[] = [
  {
    af: 'Bboxx',
    ticket: 'AF-BBX-1',
    applicant: 'Jean Claude Ndayisaba',
    woman: false,
    retrofit: false,
    provider: 'Spiro',
    assembler: 'N/A',
    retailCost: 3500000,
    amount: 630000,
    rebatePercent: '18%',
    afSubmittedAt: '2026-05-10T09:00:00Z',
    rebateVerifiedAt: '2026-05-14T11:00:00Z',
    qaApprovedAt: '2026-05-20T10:00:00Z',
    hasPossession: true,
  },
  {
    af: 'Bboxx',
    ticket: 'AF-BBX-4',
    applicant: 'Jean HABIMANA',
    woman: false,
    retrofit: false,
    provider: 'Ampersand',
    assembler: 'N/A',
    retailCost: 3400000,
    amount: 612000,
    rebatePercent: '18%',
    afSubmittedAt: '2026-05-12T09:00:00Z',
    rebateVerifiedAt: '2026-05-16T11:00:00Z',
    qaApprovedAt: '2026-05-21T10:00:00Z',
    hasPossession: true,
  },
  {
    af: 'Jali',
    ticket: 'AF-JAL-14',
    applicant: 'Grace UWASE',
    woman: true,
    retrofit: true,
    provider: 'Spiro',
    assembler: 'REM',
    retailCost: 2800000,
    amount: 700000,
    rebatePercent: '25%',
    afSubmittedAt: '2026-05-08T09:00:00Z',
    rebateVerifiedAt: '2026-05-13T11:00:00Z',
    qaApprovedAt: '2026-05-19T10:00:00Z',
    hasPossession: true,
  },
  {
    af: 'Watu',
    ticket: 'AF-WAT-21',
    applicant: 'Alice Mutoni',
    woman: true,
    retrofit: false,
    provider: 'Ampersand',
    assembler: 'N/A',
    retailCost: 3600000,
    amount: 900000,
    rebatePercent: '25%',
    afSubmittedAt: '2026-05-15T09:00:00Z',
    rebateVerifiedAt: '2026-05-18T11:00:00Z',
    qaApprovedAt: '2026-05-22T10:00:00Z',
    hasPossession: true,
  },
  {
    af: 'Bank of Kigali',
    ticket: 'AF-BOK-1',
    applicant: 'Patrick N',
    woman: false,
    retrofit: false,
    provider: 'Ampersand',
    assembler: 'N/A',
    retailCost: 3500000,
    amount: 630000,
    rebatePercent: '18%',
    afSubmittedAt: '2026-06-10T09:00:00Z',
    rebateVerifiedAt: '2026-06-12T11:00:00Z',
    qaApprovedAt: '2026-06-14T10:00:00Z',
    hasPossession: true,
  },
  {
    af: 'REM',
    ticket: 'AF-REM-8',
    applicant: 'Eric Habimana',
    woman: false,
    retrofit: true,
    provider: 'Rem',
    assembler: 'Rem',
    retailCost: 2800000,
    amount: 560000,
    rebatePercent: '20%',
    afSubmittedAt: '2026-05-18T09:00:00Z',
    rebateVerifiedAt: '2026-05-29T11:00:00Z',
    qaApprovedAt: '2026-06-01T10:00:00Z',
    hasPossession: true,
  },
];

interface WeeklyDisbursementReportProps {
  mode?: 'cfo-authorization' | 'af-notification';
}

export function WeeklyDisbursementReport({ mode = 'cfo-authorization' }: WeeklyDisbursementReportProps) {
  const [query, setQuery] = useState('');
  const [filterAf, setFilterAf] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterVehicleType, setFilterVehicleType] = useState('all');
  const [filterProvider, setFilterProvider] = useState('all');
  const [filterAssembler, setFilterAssembler] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState(QA_DEFAULT_FILTER_VALUES.sortBy);
  const [noteToCfo, setNoteToCfo] = useState('');
  const [submitOpen, setSubmitOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [printWithSignature, setPrintWithSignature] = useState(false);
  const [printFormat, setPrintFormat] = useState<'pdf' | 'excel'>('pdf');
  const [submitted, setSubmitted] = useState(false);

  const eligibleRows = useMemo(
    () => MOCK_CFO_REQUEST_ROWS.filter((r) => r.hasPossession),
    []
  );

  const afs = Array.from(new Set(eligibleRows.map((r) => r.af))).sort();
  const providers = Array.from(new Set(eligibleRows.map((r) => r.provider))).sort();
  const assemblers = Array.from(
    new Set(eligibleRows.map((r) => r.assembler).filter((a) => a && a !== 'N/A'))
  ).sort();

  const filteredRows = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom).getTime() : 0;
    const to = dateTo ? new Date(dateTo).getTime() + 86400000 - 1 : Number.MAX_SAFE_INTEGER;
    const list = eligibleRows.filter((r) => {
      const submittedAt = new Date(r.afSubmittedAt).getTime();
      if (submittedAt < from || submittedAt > to) return false;
      const q = query.toLowerCase();
      if (q && !r.ticket.toLowerCase().includes(q) && !r.applicant.toLowerCase().includes(q)) return false;
      if (filterAf !== 'all' && r.af !== filterAf) return false;
      if (!matchesGenderFilter(r.woman, filterGender)) return false;
      if (!matchesVehicleTypeFilter(r.retrofit, filterVehicleType)) return false;
      if (filterProvider !== 'all' && r.provider !== filterProvider) return false;
      if (filterAssembler !== 'all' && r.assembler !== filterAssembler) return false;
      if (filterStatus === 'no-possession' && r.hasPossession) return false;
      if (filterStatus === 'approved' || filterStatus === 'disbursed') {
        // CFO request rows are QA-approved with possession; treat as approved.
        if (filterStatus === 'disbursed') return false;
      } else if (filterStatus === 'submitted' || filterStatus === 'in-process' || filterStatus === 'rejected') {
        return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'amount-high') return b.amount - a.amount;
      return new Date(a.afSubmittedAt).getTime() - new Date(b.afSubmittedAt).getTime();
    });
  }, [
    eligibleRows,
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
  ]);

  const total = filteredRows.reduce((s, r) => s + r.amount, 0);
  const byAf = useMemo(() => {
    const map = new Map<string, { count: number; amount: number }>();
    for (const r of filteredRows) {
      const entry = map.get(r.af) || { count: 0, amount: 0 };
      entry.count += 1;
      entry.amount += r.amount;
      map.set(r.af, entry);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([af, v]) => ({ name: af, count: v.count, amount: Math.round(v.amount) }));
  }, [filteredRows]);

  const dateRangeLabel =
    dateFrom && dateTo
      ? `${formatDisplayDate(dateFrom)} – ${formatDisplayDate(dateTo)}`
      : dateFrom
        ? `From ${formatDisplayDate(dateFrom)}`
        : dateTo
          ? `Until ${formatDisplayDate(dateTo)}`
          : 'All dates';

  const disbursementReportColumns: ReportColumn[] = [
    { header: 'Ticket No.', key: 'ticket' },
    { header: 'Applicant Name', key: 'applicant' },
    { header: 'Gender', key: 'gender' },
    { header: 'Retrofit', key: 'retrofit' },
    { header: 'Asset Financier', key: 'af' },
    { header: 'E-Moto Provider', key: 'provider' },
    { header: 'Retrofit Assembler', key: 'assembler' },
    { header: 'E-Moto Retail Cost (RWF)', key: 'retailCost' },
    { header: 'Rebate Amount (RWF)', key: 'amount' },
    { header: 'Rebate Percentage (%)', key: 'rebatePercent' },
    { header: 'Date of AF Submission', key: 'afSubmittedAt' },
    { header: 'Date of Rebate Team Verification', key: 'rebateVerifiedAt' },
    { header: 'Date of QA Team Approval', key: 'qaApprovedAt' },
  ];

  const buildDisbursementReportRows = () =>
    filteredRows.map((r) => ({
      ticket: r.ticket,
      applicant: r.applicant,
      gender: r.woman ? 'Woman' : 'Man',
      retrofit: r.retrofit ? 'Yes' : 'No',
      af: r.af,
      provider: r.provider,
      assembler: r.assembler,
      retailCost: r.retailCost,
      amount: r.amount,
      rebatePercent: r.rebatePercent,
      afSubmittedAt: formatDisplayDate(r.afSubmittedAt),
      rebateVerifiedAt: formatDisplayDate(r.rebateVerifiedAt),
      qaApprovedAt: formatDisplayDate(r.qaApprovedAt),
    }));

  const CFO_SIGNATURE_LINES = [
    'QA Team Lead — Name & Signature',
    'Designated Finance Officer — Name & Signature',
    'CFO / E-Moto Program Manager — Name & Signature',
  ];

  const exportExcel = (withSignature: boolean) => {
    exportReportToExcel({
      filename: `cfo_disbursement_request_${dateFrom}_${dateTo}${withSignature ? '_signature' : ''}`,
      title: `Request for CFO Disbursement Approval — ${dateRangeLabel}`,
      columns: disbursementReportColumns,
      rows: buildDisbursementReportRows(),
    });
    toast.success('Excel disbursement report downloaded', {
      description: withSignature
        ? 'Include signature page when circulating for CFO approval.'
        : 'Each AF can be sent their approved rebate list separately.',
    });
  };

  const exportPdf = (withSignature: boolean) => {
    exportReportToPdf({
      filename: `cfo_disbursement_request_${dateFrom}_${dateTo}${withSignature ? '_signature' : ''}`,
      title: `Request for CFO Disbursement Approval — ${dateRangeLabel}`,
      columns: disbursementReportColumns,
      rows: buildDisbursementReportRows(),
      signatureLines: withSignature ? CFO_SIGNATURE_LINES : undefined,
    });
    toast.success('PDF disbursement report downloaded', {
      description: withSignature
        ? 'Signature page included for CFO approval.'
        : 'Each AF can be sent their approved rebate list separately.',
    });
  };

  const openSubmitDialog = () => {
    if (filteredRows.length === 0) {
      toast.error('No rebates to include in the disbursement request.');
      return;
    }
    setSubmitOpen(true);
  };

  const confirmSubmit = () => {
    setSubmitOpen(false);
    setSubmitted(true);
    toast.success('Disbursement request submitted to CFO', {
      description: `RWF ${Math.round(total).toLocaleString()} across ${filteredRows.length} rebate(s)${
        noteToCfo.trim() ? ' — note included' : ''
      }.`,
    });
  };

  const openPrintDialog = () => {
    if (filteredRows.length === 0) {
      toast.error('No rebates to include in the disbursement report.');
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
    exportPdf(printWithSignature);
  };

  if (mode === 'af-notification') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg text-[#023F40]">AF Disbursement Notification</h2>
        <p className="text-sm text-gray-600">
          After CFO approval, Asset Financiers are notified and can withdraw authorized rebate funds.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="print:text-center">
        <p className="text-xs uppercase tracking-wide text-gray-500">Rebate Quality Assurance Team</p>
        <h2 className="text-lg sm:text-xl text-[#023F40] font-semibold">
          Request for CFO Disbursement Approval
        </h2>
        <p className="text-sm text-gray-600 mt-2 max-w-4xl print:max-w-none print:mx-auto">
          Lists QA-approved rebates with E-Moto Possession confirmation for CFO disbursement approval. After
          approval, Asset Financiers are notified and may withdraw authorized funds. Only rebates with a
          possession statement are included.
        </p>
        <p className="hidden print:block text-xs text-gray-500 mt-2">
          Rebates Approved by RGF Rebate Quality Assurance Team — Date range: {dateRangeLabel}
        </p>
      </div>

      <p className="text-sm text-gray-600 print:hidden">
        Showing approved rebates for <span className="font-medium text-[#023F40]">{dateRangeLabel}</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Approved rebates requesting CFO disbursement</p>
            <p className="text-2xl font-bold text-[#023F40]">{filteredRows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">
              Total approved rebates requesting CFO disbursement (RWF)
            </p>
            <p className="text-2xl font-bold text-[#023F40]">{Math.round(total).toLocaleString()}</p>
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
              <PieChart id="cfo-request-af-count-pie">
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
                      key={`cfo-af-count-${entry.name}`}
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
            <p className="text-sm text-gray-500">Total rebate value requesting disbursement (RWF)</p>
          </div>
          {byAf.length === 0 ? (
            <p className="text-sm text-gray-500 py-10 text-center">No rebates in range</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={byAf}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                id="cfo-request-af-value-bar"
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
        financiers={afs}
        providers={providers}
        assemblers={assemblers}
        showingCount={filteredRows.length}
        totalCount={eligibleRows.length}
        showingLabel="possession-confirmed rebates for CFO disbursement"
      />

      <Card className="print:shadow-none print:border-0">
        <CardHeader>
          <CardTitle className="text-base text-[#023F40]">
            Approved rebates with E-Moto Possession — {dateRangeLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {filteredRows.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-600">
              No rebates match the filters. Only QA-approved rebates with possession are listed.
            </div>
          ) : (
            <table className="w-full min-w-[1400px] text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="pb-2 pr-3 font-medium">Ticket No.</th>
                  <th className="pb-2 pr-3 font-medium">Date of AF Submission</th>
                  <th className="pb-2 pr-3 font-medium">Date of Rebate Team Verification</th>
                  <th className="pb-2 pr-3 font-medium">Date of QA Team Approval</th>
                  <th className="pb-2 pr-3 font-medium">Applicant Name</th>
                  <th className="pb-2 pr-3 font-medium">Gender</th>
                  <th className="pb-2 pr-3 font-medium">Retrofit</th>
                  <th className="pb-2 pr-3 font-medium">Asset Financier</th>
                  <th className="pb-2 pr-3 font-medium">E-Moto Provider</th>
                  <th className="pb-2 pr-3 font-medium">Retrofit Assembler</th>
                  <th className="pb-2 pr-3 font-medium">E-Moto Retail Cost (RWF)</th>
                  <th className="pb-2 pr-3 font-medium">Rebate Amount (RWF)</th>
                  <th className="pb-2 font-medium">Rebate Percentage (%)</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.ticket} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-semibold text-[#023F40]">{r.ticket}</td>
                    <td className="py-2 pr-3">{formatDisplayDate(r.afSubmittedAt)}</td>
                    <td className="py-2 pr-3">{formatDisplayDate(r.rebateVerifiedAt)}</td>
                    <td className="py-2 pr-3">{formatDisplayDate(r.qaApprovedAt)}</td>
                    <td className="py-2 pr-3">{r.applicant}</td>
                    <td className="py-2 pr-3">{r.woman ? 'Woman' : 'Man'}</td>
                    <td className="py-2 pr-3">{r.retrofit ? 'Yes' : 'No'}</td>
                    <td className="py-2 pr-3">{r.af}</td>
                    <td className="py-2 pr-3">{r.provider}</td>
                    <td className="py-2 pr-3">{r.assembler}</td>
                    <td className="py-2 pr-3">{formatNumber(r.retailCost)}</td>
                    <td className="py-2 pr-3">{formatNumber(r.amount)}</td>
                    <td className="py-2">{r.rebatePercent}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td colSpan={12} className="py-3 text-right pr-3">
                    Total for Approval{filterAf !== 'all' ? ` (${filterAf})` : ''}
                  </td>
                  <td className="py-3">{formatRwfAmount(total)}</td>
                  <td className="py-3" />
                </tr>
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4 print:hidden">
        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 space-y-3">
          <div>
            <p className="text-sm font-medium text-[#023F40]">Submit request to CFO</p>
            <p className="text-sm text-gray-600 mt-1">
              This sends the filtered list below — {filteredRows.length} possession-confirmed rebate(s)
              totaling <span className="font-medium text-[#023F40]">RWF {Math.round(total).toLocaleString()}</span>
              {' '}— to the CFO for disbursement authorization. Individual rebates were already approved on
              Decisions are captured on QA Team Review; this step only packages the total for CFO action.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note-to-cfo">Note to CFO (optional)</Label>
            <Textarea
              id="note-to-cfo"
              placeholder="Add context for the CFO — e.g. timing, AF coverage, or exceptions…"
              value={noteToCfo}
              onChange={(e) => setNoteToCfo(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button className="bg-[#6DB27F] hover:bg-[#5da170]" onClick={openSubmitDialog}>
              <Send className="w-4 h-4 mr-2" />
              {submitted ? 'Resubmit to CFO' : 'Submit to CFO'}
            </Button>
            <Button variant="outline" onClick={openPrintDialog}>
              <FileText className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            {submitted && (
              <span className="text-sm text-[#6DB27F] font-medium">Submitted for CFO review</span>
            )}
          </div>
        </div>
      </div>

      {noteToCfo.trim() && (
        <div className="hidden print:block text-sm border border-gray-300 p-3 rounded">
          <p className="font-semibold text-[#023F40] mb-1">Note to CFO</p>
          <p className="whitespace-pre-wrap">{noteToCfo.trim()}</p>
        </div>
      )}

      {printWithSignature && (
        <div className="hidden print:block mt-10 space-y-6 text-sm">
          <p className="font-semibold text-[#023F40]">CFO Authorization Signature Page</p>
          {['CFO', 'QA Lead', 'Witness'].map((name) => (
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

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit disbursement request to CFO</DialogTitle>
            <DialogDescription>
              Confirm sending this package for CFO disbursement authorization. Individual rebates on this list
              were already approved by QA; this submits the total for funding action.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-600">Rebates:</span>{' '}
              <span className="font-medium">{filteredRows.length}</span>
            </p>
            <p>
              <span className="text-gray-600">Total amount:</span>{' '}
              <span className="font-medium text-[#023F40]">
                RWF {Math.round(total).toLocaleString()}
              </span>
            </p>
            <p>
              <span className="text-gray-600">Period:</span>{' '}
              <span className="font-medium">{dateRangeLabel}</span>
            </p>
            {noteToCfo.trim() ? (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-600 mb-1">Note to CFO</p>
                <p className="whitespace-pre-wrap">{noteToCfo.trim()}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-500">No note to CFO included.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#6DB27F] hover:bg-[#5da170]" onClick={confirmSubmit}>
              <Send className="w-4 h-4 mr-2" />
              Confirm submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download Approved Disbursement Report</DialogTitle>
            <DialogDescription>
              Labeled as rebates approved by the RGF Rebate QA Team. Date range appears at the top. Download as PDF
              or Excel; each AF can receive their approved list and amounts.
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
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrintOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#6DB27F] hover:bg-[#5da170]" onClick={confirmPrint}>
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
