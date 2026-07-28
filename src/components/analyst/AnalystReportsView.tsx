import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DateInput } from '../ui/date-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowUpDown, Filter, Printer } from 'lucide-react';
import { toast } from 'sonner';
import {
  ANALYST_METRIC_LABELS,
  ANALYST_METRIC_REPORT_TITLES,
  ANALYST_MOCK_REBATE_RECORDS,
  ANALYST_STATUS_DISPLAY,
  AnalystMetricCategory,
  AnalystRebateRecord,
  AnalystVerificationStatus,
  recordMatchesMetric,
} from '../../utils/analystRebateData';
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
  initialCategory = 'all',
  records: externalRecords,
}: AnalystReportsViewProps) {
  const [internalRecords] = useState(ANALYST_MOCK_REBATE_RECORDS);
  const records = externalRecords ?? internalRecords;
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AnalystMetricCategory>(initialCategory);
  const [statusFilter, setStatusFilter] = useState<AnalystVerificationStatus | 'all'>('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [assemblerFilter, setAssemblerFilter] = useState('all');
  const [womanFilter, setWomanFilter] = useState('all');
  const [retrofitFilter, setRetrofitFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<AnalystRebateRecord | null>(null);

  useEffect(() => {
    setCategoryFilter(initialCategory);
  }, [initialCategory]);

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
        if (!recordMatchesMetric(r, categoryFilter)) return false;
        if (statusFilter !== 'all' && r.verificationStatus !== statusFilter) return false;
        if (providerFilter !== 'all' && r.eMotoProvider !== providerFilter) return false;
        if (assemblerFilter !== 'all' && (r.retrofitAssembler || 'N/A') !== assemblerFilter) return false;
        if (womanFilter === 'yes' && !r.isWoman) return false;
        if (womanFilter === 'no' && r.isWoman) return false;
        if (retrofitFilter === 'yes' && !r.isRetrofit) return false;
        if (retrofitFilter === 'no' && r.isRetrofit) return false;
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

  const handlePrint = () => {
    if (filtered.length === 0) {
      toast.error('No rebates to include in the report.');
      return;
    }
    toast.info('Opening print view…');
    setTimeout(() => window.print(), 150);
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
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4 shrink-0" />
            Filters &amp; Sort
          </CardTitle>
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
              onValueChange={(v) => setStatusFilter(v as AnalystVerificationStatus | 'all')}
            >
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder="Verification Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {(Object.keys(ANALYST_STATUS_DISPLAY) as AnalystVerificationStatus[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {ANALYST_STATUS_DISPLAY[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={categoryFilter}
              onValueChange={(v) => setCategoryFilter(v as AnalystMetricCategory)}
            >
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder="Report category" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ANALYST_METRIC_LABELS) as AnalystMetricCategory[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {ANALYST_METRIC_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-full min-w-0">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 min-w-0">
            <Select value={assemblerFilter} onValueChange={setAssemblerFilter}>
              <SelectTrigger className="w-full min-w-0">
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
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder="Women" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All applicants</SelectItem>
                <SelectItem value="yes">Women only</SelectItem>
                <SelectItem value="no">Non-women</SelectItem>
              </SelectContent>
            </Select>
            <Select value={retrofitFilter} onValueChange={setRetrofitFilter}>
              <SelectTrigger className="w-full min-w-0">
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

      <Card className="w-full min-w-0 max-w-full overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 min-w-0">
            <ArrowUpDown className="w-4 h-4 shrink-0" />
            <span className="truncate">
              Report: {ANALYST_METRIC_REPORT_TITLES[categoryFilter]} ({filtered.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full min-w-0 max-w-full p-0 sm:p-0 pb-4">
          <div className="w-full min-w-0 overflow-x-auto px-4 sm:px-6 pb-2">
            <AnalystRebateReportTable rows={filtered} onOpen={setSelected} />
          </div>
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
