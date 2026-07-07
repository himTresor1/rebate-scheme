import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner';

const MOCK_ROWS = [
  { af: 'Bboxx', ticket: 'REB-001', applicant: 'Jean Claude Ndayisaba', woman: false, retrofit: false, amount: 150000 },
  { af: 'Bboxx', ticket: 'REB-004', applicant: 'Jean HABIMANA', woman: false, retrofit: false, amount: 150000 },
  { af: 'REM', ticket: 'REB-002', applicant: 'Grace UWASE', woman: true, retrofit: true, amount: 200000 },
];

export function WeeklyDisbursementReport() {
  const total = MOCK_ROWS.reduce((s, r) => s + r.amount, 0);

  const exportExcel = () => {
    toast.success('Weekly Rebate Authorization Report exported (demo)', {
      description: 'Excel export will be wired to backend after launch.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl text-[#023F40]">Weekly Rebate Authorization Report</h2>
          <p className="text-sm text-gray-600 mt-1">Default report for week — excludes cases without e-moto possession.</p>
        </div>
        <Button className="bg-[#023F40] hover:bg-[#035f60]" onClick={exportExcel}>Export Excel</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Week of 26 May – 01 June 2026</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="pb-2 pr-3">AF</th>
                <th className="pb-2 pr-3">Ticket</th>
                <th className="pb-2 pr-3">Applicant</th>
                <th className="pb-2 pr-3">Women</th>
                <th className="pb-2 pr-3">Retrofit</th>
                <th className="pb-2">Amount (RWF)</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ROWS.map((r) => (
                <tr key={r.ticket} className="border-b last:border-0">
                  <td className="py-2 pr-3">{r.af}</td>
                  <td className="py-2 pr-3">{r.ticket}</td>
                  <td className="py-2 pr-3">{r.applicant}</td>
                  <td className="py-2 pr-3">{r.woman ? 'Yes' : 'No'}</td>
                  <td className="py-2 pr-3">{r.retrofit ? 'Yes' : 'No'}</td>
                  <td className="py-2">{r.amount.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td colSpan={5} className="py-3 text-right pr-3">TOTAL FOR WEEK</td>
                <td className="py-3">RWF {total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t pt-4">
            <div>
              <p className="text-gray-600">CFO signature</p>
              <div className="h-10 border-b border-gray-400 mt-2" />
            </div>
            <div>
              <p className="text-gray-600">Date</p>
              <div className="h-10 border-b border-gray-400 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
