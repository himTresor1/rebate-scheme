import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Filter, Printer } from 'lucide-react';
import { toast } from 'sonner';

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

/** QA-approved rebates with E-Moto possession — eligible for CFO disbursement request */
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

function formatShortDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function WeeklyDisbursementReport({ mode = 'cfo-authorization' }: WeeklyDisbursementReportProps) {
  const [query, setQuery] = useState('');
  const [filterAf, setFilterAf] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterWomen, setFilterWomen] = useState('all');
  const [filterRetrofit, setFilterRetrofit] = useState('all');
  const [filterProvider, setFilterProvider] = useState('all');
  const [printWithSignature, setPrintWithSignature] = useState(false);

  // Only QA-approved rebates with possession statement go to CFO request
  const eligibleRows = useMemo(
    () => MOCK_CFO_REQUEST_ROWS.filter((r) => r.hasPossession),
    []
  );

  const afs = Array.from(new Set(eligibleRows.map((r) => r.af))).sort();
  const providers = Array.from(new Set(eligibleRows.map((r) => r.provider))).sort();

  const filteredRows = useMemo(() => {
    return eligibleRows
      .filter((r) => {
        const q = query.toLowerCase();
        if (q && !r.ticket.toLowerCase().includes(q) && !r.applicant.toLowerCase().includes(q)) return false;
        if (filterAf !== 'all' && r.af !== filterAf) return false;
        if (filterWomen === 'yes' && !r.woman) return false;
        if (filterWomen === 'no' && r.woman) return false;
        if (filterRetrofit === 'yes' && !r.retrofit) return false;
        if (filterRetrofit === 'no' && r.retrofit) return false;
        if (filterProvider !== 'all' && r.provider !== filterProvider) return false;
        if (filterDateRange !== 'all') {
          const days = Math.floor(
            (Date.now() - new Date(r.qaApprovedAt).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (filterDateRange === 'day' && days > 1) return false;
          if (filterDateRange === 'week' && days > 7) return false;
          if (filterDateRange === 'month' && days > 30) return false;
          if (filterDateRange === 'year' && days > 365) return false;
        }
        return true;
      })
      .sort(
        (a, b) => new Date(b.afSubmittedAt).getTime() - new Date(a.afSubmittedAt).getTime()
      );
  }, [eligibleRows, query, filterAf, filterDateRange, filterWomen, filterRetrofit, filterProvider]);

  const total = filteredRows.reduce((s, r) => s + r.amount, 0);

  const handlePrint = (withSignature: boolean) => {
    setPrintWithSignature(withSignature);
    toast.info(withSignature ? 'Opening print view with signature line…' : 'Opening print view…');
    setTimeout(() => window.print(), 150);
  };

  if (mode === 'af-notification') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg text-[#023F40]">AF Disbursement Notification</h2>
        <p className="text-sm text-gray-600">Notification view for Asset Financiers after CFO authorization.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="print:text-center">
        <p className="text-xs uppercase tracking-wide text-gray-500 print:text-gray-700">
          Rebate Quality Assurance Team
        </p>
        <h2 className="text-lg sm:text-xl text-[#023F40] font-semibold">
          Request for CFO Disbursement Authorization
        </h2>
        <p className="text-sm text-gray-600 mt-2 max-w-4xl print:max-w-none print:mx-auto">
          This report requests the RGF CFO to authorize Asset Financiers to access funds for QA-approved rebates
          that have signed E-Moto Possession confirmation from both the Asset Financier and the client. Only
          rebates with an E-Moto Possession Statement are included.
        </p>
      </div>

      <Card className="print:hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <p className="text-xs font-medium text-gray-600">Asset Financier</p>
              <Select value={filterAf} onValueChange={setFilterAf}>
                <SelectTrigger className="border-[#023F40]/60">
                  <SelectValue placeholder="Select Asset Financier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Asset Financiers</SelectItem>
                  {afs.map((af) => (
                    <SelectItem key={af} value={af}>
                      {af}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600">Search</p>
              <Input
                placeholder="Search ticket/applicant..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600">Date range</p>
              <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All dates</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600">Women</p>
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
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600">Retrofit</p>
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
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600">E-Moto Provider</p>
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
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Showing {filteredRows.length} of {eligibleRows.length} rebates
            {filterAf !== 'all' ? ` for ${filterAf}` : ''}. Use Asset Financier and other filters to narrow the list before printing.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-2 print:hidden">
        <Button
          variant="outline"
          className="border-[#6DB27F] text-[#023F40]"
          onClick={() => handlePrint(false)}
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Report (PDF)
        </Button>
        <Button className="bg-[#6DB27F] hover:bg-[#5da170]" onClick={() => handlePrint(true)}>
          <Printer className="w-4 h-4 mr-2" />
          Print Report with Signature
        </Button>
      </div>

      <Card className="print:shadow-none print:border-0">
        <CardHeader>
          <CardTitle className="text-base text-[#023F40]">
            Default Report: QA-approved rebates with E-Moto Possession for CFO authorization
          </CardTitle>
          {filterAf !== 'all' && (
            <p className="text-sm text-gray-600 mt-1">Filtered to Asset Financier: {filterAf}</p>
          )}
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {filteredRows.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-600">
              No rebates match the current filters. Only QA-approved rebates with possession are listed.
            </div>
          ) : (
            <table className="w-full min-w-[1500px] text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="pb-2 pr-3 font-medium">Ticket No.</th>
                  <th className="pb-2 pr-3 font-medium">Date of AF Submission</th>
                  <th className="pb-2 pr-3 font-medium">Date of Rebate Team Verification</th>
                  <th className="pb-2 pr-3 font-medium">Date of QA Team Approval</th>
                  <th className="pb-2 pr-3 font-medium">Applicant Name</th>
                  <th className="pb-2 pr-3 font-medium">Woman</th>
                  <th className="pb-2 pr-3 font-medium">Retrofit</th>
                  <th className="pb-2 pr-3 font-medium">Asset Financier</th>
                  <th className="pb-2 pr-3 font-medium">E-Moto Provider</th>
                  <th className="pb-2 pr-3 font-medium">Retrofit Assembler</th>
                  <th className="pb-2 pr-3 font-medium">E-Moto Retail Cost (RWF)</th>
                  <th className="pb-2 pr-3 font-medium">Rebate %</th>
                  <th className="pb-2 font-medium">Rebate Amount for Disbursement Approval (RWF)</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.ticket} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-semibold text-[#023F40]">{r.ticket}</td>
                    <td className="py-2 pr-3">{formatShortDate(r.afSubmittedAt)}</td>
                    <td className="py-2 pr-3">{formatShortDate(r.rebateVerifiedAt)}</td>
                    <td className="py-2 pr-3">{formatShortDate(r.qaApprovedAt)}</td>
                    <td className="py-2 pr-3">{r.applicant}</td>
                    <td className="py-2 pr-3">{r.woman ? 'Yes' : 'No'}</td>
                    <td className="py-2 pr-3">{r.retrofit ? 'Yes' : 'No'}</td>
                    <td className="py-2 pr-3">{r.af}</td>
                    <td className="py-2 pr-3">{r.provider}</td>
                    <td className="py-2 pr-3">{r.assembler}</td>
                    <td className="py-2 pr-3">{r.retailCost.toLocaleString()}</td>
                    <td className="py-2 pr-3">{r.rebatePercent}</td>
                    <td className="py-2">{r.amount.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td colSpan={12} className="py-3 text-right pr-3">
                    Total for Approval
                    {filterAf !== 'all' ? ` (${filterAf})` : ''}
                  </td>
                  <td className="py-3">RWF {total.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          )}
          <p className="text-xs text-gray-500 mt-3 print:hidden">
            Rebates are listed together. Use Asset Financier and other filters to select the set for review or print. Rebates without an E-Moto Possession Statement are excluded.
          </p>
        </CardContent>
      </Card>

      {printWithSignature && (
        <div className="hidden print:block mt-10 space-y-8 text-sm">
          <p className="font-medium text-[#023F40]">Authorization</p>
          <div className="grid grid-cols-2 gap-12 pt-8">
            <div>
              <div className="border-b border-gray-800 h-10" />
              <p className="mt-2">CFO Name / Signature</p>
            </div>
            <div>
              <div className="border-b border-gray-800 h-10" />
              <p className="mt-2">Date</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
