import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  AfSummaryRow,
  FinanceOfficerAfTrackingPage,
  LeaseDetailRow,
} from './FinanceOfficerAfTrackingPage';

const AF_SUMMARY_ROWS: AfSummaryRow[] = [
  { afName: 'Bboxx', advanceDeposits: 30000000, committedToRebates: 25000000, disbursed: 25000000, leasesToDate: 150, lastBankStatement: '04 Jun 2026' },
  { afName: 'REM', advanceDeposits: 25000000, committedToRebates: 20000000, disbursed: 20000000, leasesToDate: 130, lastBankStatement: '05 Jun 2026' },
  { afName: 'Watu', advanceDeposits: 40000000, committedToRebates: 30000000, disbursed: 21500000, leasesToDate: 185, lastBankStatement: '03 Jun 2026' },
  { afName: 'Jali', advanceDeposits: 25000000, committedToRebates: 14500000, disbursed: 14500000, leasesToDate: 85, lastBankStatement: '06 Jun 2026' },
];

const LEASE_DETAILS: Record<string, LeaseDetailRow[]> = {
  Bboxx: [
    { ticketNo: 'REB-001', applicantName: 'Jean Claude Ndayisaba', woman: false, retrofit: false, emotoProvider: 'Bboxx', retailCost: 830000, rebateAmount: 150000, status: 'Disbursed' },
    { ticketNo: 'REB-004', applicantName: 'Jean Habimana', woman: false, retrofit: false, emotoProvider: 'Bboxx', retailCost: 810000, rebateAmount: 150000, status: 'Disbursed' },
  ],
  REM: [
    { ticketNo: 'REB-019', applicantName: 'Aline Uwase', woman: true, retrofit: true, emotoProvider: 'Ampersand', retailCost: 790000, rebateAmount: 200000, status: 'Disbursed' },
    { ticketNo: 'REB-022', applicantName: 'Patrick Nshimiyimana', woman: false, retrofit: false, emotoProvider: 'Spiro', retailCost: 845000, rebateAmount: 150000, status: 'Waiting possession' },
  ],
  Watu: [
    { ticketNo: 'REB-031', applicantName: 'Alice M', woman: true, retrofit: false, emotoProvider: 'Ampersand', retailCost: 860000, rebateAmount: 170000, status: 'Waiting possession' },
    { ticketNo: 'REB-036', applicantName: 'Grace Uwera', woman: true, retrofit: true, emotoProvider: 'Spiro', retailCost: 780000, rebateAmount: 200000, status: 'Disbursed' },
  ],
  Jali: [
    { ticketNo: 'REB-041', applicantName: 'Eric Habinshuti', woman: false, retrofit: false, emotoProvider: 'Bboxx', retailCost: 820000, rebateAmount: 150000, status: 'Disbursed' },
  ],
};

function money(value: number) {
  return value.toLocaleString();
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="px-4 py-4">
        <p className="text-xs sm:text-sm text-gray-600 leading-snug">{label}</p>
        <p className="text-xl font-bold text-[#023F40] mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

export function FinanceTrackingView() {
  const [afSearch, setAfSearch] = useState('');
  const [selectedAf, setSelectedAf] = useState<string | null>(null);
  const [statementSearch, setStatementSearch] = useState('');

  const filteredRows = useMemo(() => {
    const q = afSearch.toLowerCase().trim();
    if (!q) return AF_SUMMARY_ROWS;
    return AF_SUMMARY_ROWS.filter((r) => r.afName.toLowerCase().includes(q));
  }, [afSearch]);

  const totalFundsReceived = AF_SUMMARY_ROWS.reduce((sum, row) => sum + row.advanceDeposits, 0);
  const totalAdvanceWired = totalFundsReceived;
  const totalCommitted = AF_SUMMARY_ROWS.reduce((sum, row) => sum + row.committedToRebates, 0);
  const totalDisbursed = AF_SUMMARY_ROWS.reduce((sum, row) => sum + row.disbursed, 0);
  const totalNotYetDisbursed = totalAdvanceWired - totalDisbursed;

  const selectedSummary = selectedAf
    ? AF_SUMMARY_ROWS.find((row) => row.afName === selectedAf) || null
    : null;

  const handleUploadStatement = () => {
    if (!statementSearch.trim()) {
      toast.error('Enter a search term before uploading a bank statement.');
      return;
    }
    toast.success(`Bank statement upload captured for ${statementSearch.trim()} (demo).`);
  };

  if (selectedSummary) {
    return (
      <FinanceOfficerAfTrackingPage
        afSummary={selectedSummary}
        leases={LEASE_DETAILS[selectedSummary.afName] || []}
        onBack={() => setSelectedAf(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg sm:text-xl font-semibold text-[#023F40]">
          Verification Checking Page by Asset Financier Against Bank Account
        </h2>
        <p className="text-sm text-gray-600">
          Summarize rebate funds wired to Asset Financiers and reconcile AF bank accounts against system records.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard label="Total funds received by RGF from MAF to date (RWF)" value={money(totalFundsReceived)} />
        <SummaryCard label="Total advance funds wired to AFs (RWF)" value={money(totalAdvanceWired)} />
        <SummaryCard label="Of which committed to rebates (RWF)" value={money(totalCommitted)} />
        <SummaryCard label="Of which disbursed (RWF)" value={money(totalDisbursed)} />
        <SummaryCard label="Of which not yet disbursed (RWF)" value={money(totalNotYetDisbursed)} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between">
        <div className="w-full sm:max-w-sm">
          <Input
            value={afSearch}
            onChange={(e) => setAfSearch(e.target.value)}
            placeholder="Search asset financier..."
            className="placeholder:text-gray-600"
          />
        </div>
        <div className="flex w-full sm:w-auto flex-col sm:flex-row sm:items-end gap-2">
          <Input
            className="sm:w-56 placeholder:text-gray-600"
            placeholder="Search for bank statements"
            value={statementSearch}
            onChange={(e) => setStatementSearch(e.target.value)}
          />
          <Button className="bg-[#023F40] hover:bg-[#035f60] shrink-0" onClick={handleUploadStatement}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Statement
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[#023F40]">Asset Financier Rebate Summary</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[1150px] text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="pb-3 pr-3">Asset Financier Name</th>
                <th className="pb-3 pr-3">Advance Deposits (a)</th>
                <th className="pb-3 pr-3">Committed to Rebates (b)</th>
                <th className="pb-3 pr-3">Disbursed (c)</th>
                <th className="pb-3 pr-3">Not Yet Disbursed (a - c)</th>
                <th className="pb-3 pr-3">No of Leases to Date</th>
                <th className="pb-3">Last Bank Statement</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.afName}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedAf(row.afName)}
                >
                  <td className="py-3 pr-3 font-semibold text-[#023F40]">{row.afName}</td>
                  <td className="py-3 pr-3">{money(row.advanceDeposits)}</td>
                  <td className="py-3 pr-3">{money(row.committedToRebates)}</td>
                  <td className="py-3 pr-3">{money(row.disbursed)}</td>
                  <td className="py-3 pr-3">{money(row.advanceDeposits - row.disbursed)}</td>
                  <td className="py-3 pr-3">{row.leasesToDate}</td>
                  <td className="py-3">{row.lastBankStatement}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-4">
            Fields marked as (a) and (c) are input by RGF Finance; (b) and lease counts are system-calculated.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
