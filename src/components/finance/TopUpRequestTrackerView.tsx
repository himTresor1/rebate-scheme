import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';

interface TopUpRequestRow {
  afName: string;
  currentBalance: number;
  requested: number;
  recommendation: 'Recommended' | 'Not recommended' | 'Pending review';
  cfoDecision: 'Pending' | 'Approved' | 'Rejected';
}

const MOCK_ROWS: TopUpRequestRow[] = [
  { afName: 'Bboxx', currentBalance: 2000000, requested: 10000000, recommendation: 'Recommended', cfoDecision: 'Pending' },
  { afName: 'REM', currentBalance: 1500000, requested: 8000000, recommendation: 'Recommended', cfoDecision: 'Approved' },
  { afName: 'Watu', currentBalance: 3200000, requested: 12000000, recommendation: 'Pending review', cfoDecision: 'Pending' },
  { afName: 'Jali', currentBalance: 900000, requested: 5000000, recommendation: 'Recommended', cfoDecision: 'Rejected' },
];

function money(value: number) {
  return value.toLocaleString();
}

function recommendationBadge(status: TopUpRequestRow['recommendation']) {
  if (status === 'Recommended') return <Badge className="bg-green-100 text-green-800">Recommended</Badge>;
  if (status === 'Not recommended') return <Badge className="bg-red-100 text-red-800">Not recommended</Badge>;
  return <Badge className="bg-amber-100 text-amber-800">Pending review</Badge>;
}

function cfoBadge(status: TopUpRequestRow['cfoDecision']) {
  if (status === 'Approved') return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
  if (status === 'Rejected') return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
  return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
}

export function TopUpRequestTrackerView() {
  const [search, setSearch] = useState('');

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return MOCK_ROWS;
    return MOCK_ROWS.filter((row) => row.afName.toLowerCase().includes(q));
  }, [search]);

  const pendingCount = MOCK_ROWS.filter((row) => row.cfoDecision === 'Pending').length;
  const approvedCount = MOCK_ROWS.filter((row) => row.cfoDecision === 'Approved').length;
  const totalRequested = MOCK_ROWS.reduce((sum, row) => sum + row.requested, 0);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg sm:text-xl font-semibold text-[#023F40]">Top-Up Request Tracker</h2>
        <p className="text-sm text-gray-600">
          Track AF top-up requests, finance recommendations, and CFO approval decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="px-4 py-4">
            <p className="text-xs sm:text-sm text-gray-600">Pending CFO decision</p>
            <p className="text-xl font-bold text-[#023F40] mt-1">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-4">
            <p className="text-xs sm:text-sm text-gray-600">Approved requests</p>
            <p className="text-xl font-bold text-[#023F40] mt-1">{approvedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-4">
            <p className="text-xs sm:text-sm text-gray-600">Total requested (RWF)</p>
            <p className="text-xl font-bold text-[#023F40] mt-1">{money(totalRequested)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="w-full sm:max-w-sm">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search asset financier..."
          className="placeholder:text-gray-600"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[#023F40]">Top-Up Request Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="pb-3 pr-3">Asset Financier Name</th>
                  <th className="pb-3 pr-3">Current Balance</th>
                  <th className="pb-3 pr-3">Requested</th>
                  <th className="pb-3 pr-3">Recommendation</th>
                  <th className="pb-3">CFO Decision</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.afName} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 pr-3 font-semibold text-[#023F40]">{row.afName}</td>
                    <td className="py-3 pr-3">{money(row.currentBalance)}</td>
                    <td className="py-3 pr-3">{money(row.requested)}</td>
                    <td className="py-3 pr-3">{recommendationBadge(row.recommendation)}</td>
                    <td className="py-3">{cfoBadge(row.cfoDecision)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
