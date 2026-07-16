import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowUpDown, FileText } from 'lucide-react';
import { User } from '../../utils/auth';
import { RebateApplicationDetailsData, RebateApplicationDetailsPage } from './RebateApplicationDetailsPage';
import { getAfPermissionLevel } from '../../utils/afPermissions';
import { toast } from 'sonner';

type RebateRecord = RebateApplicationDetailsData;

const MOCK_RECORDS: RebateRecord[] = [
  {
    ticketNumber: 'REB-001',
    submittedBy: 'Grace Mukandori',
    firstName: 'Jean Claude',
    lastName: 'Ndayisaba',
    nationalId: '1198780012345678',
    motoLicense: 'DL-2024-1022',
    isWoman: false,
    isRetrofit: false,
    retailCost: 830000,
    rebateAmount: 150000,
    supplier: 'Ampersand',
    model: 'AMP-E2',
    status: 'awaiting-rgf',
    submittedAt: '2026-07-15',
    supportingDocuments: ['Signed lease', 'National ID'],
    affidavitUploaded: true,
    afFinancialNeedUploaded: true,
    iceAgreementUploaded: false,
  },
  {
    ticketNumber: 'REB-002',
    submittedBy: 'Kevin Agent',
    firstName: 'Grace',
    lastName: 'Uwase',
    nationalId: '1198780098765432',
    motoLicense: 'DL-2023-8831',
    isWoman: true,
    isRetrofit: true,
    retailCost: 800000,
    rebateAmount: 200000,
    supplier: 'Spiro',
    model: 'SP-Retrofit',
    retrofitAssembler: 'Green Volt Retrofit Ltd',
    status: 'proposal',
    submittedAt: '2026-07-08',
    supportingDocuments: ['Client support letter'],
    affidavitUploaded: true,
    afFinancialNeedUploaded: true,
    iceAgreementUploaded: true,
  },
  {
    ticketNumber: 'REB-005',
    submittedBy: 'Grace Mukandori',
    firstName: 'Marie Claire',
    lastName: 'Uwimana',
    nationalId: '1198780033333333',
    motoLicense: 'DL-2025-4201',
    isWoman: true,
    isRetrofit: false,
    retailCost: 750000,
    rebateAmount: 187500,
    supplier: 'Bboxx',
    model: 'BBX-Prime',
    status: 'approved-disbursed',
    submittedAt: '2026-05-20',
    supportingDocuments: ['Supporting statement', 'Driver training completion'],
    affidavitUploaded: true,
    afFinancialNeedUploaded: true,
    iceAgreementUploaded: false,
  },
];

function statusBadge(status: RebateRecord['status']) {
  if (status === 'proposal') return <Badge className="bg-amber-100 text-amber-800">AF proposal</Badge>;
  if (status === 'awaiting-rgf') return <Badge className="bg-blue-100 text-blue-800">Awaiting RGF auth</Badge>;
  return <Badge className="bg-green-100 text-green-800">Approved disbursed</Badge>;
}

function RebateTable({
  rows,
  onOpen,
  onSubmitToRgf,
  showSubmitAction,
}: {
  rows: RebateRecord[];
  onOpen: (r: RebateRecord) => void;
  onSubmitToRgf?: (r: RebateRecord) => void;
  showSubmitAction?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[1680px]">
        <thead>
          <tr className="border-b text-left text-gray-600">
            <th className="pb-3 pr-3">Ticket No</th>
            <th className="pb-3 pr-3">Person who submitted rebate proposal</th>
            <th className="pb-3 pr-3">Last Name(s)</th>
            <th className="pb-3 pr-3">First Name(s)</th>
            <th className="pb-3 pr-3">National ID</th>
            <th className="pb-3 pr-3">Moto license</th>
            <th className="pb-3 pr-3">Woman</th>
            <th className="pb-3 pr-3">Retrofit</th>
            <th className="pb-3 pr-3">Retail Cost of E-Moto (RWF)</th>
            <th className="pb-3 pr-3">Rebate Amount (RWF)</th>
            <th className="pb-3 pr-3">E-Moto Supplier</th>
            <th className="pb-3 pr-3">E-Moto Model</th>
            <th className="pb-3 pr-3">Retrofit Assembler</th>
            <th className="pb-3 pr-3">Any supporting documents</th>
            <th className="pb-3 pr-3">Individual Affidavit</th>
            <th className="pb-3 pr-3">ICE agreement</th>
            <th className="pb-3 pr-3">Status</th>
            <th className="pb-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.ticketNumber} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => onOpen(r)}>
              <td className="py-3 pr-3 font-semibold text-[#023F40]">{r.ticketNumber}</td>
              <td className="py-3 pr-3">{r.submittedBy}</td>
              <td className="py-3 pr-3">{r.lastName}</td>
              <td className="py-3 pr-3">{r.firstName}</td>
              <td className="py-3 pr-3">{r.nationalId}</td>
              <td className="py-3 pr-3">{r.motoLicense}</td>
              <td className="py-3 pr-3">{r.isWoman ? 'Yes' : 'No'}</td>
              <td className="py-3 pr-3">{r.isRetrofit ? 'Yes' : 'No'}</td>
              <td className="py-3 pr-3">{r.retailCost.toLocaleString()}</td>
              <td className="py-3 pr-3">{r.rebateAmount.toLocaleString()}</td>
              <td className="py-3 pr-3">{r.supplier}</td>
              <td className="py-3 pr-3">{r.model}</td>
              <td className="py-3 pr-3">{r.retrofitAssembler || 'N/A'}</td>
              <td className="py-3 pr-3">{r.supportingDocuments.length}</td>
              <td className="py-3 pr-3">{r.affidavitUploaded ? 'Uploaded' : 'Missing'}</td>
              <td className="py-3 pr-3">{r.isRetrofit ? (r.iceAgreementUploaded ? 'Uploaded' : 'Missing') : 'N/A'}</td>
              <td className="py-3 pr-3">{statusBadge(r.status)}</td>
              <td className="py-3 pr-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen(r);
                    }}
                  >
                    View Details
                  </Button>
                  {showSubmitAction && r.status === 'proposal' ? (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSubmitToRgf?.(r);
                      }}
                      className="bg-[#023F40] hover:bg-[#035f60]"
                    >
                      Submit to RGF
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RebateStatusView({
  title = 'Rebate Status',
  description = 'This page provides you with the rebate proposals that have been submitted for your review and approval from your marketing staff and designated external marketing agents and other people. If you approve the eligibility for rebates and financing agreements, please add the missing documentation including a signed lease and submit to RGF. The dashboard details the pipeline of your rebates breaking out the total submissions and status.',
  mode = 'default',
  currentUser,
}: {
  title?: string;
  description?: string;
  mode?: 'default' | 'possession-analysis';
  currentUser?: User;
} = {}) {
  const [records, setRecords] = useState<RebateRecord[]>(MOCK_RECORDS);
  const [query, setQuery] = useState('');
  const [submitterFilter, setSubmitterFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [womanFilter, setWomanFilter] = useState('all');
  const [retrofitFilter, setRetrofitFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortOrder, setSortOrder] = useState('oldest');
  const [selected, setSelected] = useState<{ record: RebateRecord; variant: 'af-submitted' | 'proposal-review' } | null>(null);

  const openRecord = (record: RebateRecord, variant: 'af-submitted' | 'proposal-review') =>
    setSelected({ record, variant });

  const permissionLevel = currentUser?.email ? getAfPermissionLevel(currentUser.email) : 'rgf-submit';
  const isMarketingAgent = currentUser?.role === 'ASSET_FINANCIER_STAFF' || permissionLevel === 'internal-proposal';
  const canReviewMarketingSubmissions = !isMarketingAgent;

  const submitters = useMemo(
    () => Array.from(new Set(records.map((r) => r.submittedBy))).sort(),
    [records],
  );

  const withinDateRange = (dateStr: string) => {
    if (dateRange === 'all') return true;
    const date = new Date(dateStr).getTime();
    if (Number.isNaN(date)) return true;
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const windows: Record<string, number> = { day, week: 7 * day, month: 30 * day, year: 365 * day };
    const span = windows[dateRange];
    return span ? now - date <= span : true;
  };

  const filteredRecords = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = records.filter((r) => {
      const matchesQuery =
        !q ||
        r.ticketNumber.toLowerCase().includes(q) ||
        r.firstName.toLowerCase().includes(q) ||
        r.lastName.toLowerCase().includes(q) ||
        r.submittedBy.toLowerCase().includes(q);
      const matchesSubmitter = submitterFilter === 'all' || r.submittedBy === submitterFilter;
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesWoman = womanFilter === 'all' || (womanFilter === 'yes' ? r.isWoman : !r.isWoman);
      const matchesRetrofit = retrofitFilter === 'all' || (retrofitFilter === 'yes' ? r.isRetrofit : !r.isRetrofit);
      const matchesDate = withinDateRange(r.submittedAt);
      return matchesQuery && matchesSubmitter && matchesStatus && matchesWoman && matchesRetrofit && matchesDate;
    });

    return rows.sort((a, b) => {
      const da = new Date(a.submittedAt).getTime();
      const db = new Date(b.submittedAt).getTime();
      return sortOrder === 'oldest' ? da - db : db - da;
    });
  }, [records, query, submitterFilter, statusFilter, womanFilter, retrofitFilter, dateRange, sortOrder]);

  if (selected) {
    return (
      <RebateApplicationDetailsPage
        data={selected.record}
        variant={selected.variant}
        onBack={() => setSelected(null)}
        onSubmitToRgf={(row) => {
          toast.success(`Submitted ${row.ticketNumber} to RGF`, {
            description: 'Application moved from AF proposal to awaiting RGF authorization.',
          });
          setSelected(null);
        }}
      />
    );
  }

  if (mode === 'possession-analysis') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl text-[#023F40]">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Cross-AF possession analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RebateTable rows={filteredRecords} onOpen={(r) => openRecord(r, 'af-submitted')} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPipelineAndDisbursed = records.length;
  const afProposals = records.filter((r) => r.status === 'proposal').length;
  const awaitingRgfAuthorization = records.filter((r) => r.status === 'awaiting-rgf').length;
  const approvedDisbursed = records.filter((r) => r.status === 'approved-disbursed').length;
  const marketingCardStats = {
    submittedToDate: 45,
    awaitingReview: 10,
    approved: 30,
    rejected: 5,
  };
  const submittedByYou = filteredRecords.filter((r) => r.submittedBy === (currentUser?.name || ''));
  const marketingSubmissions = filteredRecords.filter((r) => r.submittedBy.toLowerCase().includes('agent'));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">{title}</h2>
        <p className="text-gray-600 mt-1 text-sm">{description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isMarketingAgent ? (
          <>
            <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Your Total Rebates Submitted to date</p><p className="text-2xl font-bold text-[#023F40]">{marketingCardStats.submittedToDate}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Your Total Rebates Awaiting Review</p><p className="text-2xl font-bold text-amber-600">{marketingCardStats.awaitingReview}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Your Total Rebates Approved</p><p className="text-2xl font-bold text-green-600">{marketingCardStats.approved}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Your Total Rebates Rejected</p><p className="text-2xl font-bold text-red-600">{marketingCardStats.rejected}</p></CardContent></Card>
          </>
        ) : (
          <>
            <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">AF Rebate Proposals for your potential submission to RGF</p><p className="text-2xl font-bold text-[#023F40]">{afProposals}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Total Rebates in Pipeline and Disbursed</p><p className="text-2xl font-bold text-[#023F40]">{totalPipelineAndDisbursed}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Rebates Awaiting RGF Authorization for Disbursement</p><p className="text-2xl font-bold text-blue-600">{awaitingRgfAuthorization}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Approved Rebates Dispersed</p><p className="text-2xl font-bold text-green-600">{approvedDisbursed}</p></CardContent></Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Rebate applications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by ticket, submitter, or client..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Person who submitted rebate proposal</label>
              <Select value={submitterFilter} onValueChange={setSubmitterFilter}>
                <SelectTrigger><SelectValue placeholder="All submitters" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All submitters</SelectItem>
                  {submitters.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="proposal">AF proposal</SelectItem>
                  <SelectItem value="awaiting-rgf">Awaiting RGF authorization</SelectItem>
                  <SelectItem value="approved-disbursed">Approved disbursed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sort by date</label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger><SelectValue placeholder="Oldest to newest" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="oldest">Oldest to newest</SelectItem>
                  <SelectItem value="newest">Newest to oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger><SelectValue placeholder="All time" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="day">Last day</SelectItem>
                  <SelectItem value="week">Last week</SelectItem>
                  <SelectItem value="month">Last month</SelectItem>
                  <SelectItem value="year">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Woman</label>
              <Select value={womanFilter} onValueChange={setWomanFilter}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Women only</SelectItem>
                  <SelectItem value="no">Men only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Retrofit</label>
              <Select value={retrofitFilter} onValueChange={setRetrofitFilter}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Retrofit only</SelectItem>
                  <SelectItem value="no">New e-moto only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            To assess details, click a ticket row or the <span className="font-medium">View Details</span> button.
          </p>

          {canReviewMarketingSubmissions ? (
            <Tabs defaultValue="mine">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="mine">Submitted by you ({submittedByYou.length})</TabsTrigger>
                <TabsTrigger value="marketing">From marketing agents ({marketingSubmissions.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="mine" className="mt-4">
                <RebateTable rows={submittedByYou.length > 0 ? submittedByYou : filteredRecords} onOpen={(r) => openRecord(r, 'af-submitted')} />
              </TabsContent>
              <TabsContent value="marketing" className="mt-4">
                <RebateTable
                  rows={marketingSubmissions}
                  onOpen={(r) => openRecord(r, 'proposal-review')}
                  showSubmitAction
                  onSubmitToRgf={(row) =>
                    toast.success(`Submitted ${row.ticketNumber} to RGF`, {
                      description: 'Application moved from AF proposal to awaiting RGF authorization.',
                    })
                  }
                />
              </TabsContent>
            </Tabs>
          ) : (
            <RebateTable rows={submittedByYou.length > 0 ? submittedByYou : filteredRecords} onOpen={(r) => openRecord(r, 'af-submitted')} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
