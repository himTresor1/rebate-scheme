import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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
    submittedAt: '2026-04-26',
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
    submittedAt: '2026-04-27',
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
    submittedAt: '2026-03-15',
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
  description = 'Track all rebate applications and submission stages.',
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
  const [selected, setSelected] = useState<RebateRecord | null>(null);

  const permissionLevel = currentUser?.email ? getAfPermissionLevel(currentUser.email) : 'rgf-submit';
  const isMarketingAgent = currentUser?.role === 'ASSET_FINANCIER_STAFF' || permissionLevel === 'internal-proposal';
  const canReviewMarketingSubmissions = !isMarketingAgent;

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        r.ticketNumber.toLowerCase().includes(q) ||
        r.firstName.toLowerCase().includes(q) ||
        r.lastName.toLowerCase().includes(q) ||
        r.submittedBy.toLowerCase().includes(q)
      );
    });
  }, [records, query]);

  if (selected) {
    return <RebateApplicationDetailsPage data={selected} onBack={() => setSelected(null)} />;
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
            <RebateTable rows={filteredRecords} onOpen={setSelected} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPipelineAndDisbursed = records.length;
  const afProposals = records.filter((r) => r.status === 'proposal').length;
  const awaitingRgfAuthorization = records.filter((r) => r.status === 'awaiting-rgf').length;
  const approvedDisbursed = records.filter((r) => r.status === 'approved-disbursed').length;
  const submittedByYou = filteredRecords.filter((r) => r.submittedBy === (currentUser?.name || ''));
  const marketingSubmissions = filteredRecords.filter((r) => r.submittedBy.toLowerCase().includes('agent'));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">{title}</h2>
        <p className="text-gray-600 mt-1 text-sm">{description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Total rebates in pipeline and disbursed</p><p className="text-2xl font-bold text-[#023F40]">{totalPipelineAndDisbursed}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">AF proposals pending submission to RGF</p><p className="text-2xl font-bold text-amber-600">{afProposals}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Rebates awaiting RGF authorization</p><p className="text-2xl font-bold text-blue-600">{awaitingRgfAuthorization}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Approved rebates disbursed</p><p className="text-2xl font-bold text-green-600">{approvedDisbursed}</p></CardContent></Card>
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

          {canReviewMarketingSubmissions ? (
            <Tabs defaultValue="mine">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="mine">Submitted by you ({submittedByYou.length})</TabsTrigger>
                <TabsTrigger value="marketing">From marketing agents ({marketingSubmissions.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="mine" className="mt-4">
                <RebateTable rows={submittedByYou.length > 0 ? submittedByYou : filteredRecords} onOpen={setSelected} />
              </TabsContent>
              <TabsContent value="marketing" className="mt-4">
                <RebateTable
                  rows={marketingSubmissions}
                  onOpen={setSelected}
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
            <RebateTable rows={submittedByYou.length > 0 ? submittedByYou : filteredRecords} onOpen={setSelected} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
