import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { RebateReassignmentReview } from './RebateReassignmentReview';
import { getSlaBadge } from '../../utils/slaBadges';
import { formatRebateAmountWithPercent, rebateOptionsFromRecord } from '../../utils/rebateCalculation';

interface ReassignmentRecord {
  ticketNumber: string;
  priorClient: string;
  newClient: string;
  approvalDate: string;
  financier: string;
  vehicleType: string;
  rebateAmount: number;
  daysWaiting: number;
  opened: boolean;
}

const MOCK: ReassignmentRecord[] = [
  { ticketNumber: 'REB-101', priorClient: 'Albert JAMES', newClient: 'Jean Paul HIRWA', approvalDate: '2026-05-01', financier: 'Bboxx', vehicleType: 'New E-Moto', rebateAmount: 150000, daysWaiting: 1, opened: false },
  { ticketNumber: 'REB-102', priorClient: 'Grace UWASE', newClient: 'Benedicte INGABIRE', approvalDate: '2026-05-02', financier: 'REM', vehicleType: 'Retrofit', rebateAmount: 80000, daysWaiting: 3, opened: true },
];

export function RebateReassignmentPipeline() {
  const [selected, setSelected] = useState<ReassignmentRecord | null>(null);

  if (selected) {
    return <RebateReassignmentReview record={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">Rebate Reassignment Checking</h2>
        <p className="text-sm text-gray-600 mt-1">Verify client transfers on existing approved rebates. No new CFO disbursement required.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pending reassignment review ({MOCK.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="pb-2 pr-3">Ticket</th>
                <th className="pb-2 pr-3">Prior client</th>
                <th className="pb-2 pr-3">New client</th>
                <th className="pb-2 pr-3">AF</th>
                <th className="pb-2 pr-3">Amount</th>
                <th className="pb-2 pr-3">SLA</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK.map((r) => (
                <tr key={r.ticketNumber} className="border-b last:border-0">
                  <td className="py-3 pr-3 font-medium">{r.ticketNumber}</td>
                  <td className="py-3 pr-3">{r.priorClient}</td>
                  <td className="py-3 pr-3">{r.newClient}</td>
                  <td className="py-3 pr-3">{r.financier}</td>
                  <td className="py-3 pr-3">RWF {formatRebateAmountWithPercent(r.rebateAmount, rebateOptionsFromRecord(r))}</td>
                  <td className="py-3 pr-3">{getSlaBadge(r.daysWaiting, r.opened)}</td>
                  <td className="py-3">
                    <Button size="sm" variant="outline" onClick={() => setSelected(r)}>Review</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
