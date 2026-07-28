import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DateInput } from '../ui/date-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowUpDown, Filter, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { RebateApplicationDetailsPage } from './RebateApplicationDetailsPage';
import { AfRebateReportTable } from './AfRebateReportTable';
import {
  AF_MOCK_REBATE_RECORDS,
  AfRebateRecord,
  getPipelineRecords,
} from '../../utils/afRebateData';

type RebateRecord = AfRebateRecord;

export function RebateStatusView({
  records: externalRecords,
  isMarketingAgent = false,
  currentUserName,
  onDetailOpenChange,
  onFinishApplication,
}: {
  records?: RebateRecord[];
  isMarketingAgent?: boolean;
  currentUserName?: string;
  onDetailOpenChange?: (open: boolean) => void;
  onFinishApplication?: (record: RebateRecord) => void;
} = {}) {
  const [internalRecords] = useState<RebateRecord[]>(AF_MOCK_REBATE_RECORDS);
  const records = externalRecords ?? internalRecords;
  const [query, setQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [assemblerFilter, setAssemblerFilter] = useState('all');
  const [womanFilter, setWomanFilter] = useState('all');
  const [retrofitFilter, setRetrofitFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<{ record: RebateRecord; variant: 'af-submitted' | 'proposal-review' } | null>(
    null
  );

  useEffect(() => {
    onDetailOpenChange?.(selected !== null);
  }, [selected, onDetailOpenChange]);

  const pipelineRecords = useMemo(() => {
    const unfinished = getPipelineRecords(records);
    if (!isMarketingAgent || !currentUserName) return unfinished;
    const own = unfinished.filter(
      (r) => r.submittedBy.toLowerCase() === currentUserName.toLowerCase()
    );
    return own.length > 0 ? own : unfinished;
  }, [records, isMarketingAgent, currentUserName]);

  const summary = useMemo(() => {
    const list = pipelineRecords;
    return {
      count: list.length,
      totalRebate: list.reduce((s, r) => s + r.rebateAmount, 0),
      totalRetail: list.reduce((s, r) => s + r.retailCost, 0),
    };
  }, [pipelineRecords]);

  const providers = useMemo(
    () => Array.from(new Set(pipelineRecords.map((r) => r.supplier).filter(Boolean))).sort(),
    [pipelineRecords]
  );
  const assemblers = useMemo(
    () =>
      Array.from(new Set(pipelineRecords.map((r) => r.retrofitAssembler).filter(Boolean) as string[])).sort(),
    [pipelineRecords]
  );

  const filteredRecords = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom).getTime() : 0;
    const to = dateTo ? new Date(dateTo).getTime() + 86400000 - 1 : Number.MAX_SAFE_INTEGER;
    const q = query.trim().toLowerCase();

    return pipelineRecords
      .filter((r) => {
        if (providerFilter !== 'all' && r.supplier !== providerFilter) return false;
        if (assemblerFilter !== 'all' && (r.retrofitAssembler || '') !== assemblerFilter) return false;
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
  }, [pipelineRecords, providerFilter, assemblerFilter, womanFilter, retrofitFilter, dateFrom, dateTo, query]);

  const openRecord = (record: RebateRecord) => {
    // AF decision-makers review marketing proposals; marketing agents viewing their own use the standard details view.
    const isFromMarketingAgent = /agent/i.test(record.submittedBy);
    const variant =
      !isMarketingAgent && isFromMarketingAgent ? 'proposal-review' : 'af-submitted';
    setSelected({ record, variant });
  };

  if (selected) {
    return (
      <RebateApplicationDetailsPage
        data={selected.record}
        variant={selected.variant}
        isMarketingAgent={isMarketingAgent}
        onBack={() => setSelected(null)}
        onFinishApplication={(row) => {
          onFinishApplication?.(row);
          setSelected(null);
        }}
      />
    );
  }

  const handlePrint = () => {
    if (filteredRecords.length === 0) {
      toast.error('No pipeline rebates to include in the report.');
      return;
    }
    toast.info('Opening print view…');
    setTimeout(() => window.print(), 150);
  };

  return (
    <div className="space-y-6 max-w-full">
      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">Rebate Pipeline Development Page</h2>
        {isMarketingAgent ? (
          <div className="mt-2 bg-blue-50 border border-blue-100 p-4 rounded-lg">
            <p className="text-gray-800 text-sm mb-2">
              You are registered as a marketing person for the following Asset Financier(s) authorized by RGF: <strong>Bank of Kigali</strong>
            </p>
            <p className="text-gray-800 text-sm">
              Below is a summary of the total number of rebate applications you have submitted to date. Double click on the status categories below for a breakout by Asset Financier.
            </p>
          </div>
        ) : (
          <p className="text-gray-600 mt-1 text-sm">
            This page provides the Asset Financier with an overview of opportunities to increase the number of leases to individuals who require financial support to acquire an e-moto or retrofit their ICE-moto. Below is the rebate pipeline in development that is not yet submitted to RGF.
          </p>
        )}
      </div>

      <div className="space-y-3">
        {isMarketingAgent ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {[
              { label: 'Your Total Rebates in Pipeline', value: 45 },
              { label: 'Your Total Rebates Awaiting review', value: 10 },
              { label: 'Your Total Rebates Approved', value: 30 },
              { label: 'Your Total Rebates Rejected', value: 5 },
            ].map((card, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">{card.label}</p>
                  <p className="text-2xl font-bold text-[#023F40]">{card.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-700">
              Rebates in your pipeline to be assessed. If eligible for financing and rebates, please complete the applications and submit to RGF:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">Number of rebates in your pipeline</p>
                  <p className="text-2xl font-bold text-[#023F40]">{summary.count}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">Total value of rebates in your pipeline</p>
                  <p className="text-2xl font-bold text-[#023F40]">RWF {summary.totalRebate.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">Total value of e-motos based on retail costs in your pipeline</p>
                  <p className="text-2xl font-bold text-[#023F40]">RWF {summary.totalRetail.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>
            <p className="text-xs text-gray-500">
              NOTE: Above values are based on estimates input by your designated marketing people.
            </p>
          </>
        )}
      </div>

      <Card className="max-w-full print:hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Filter below report by: time period, e-moto company, retrofit assembler, women, retrofits
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <DateInput value={dateFrom} onChange={setDateFrom} />
            <DateInput value={dateTo} onChange={setDateTo} />
            <Input
              placeholder="Search ticket, applicant, originator…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
            Pipeline Report: rebates applications in development
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full max-w-full px-4 sm:px-6 pb-6">
          <p className="text-sm text-gray-600 mb-4 print:hidden">
            Click on the Rebate Ticket Number to access information on specific rebates and complete the submission to
            RGF.
          </p>
          <AfRebateReportTable rows={filteredRecords} onOpen={openRecord} />
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
