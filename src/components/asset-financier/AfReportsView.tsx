import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DateInput } from '../ui/date-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowUpDown, Filter, FileSpreadsheet, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  AF_METRIC_LABELS,
  AF_METRIC_REPORT_TITLES,
  AF_MOCK_REBATE_RECORDS,
  AfMetricCategory,
  AfRebateRecord,
  afRebateRowsForExport,
  recordMatchesMetric,
} from '../../utils/afRebateData';
import { exportReportToExcel, exportReportToPdf } from '../../utils/reportExport';
import {
  ALL_EMOTO_PROVIDERS_LABEL,
  ALL_RETROFIT_ASSEMBLERS_LABEL,
  ALL_STATUSES_LABEL,
  FILTER_LABELS,
  GENDER_FILTER_OPTIONS,
  matchesGenderFilter,
  matchesVehicleTypeFilter,
  VEHICLE_TYPE_FILTER_OPTIONS,
} from '../../utils/filterLabels';
import { RebateApplicationDetailsPage } from './RebateApplicationDetailsPage';
import { AfRebateReportTable } from './AfRebateReportTable';

interface AfReportsViewProps {
  initialCategory?: AfMetricCategory;
  records?: AfRebateRecord[];
  onDetailOpenChange?: (open: boolean) => void;
  isMarketingAgent?: boolean;
  currentUserName?: string;
}

export function AfReportsView({
  initialCategory = 'all',
  records: externalRecords,
  onDetailOpenChange,
  isMarketingAgent = false,
  currentUserName,
}: AfReportsViewProps) {
  const [internalRecords] = useState(AF_MOCK_REBATE_RECORDS);
  const allRecords = externalRecords ?? internalRecords;
  // External Marketing users must only ever see rebates they personally originated.
  const records = useMemo(() => {
    if (!isMarketingAgent || !currentUserName) return allRecords;
    return allRecords.filter((r) => r.submittedBy.toLowerCase() === currentUserName.toLowerCase());
  }, [allRecords, isMarketingAgent, currentUserName]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AfMetricCategory>(initialCategory);
  const [providerFilter, setProviderFilter] = useState('all');
  const [assemblerFilter, setAssemblerFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<AfRebateRecord | null>(null);

  useEffect(() => {
    onDetailOpenChange?.(selected !== null);
  }, [selected, onDetailOpenChange]);

  useEffect(() => {
    setStatusFilter(initialCategory);
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
        if (!recordMatchesMetric(r, statusFilter)) return false;
        if (providerFilter !== 'all' && r.supplier !== providerFilter) return false;
        if (assemblerFilter !== 'all' && (r.retrofitAssembler || 'N/A') !== assemblerFilter) return false;
        if (!matchesGenderFilter(r.isWoman, genderFilter)) return false;
        if (!matchesVehicleTypeFilter(r.isRetrofit, vehicleTypeFilter)) return false;
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
    statusFilter,
    providerFilter,
    assemblerFilter,
    genderFilter,
    vehicleTypeFilter,
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

  const isFiltered =
    query !== '' ||
    statusFilter !== 'all' ||
    providerFilter !== 'all' ||
    assemblerFilter !== 'all' ||
    genderFilter !== 'all' ||
    vehicleTypeFilter !== 'all' ||
    dateFrom !== '' ||
    dateTo !== '';

  const clearFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setProviderFilter('all');
    setAssemblerFilter('all');
    setGenderFilter('all');
    setVehicleTypeFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const reportTitle = `Report: ${AF_METRIC_REPORT_TITLES[statusFilter]} (${filtered.length})`;

  const handleDownloadExcel = () => {
    if (filtered.length === 0) {
      toast.error('No rebates to include in the report.');
      return;
    }
    const { columns, rows } = afRebateRowsForExport(filtered, true);
    exportReportToExcel({ filename: 'af-all-rebates-report', title: reportTitle, columns, rows });
    toast.success('Excel report downloaded');
  };

  const handleDownloadPdf = () => {
    if (filtered.length === 0) {
      toast.error('No rebates to include in the report.');
      return;
    }
    const { columns, rows } = afRebateRowsForExport(filtered, true);
    exportReportToPdf({ filename: 'af-all-rebates-report', title: reportTitle, columns, rows });
    toast.success('PDF report downloaded');
  };

  return (
    <div className="space-y-6 max-w-full">
      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">All Rebates</h2>
        <p className="text-gray-600 mt-1 text-sm">
          View every rebate in your portfolio — submitted, unsubmitted, approved, and disbursed. Use the filters
          below to narrow by status, time period, e-moto company, retrofit assembler, women, or retrofits.
        </p>
      </div>

      <Card className="max-w-full print:hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters &amp; Sort
            </CardTitle>
            {isFiltered && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-gray-600 hover:text-gray-900"
                onClick={clearFilters}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <DateInput value={dateFrom} onChange={setDateFrom} />
            <DateInput value={dateTo} onChange={setDateTo} />
            <Input
              placeholder="Search ticket, applicant, originator…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AfMetricCategory)}>
              <SelectTrigger>
                <SelectValue placeholder={FILTER_LABELS.status} />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(AF_METRIC_LABELS) as AfMetricCategory[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {key === 'all' ? ALL_STATUSES_LABEL : AF_METRIC_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger>
                <SelectValue placeholder={FILTER_LABELS.eMotoProvider} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{ALL_EMOTO_PROVIDERS_LABEL}</SelectItem>
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
                <SelectValue placeholder={FILTER_LABELS.retrofitAssembler} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{ALL_RETROFIT_ASSEMBLERS_LABEL}</SelectItem>
                {assemblers.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger>
                <SelectValue placeholder={FILTER_LABELS.gender} />
              </SelectTrigger>
              <SelectContent>
                {GENDER_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder={FILTER_LABELS.vehicleType} />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_TYPE_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4" />
            Report: {AF_METRIC_REPORT_TITLES[statusFilter]} ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full max-w-full overflow-x-auto px-4 sm:px-6 pb-6">
          <AfRebateReportTable rows={filtered} onOpen={setSelected} showStatus />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 print:hidden">
        <Button variant="outline" onClick={handleDownloadPdf}>
          <FileText className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button className="bg-[#023F40] hover:bg-[#035f60]" onClick={handleDownloadExcel}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Download Excel
        </Button>
      </div>
    </div>
  );
}
