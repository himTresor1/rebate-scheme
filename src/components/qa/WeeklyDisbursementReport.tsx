import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';

const MOCK_ROWS = [
  { af: 'Bboxx', ticket: 'REB-001', applicant: 'Jean Claude Ndayisaba', woman: false, retrofit: false, amount: 150000 },
  { af: 'Bboxx', ticket: 'REB-004', applicant: 'Jean HABIMANA', woman: false, retrofit: false, amount: 150000 },
];

interface WeeklyDisbursementReportProps {
  mode?: 'cfo-authorization' | 'af-notification';
}

export function WeeklyDisbursementReport({ mode = 'cfo-authorization' }: WeeklyDisbursementReportProps) {
  const [activeTab, setActiveTab] = useState(mode === 'af-notification' ? 'af' : 'cfo');
  const total = MOCK_ROWS.reduce((s, r) => s + r.amount, 0);

  const exportExcel = () => {
    toast.success('Weekly Rebate Authorization Report exported (demo)', {
      description: 'Excel export will be wired to backend after launch.',
    });
  };

  const notifyAFs = () => {
    toast.success('Weekly authorization report sent to Asset Financiers (demo)', {
      description: 'AFs can view authorized rebates and proceed with possession confirmation where applicable.',
    });
  };

  const authorizeDisbursement = () => {
    toast.success('CFO weekly disbursement authorized (demo)', {
      description: 'Finance team will wire funds from escrow. AF notification report is ready to send.',
    });
  };

  const table = (
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
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl text-[#023F40]">Weekly Rebate Authorization Report</h2>
          <p className="text-sm text-gray-600 mt-1">
            Default weekly report — cases without e-moto possession are excluded per policy.
          </p>
        </div>
        <Button className="bg-[#023F40] hover:bg-[#035f60]" onClick={exportExcel}>
          Export Excel
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="cfo">CFO authorization</TabsTrigger>
          <TabsTrigger value="af">AF notification</TabsTrigger>
        </TabsList>

        <TabsContent value="cfo" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Week of 26 May – 01 June 2026
                <Badge className="bg-amber-100 text-amber-800">Pending CFO signature</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {table}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t pt-4">
                <div>
                  <p className="text-gray-600">CFO signature</p>
                  <div className="h-10 border-b border-gray-400 mt-2" />
                </div>
                <div>
                  <p className="text-gray-600">Authorization date</p>
                  <div className="h-10 border-b border-gray-400 mt-2" />
                </div>
              </div>
              <Button className="mt-4 bg-[#023F40] hover:bg-[#035f60]" onClick={authorizeDisbursement}>
                Authorize weekly disbursement
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="af" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification to Asset Financiers</CardTitle>
              <p className="text-sm text-gray-600 font-normal">
                After CFO authorization, AFs receive this report showing rebates approved for disbursement from escrow.
              </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {MOCK_ROWS.reduce<string[]>((afs, r) => (afs.includes(r.af) ? afs : [...afs, r.af]), []).map((af) => (
                <div key={af} className="mb-6 last:mb-0">
                  <h3 className="font-medium text-[#023F40] mb-2">{af}</h3>
                  <table className="w-full text-sm mb-2">
                    <thead>
                      <tr className="border-b text-left text-gray-600">
                        <th className="pb-2 pr-3">Ticket</th>
                        <th className="pb-2 pr-3">Applicant</th>
                        <th className="pb-2">Amount (RWF)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_ROWS.filter((r) => r.af === af).map((r) => (
                        <tr key={r.ticket} className="border-b last:border-0">
                          <td className="py-2 pr-3">{r.ticket}</td>
                          <td className="py-2 pr-3">{r.applicant}</td>
                          <td className="py-2">{r.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              <Button variant="outline" onClick={notifyAFs}>Send report to AFs</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
