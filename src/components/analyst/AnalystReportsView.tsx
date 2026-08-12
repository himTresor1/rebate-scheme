import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DateInput } from '../ui/date-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowUpDown, Filter, FileSpreadsheet, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  ANALYST_METRIC_LABELS,
  ANALYST_METRIC_REPORT_TITLES,
  ANALYST_MOCK_REBATE_RECORDS,
  ANALYST_STATUS_DISPLAY,
  AnalystMetricCategory,
  AnalystRebateRecord,
  AnalystVerificationStatus,
  analystRebateRowsForExport,
  recordMatchesMetric,
} from '../../utils/analystRebateData';
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
import { AnalystRebateReportTable } from './AnalystRebateReportTable';
import { ApplicationReviewEnhanced } from './ApplicationReviewEnhanced';
import { User } from '../../utils/auth';

interface AnalystReportsViewProps {
  user: User;
  initialCategory?: AnalystMetricCategory;
  records?: AnalystRebateRecord[];
}

export function AnalystReportsView({
  user,
  initialCategory = 'not-yet-verified',
  records: externalRecords,
}: AnalystReportsViewProps) {
  const [internalRecords] = useState(ANALYST_MOCK_REBATE_RECORDS);
  const records = externalRecords ?? internalRecords;
  type StatusFilter = AnalystMetricCategory | `vs:${AnalystVerificationStatus}`;

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialCategory);
  const [providerFilter, setProviderFilter] = useState('all');
  const [assemblerFilter, setAssemblerFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<AnalystRebateRecord | null>(null);

  useEffect(() => {
    setStatusFilter(initialCategory);
  }, [initialCategory]);

  const reportCategory = statusFilter.startsWith('vs:')
    ? 'all'
    : (statusFilter as AnalystMetricCategory);

  const providers = useMemo(
    () =>
      Array.from(
        new Set(records.filter((r) => !r.isRetrofit).map((r) => r.eMotoProvider).filter(Boolean))
      ).sort(),
    [records]
  );
  const assemblers = useMemo(
    () =>
      Array.from(
        new Set(records.map((r) => r.retrofitAssembler).filter(Boolean) as string[])
      ).sort(),
    [records]
  );

  const filtered = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom).getTime() : 0;
    const to = dateTo ? new Date(dateTo).getTime() + 86400000 - 1 : Number.MAX_SAFE_INTEGER;
    const q = query.trim().toLowerCase();

    return records
      .filter((r) => {
        if (statusFilter.startsWith('vs:')) {
          const vs = statusFilter.slice(3) as AnalystVerificationStatus;
          if (r.verificationStatus !== vs) return false;
        } else if (!recordMatchesMetric(r, statusFilter as AnalystMetricCategory)) {
          return false;
        }
        if (providerFilter !== 'all' && r.eMotoProvider !== providerFilter) return false;
        if (assemblerFilter !== 'all' && (r.retrofitAssembler || 'N/A') !== assemblerFilter) return false;
        if (!matchesGenderFilter(r.isWoman, genderFilter)) return false;
        if (!matchesVehicleTypeFilter(r.isRetrofit, vehicleTypeFilter)) return false;
        const originated = new Date(r.originatedAt).getTime();
        if (originated < from || originated > to) return false;
        if (
          q &&
          !r.ticketNumber.toLowerCase().includes(q) &&
          !r.firstName.toLowerCase().includes(q) &&
          !r.lastName.toLowerCase().includes(q) &&
          !(r.submittedBy || '').toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(a.originatedAt).getTime() - new Date(b.originatedAt).getTime());
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
      <ApplicationReviewEnhanced
        application={
          {
            id: selected.id,
            companyName: selected.companyName || selected.eMotoProvider,
            applicantName: `${selected.firstName} ${selected.lastName}`.trim(),
            registrationNumber: selected.ticketNumber,
            ticketNumber: selected.ticketNumber,
            rebateAmount: String(selected.rebateAmount),
            status: 'under-review',
            createdAt: selected.originatedAt,
            assignedAt: selected.originatedAt,
            isRetrofit: selected.isRetrofit,
            motorcycleBrand: selected.isRetrofit ? undefined : selected.eMotoProvider,
            nationalId: selected.nationalId,
            phoneNumber: undefined,
            email: undefined,
            submittedBy: selected.submittedBy,
            eligibilityCheck: {
              nationalIdCheck: {
                gender: selected.gender,
                dateOfBirth: selected.dateOfBirth,
              },
            },
            demoDaysAfterReceipt: selected.daysAfterReceipt,
          } as any
        }
        user={user}
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

  const reportTitle = `Report: ${ANALYST_METRIC_REPORT_TITLES[reportCategory]} (${filtered.length})`;

  const handleDownloadExcel = () => {
    if (filtered.length === 0) {
      toast.error('No rebates to include in the report.');
      return;
    }
    const { columns, rows } = analystRebateRowsForExport(filtered);
    exportReportToExcel({ filename: 'analyst-all-rebates-report', title: reportTitle, columns, rows });
    toast.success('Excel report downloaded');
  };

  const handleDownloadPdf = () => {
    if (filtered.length === 0) {
      toast.error('No rebates to include in the report.');
      return;
    }
    const { columns, rows } = analystRebateRowsForExport(filtered);
    exportReportToPdf({ filename: 'analyst-all-rebates-report', title: reportTitle, columns, rows });
    toast.success('PDF report downloaded');
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-6 overflow-x-hidden">
      <div className="min-w-0">
        <h2 className="text-lg sm:text-xl text-[#023F40]">All Rebates</h2>
        <p className="text-gray-600 mt-1 text-sm max-w-3xl">
          Click on the Rebate Ticket Number to access information on specific rebates and complete the
          submission to QA Team. Filter by time period, e-moto company, retrofit assembler, women, or
          retrofits, then print the report.
        </p>
      </div>

      <Card className="w-full min-w-0 max-w-full overflow-hidden print:hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4 shrink-0" />
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
        <CardContent className="space-y-4 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 min-w-0">
            <DateInput className="w-full min-w-0" value={dateFrom} onChange={setDateFrom} />
            <DateInput className="w-full min-w-0" value={dateTo} onChange={setDateTo} />
            <Input
              className="w-full min-w-0"
              placeholder="Search ticket, applicant, originator…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 min-w-0">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder={FILTER_LABELS.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{ALL_STATUSES_LABEL}</SelectItem>
                {(Object.keys(ANALYST_METRIC_LABELS) as AnalystMetricCategory[])
                  .filter((key) => key !== 'all')
                  .map((key) => (
                    <SelectItem key={key} value={key}>
                      {ANALYST_METRIC_LABELS[key]}
                    </SelectItem>
                  ))}
                {(Object.keys(ANALYST_STATUS_DISPLAY) as AnalystVerificationStatus[]).map((key) => (
                  <SelectItem key={`vs:${key}`} value={`vs:${key}`}>
                    {ANALYST_STATUS_DISPLAY[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-full min-w-0">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 min-w-0">
            <Select value={assemblerFilter} onValueChange={setAssemblerFilter}>
              <SelectTrigger className="w-full min-w-0">
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
              <SelectTrigger className="w-full min-w-0">
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
              <SelectTrigger className="w-full min-w-0">
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

      <Card className="w-full min-w-0 max-w-full overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 min-w-0">
            <ArrowUpDown className="w-4 h-4 shrink-0" />
            <span className="truncate">
              Report: {ANALYST_METRIC_REPORT_TITLES[reportCategory]} ({filtered.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full min-w-0 max-w-full p-0 sm:p-0 pb-4">
          <div className="w-full min-w-0 overflow-x-auto px-4 sm:px-6 pb-2">
            <AnalystRebateReportTable rows={filtered} onOpen={setSelected} />
          </div>
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
