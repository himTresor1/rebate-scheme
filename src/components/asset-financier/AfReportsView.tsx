import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowUpDown, Filter, Printer } from 'lucide-react';
import { toast } from 'sonner';
import {
  AF_METRIC_LABELS,
  AF_MOCK_REBATE_RECORDS,
  AF_STATUS_DISPLAY,
  AfMetricCategory,
  AfRebateRecord,
  AfRebateStatus,
  recordMatchesMetric,
} from '../../utils/afRebateData';
import { RebateApplicationDetailsPage } from './RebateApplicationDetailsPage';
import { AfRebateReportTable } from './AfRebateReportTable';

interface AfReportsViewProps {
  initialCategory?: AfMetricCategory;
  records?: AfRebateRecord[];
  onDetailOpenChange?: (open: boolean) => void;
}

export function AfReportsView({
  initialCategory = 'all',
  records: externalRecords,
  onDetailOpenChange,
}: AfReportsViewProps) {
  const [internalRecords] = useState(AF_MOCK_REBATE_RECORDS);
  const records = externalRecords ?? internalRecords;
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AfMetricCategory>(initialCategory);
  const [statusFilter, setStatusFilter] = useState<AfRebateStatus | 'all'>('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [assemblerFilter, setAssemblerFilter] = useState('all');
  const [womanFilter, setWomanFilter] = useState('all');
  const [retrofitFilter, setRetrofitFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<AfRebateRecord | null>(null);

  useEffect(() => {
    onDetailOpenChange?.(selected !== null);
  }, [selected, onDetailOpenChange]);

  useEffect(() => {
    setCategoryFilter(initialCategory);
  }, [initialCategory]);

  const providers = useMemo(
    () => Array.from(new Set(records.map((r) => r.supplier).filter(Boolean))).sort(),
    [records]
  );
  const assemblers = useMemo(
    () =>
      Array.from(new Set(records.map((r) => r.retrofitAssembler).filter(Boolean) as string[])).sort(),
    [records]
  );

  const filtered = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom).getTime() : 0;
    const to = dateTo ? new Date(dateTo).getTime() + 86400000 - 1 : Number.MAX_SAFE_INTEGER;
    const q = query.trim().toLowerCase();

    return records
      .filter((r) => {
        if (!recordMatchesMetric(r, categoryFilter)) return false;
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        if (providerFilter !== 'all' && r.supplier !== providerFilter) return false;
        if (assemblerFilter !== 'all' && (r.retrofitAssembler || 'N/A') !== assemblerFilter) return false;
        if (womanFilter === 'yes' && !r.isWoman) return false;
        if (womanFilter === 'no' && r.isWoman) return false;
        if (retrofitFilter === 'yes' && !r.isRetrofit) return false;
        if (retrofitFilter === 'no' && r.isRetrofit) return false;
        const submitted = new Date(r.submittedAt).getTime();
        if (submitted < from || submitted > to) return false;
        if (
          q &&
          !r.ticketNumber.toLowerCase().includes(q) &&
          !r.firstName.toLowerCase().includes(q) &&
          !r.lastName.toLowerCase().includes(q) &&
          !r.submittedBy.toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
  }, [
    records,
    categoryFilter,
    statusFilter,
    providerFilter,
    assemblerFilter,
    womanFilter,
    retrofitFilter,
    dateFrom,
    dateTo,
    query,
  ]);

  if (selected) {
    return (
      <RebateApplicationDetailsPage
        data={selected}
        variant="af-submitted"
        onBack={() => setSelected(null)}
      />
    );
  }

  const handlePrint = () => {
    if (filtered.length === 0) {
      toast.error('No rebates to include in the report.');
      return;
    }
    toast.info('Opening print view…');
    setTimeout(() => window.print(), 150);
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">All Rebates</h2>
        <p className="text-gray-600 mt-1 text-sm">
          View every rebate in your portfolio — submitted, unsubmitted, approved, and disbursed. Use the filters
          below to narrow by status, time period, e-moto company, retrofit assembler, women, or retrofits.
        </p>
      </div>

      <Card className="max-w-full print:hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters &amp; Sort
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            <Input
              placeholder="Search ticket, applicant, originator…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AfRebateStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {(Object.keys(AF_STATUS_DISPLAY) as AfRebateStatus[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {AF_STATUS_DISPLAY[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as AfMetricCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Report category" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(AF_METRIC_LABELS) as AfMetricCategory[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {AF_METRIC_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
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
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={assemblerFilter} onValueChange={setAssemblerFilter}>
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
            <Select value={womanFilter} onValueChange={setWomanFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Women" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All applicants</SelectItem>
                <SelectItem value="yes">Women only</SelectItem>
                <SelectItem value="no">Non-women</SelectItem>
              </SelectContent>
            </Select>
            <Select value={retrofitFilter} onValueChange={setRetrofitFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Retrofit" />
              </SelectTrigger>
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
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4" />
            All rebates report ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full max-w-full overflow-x-auto px-4 sm:px-6 pb-6">
          <AfRebateReportTable rows={filtered} onOpen={setSelected} showStatus />
        </CardContent>
      </Card>

      <div className="flex justify-end print:hidden">
        <Button className="bg-[#023F40] hover:bg-[#035f60]" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print Report
        </Button>
      </div>
    </div>
  );
}
