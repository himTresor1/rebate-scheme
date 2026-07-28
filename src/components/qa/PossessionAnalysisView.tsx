import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Filter, Upload, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { formatNumber } from '../../utils/numberFormat';
import { getRebatePercent } from '../../utils/rebateCalculation';
import { DOC_NAMES } from '../../utils/documentNames';

type PossessionStatus = 'awaiting-confirmation' | 'confirmation-submitted';

type PossessionAnalysisRow = {
  ticketNumber: string;
  assetFinancier: string;
  submittedBy: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  motoLicense: string;
  isWoman: boolean;
  isRetrofit: boolean;
  retailCost: number;
  rebateAmount: number;
  supplier: string;
  model: string;
  retrofitAssembler: string;
  supportingDocuments: string[];
  affidavitUploaded: boolean;
  iceAgreementUploaded: boolean | null; // null = N/A for new e-moto
  possessionStatus: PossessionStatus;
  phone?: string;
  email?: string;
  qaApprovedAt?: string;
};

const MOCK_POSSESSION_ANALYSIS: PossessionAnalysisRow[] = [
  {
    ticketNumber: 'REB-001',
    assetFinancier: 'Bank of Kigali',
    submittedBy: 'Pamela Mugabe',
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
    retrofitAssembler: 'N/A',
    supportingDocuments: ['Signed financing contract', 'National ID'],
    affidavitUploaded: true,
    iceAgreementUploaded: null,
    possessionStatus: 'awaiting-confirmation',
    phone: '+250-788-1001',
    email: 'j.ndayisaba@example.rw',
    qaApprovedAt: '2026-06-01',
  },
  {
    ticketNumber: 'REB-002',
    assetFinancier: 'Bboxx',
    submittedBy: 'Claire Mukamana',
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
    retrofitAssembler: 'REM',
    supportingDocuments: ['Retrofit suitability statement'],
    affidavitUploaded: true,
    iceAgreementUploaded: true,
    possessionStatus: 'awaiting-confirmation',
    phone: '+250-788-1002',
    email: 'g.uwase@example.rw',
    qaApprovedAt: '2026-06-02',
  },
  {
    ticketNumber: 'REB-005',
    assetFinancier: 'Equity Bank',
    submittedBy: 'James Uwizeye',
    firstName: 'Marie Claire',
    lastName: 'Uwimana',
    nationalId: '1198780033333333',
    motoLicense: 'DL-2025-4201',
    isWoman: true,
    isRetrofit: false,
    retailCost: 750000,
    rebateAmount: 187500,
    supplier: 'Safi',
    model: 'City',
    retrofitAssembler: 'N/A',
    supportingDocuments: ['AF confirmation of financial need'],
    affidavitUploaded: true,
    iceAgreementUploaded: null,
    possessionStatus: 'awaiting-confirmation',
    phone: '+250-788-1003',
    email: 'm.uwimana@example.rw',
    qaApprovedAt: '2026-06-03',
  },
  {
    ticketNumber: 'AF-BOK-1',
    assetFinancier: 'Bank of Kigali',
    submittedBy: 'Pamela Mugabe',
    firstName: 'Patrick',
    lastName: 'N',
    nationalId: '1198780070707070',
    motoLicense: 'DL-2024-5500',
    isWoman: false,
    isRetrofit: false,
    retailCost: 3500000,
    rebateAmount: 630000,
    supplier: 'Ampersand',
    model: 'Pro',
    retrofitAssembler: 'N/A',
    supportingDocuments: ['Signed financing contract', 'Mobile money statement'],
    affidavitUploaded: true,
    iceAgreementUploaded: null,
    possessionStatus: 'confirmation-submitted',
    phone: '+250-788-1004',
    email: 'patrick.n@example.rw',
    qaApprovedAt: '2026-06-14',
  },
  {
    ticketNumber: 'AF-EQB-12',
    assetFinancier: 'Equity Bank',
    submittedBy: 'Divine Agent',
    firstName: 'Divine',
    lastName: 'Mukamana',
    nationalId: '1198780099999999',
    motoLicense: 'DL-2024-6600',
    isWoman: true,
    isRetrofit: true,
    retailCost: 2900000,
    rebateAmount: 725000,
    supplier: 'Rem',
    model: 'Retrofit Kit',
    retrofitAssembler: 'Safi',
    supportingDocuments: ['ICE disposal agreement'],
    affidavitUploaded: true,
    iceAgreementUploaded: true,
    possessionStatus: 'awaiting-confirmation',
    phone: '+250-788-1005',
    email: 'd.mukamana@example.rw',
    qaApprovedAt: '2026-06-05',
  },
  {
    ticketNumber: 'AF-REM-8',
    assetFinancier: 'REM',
    submittedBy: 'Claire Mukamana',
    firstName: 'Eric',
    lastName: 'Habimana',
    nationalId: '1198780044444444',
    motoLicense: 'DL-2023-7700',
    isWoman: false,
    isRetrofit: true,
    retailCost: 2800000,
    rebateAmount: 560000,
    supplier: 'Rem',
    model: 'Retrofit Kit',
    retrofitAssembler: 'Rem',
    supportingDocuments: ['Retrofit suitability statement'],
    affidavitUploaded: true,
    iceAgreementUploaded: true,
    possessionStatus: 'confirmation-submitted',
    phone: '+250-788-1006',
    email: 'e.habimana@example.rw',
    qaApprovedAt: '2026-06-01',
  },
];

function statusBadge(status: PossessionStatus) {
  if (status === 'confirmation-submitted') {
    return <Badge className="bg-green-100 text-green-800">Confirmation submitted</Badge>;
  }
  return <Badge className="bg-amber-100 text-amber-800">Awaiting confirmation</Badge>;
}

export function PossessionAnalysisView() {
  const [rows, setRows] = useState(MOCK_POSSESSION_ANALYSIS);
  const [query, setQuery] = useState('');
  const [filterAf, setFilterAf] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterWomen, setFilterWomen] = useState('all');
  const [filterRetrofit, setFilterRetrofit] = useState('all');
  const [selected, setSelected] = useState<PossessionAnalysisRow | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');

  const financiers = useMemo(
    () => Array.from(new Set(rows.map((r) => r.assetFinancier))).sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const q = query.toLowerCase();
      if (
        q &&
        !r.ticketNumber.toLowerCase().includes(q) &&
        !r.firstName.toLowerCase().includes(q) &&
        !r.lastName.toLowerCase().includes(q) &&
        !r.submittedBy.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (filterAf !== 'all' && r.assetFinancier !== filterAf) return false;
      if (filterStatus !== 'all' && r.possessionStatus !== filterStatus) return false;
      if (filterWomen === 'yes' && !r.isWoman) return false;
      if (filterWomen === 'no' && r.isWoman) return false;
      if (filterRetrofit === 'yes' && !r.isRetrofit) return false;
      if (filterRetrofit === 'no' && r.isRetrofit) return false;
      return true;
    });
  }, [rows, query, filterAf, filterStatus, filterWomen, filterRetrofit]);

  const awaitingCount = rows.filter((r) => r.possessionStatus === 'awaiting-confirmation').length;
  const submittedCount = rows.filter((r) => r.possessionStatus === 'confirmation-submitted').length;

  const openUploadPage = (row: PossessionAnalysisRow) => {
    setSelected(row);
    setUploadFileName('');
  };

  const handleConfirmUpload = () => {
    if (!selected) return;
    if (!uploadFileName.trim()) {
      toast.error('Please select the verified E-Moto Possession Statement to upload.');
      return;
    }
    setRows((prev) =>
      prev.map((r) =>
        r.ticketNumber === selected.ticketNumber
          ? { ...r, possessionStatus: 'confirmation-submitted' as const }
          : r
      )
    );
    toast.success(`Possession statement uploaded for ${selected.ticketNumber}`, {
      description: 'Rebate moved to confirmation submitted and can be included in the CFO request once eligible.',
    });
    setSelected(null);
    setUploadFileName('');
  };

  if (selected) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setSelected(null)} className="w-fit">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Possession Analysis
        </Button>
        <div>
          <h2 className="text-lg sm:text-xl text-[#023F40]">Upload Verified E-Moto Possession Statement</h2>
          <p className="text-sm text-gray-600 mt-1 max-w-3xl">
            Review the complete rebate information and documentation, then upload the verified AF/Client
            Confirmation of Individual E-Moto Possession.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Ticket No.</p>
              <p className="font-semibold text-[#023F40]">{selected.ticketNumber}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Asset Financier</p>
              <p className="font-medium">{selected.assetFinancier}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Submitted By</p>
              <p className="font-medium">{selected.submittedBy}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Applicant</p>
              <p className="font-medium">
                {selected.lastName}, {selected.firstName}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">National ID</p>
              <p className="font-medium">{selected.nationalId}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Moto License</p>
              <p className="font-medium">{selected.motoLicense}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Gender</p>
              <p className="font-medium">{selected.isWoman ? 'Woman' : 'Man'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Vehicle Type</p>
              <p className="font-medium">{selected.isRetrofit ? 'Retrofit' : 'New E-Moto'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">E-Moto Supplier</p>
              <p className="font-medium">{selected.supplier}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">E-Moto Model</p>
              <p className="font-medium">{selected.model}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Retrofit Assembler</p>
              <p className="font-medium">{selected.retrofitAssembler}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Retail Cost (RWF)</p>
              <p className="font-medium">{formatNumber(selected.retailCost)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Rebate Amount (RWF)</p>
              <p className="font-semibold text-[#023F40]">{formatNumber(selected.rebateAmount)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Rebate Percentage (%)</p>
              <p className="font-semibold text-[#023F40]">
                {getRebatePercent({ isWoman: selected.isWoman, isRetrofit: selected.isRetrofit })}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Phone</p>
              <p className="font-medium">{selected.phone || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
              <p className="font-medium">{selected.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
              <div className="mt-1">{statusBadge(selected.possessionStatus)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-[#023F40]">Existing Documentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between border rounded-lg p-3">
              <span>{DOC_NAMES.notarizedAffidavit}</span>
              <span>{selected.affidavitUploaded ? 'Uploaded' : 'Missing'}</span>
            </div>
            <div className="flex justify-between border rounded-lg p-3">
              <span>{DOC_NAMES.iceEngineDisposal}</span>
              <span>
                {selected.iceAgreementUploaded === null
                  ? 'N/A'
                  : selected.iceAgreementUploaded
                    ? 'Uploaded'
                    : 'Missing'}
              </span>
            </div>
            {selected.supportingDocuments.map((doc) => (
              <div key={doc} className="flex justify-between border rounded-lg p-3">
                <span>{doc}</span>
                <Button size="sm" variant="outline" className="h-7" type="button">
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-[#023F40]">
              Upload Verified E-Moto Possession Statement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="possession-file">{DOC_NAMES.possessionStatement}</Label>
              <Input
                id="possession-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="mt-2"
                onChange={(e) => setUploadFileName(e.target.files?.[0]?.name || '')}
              />
              {uploadFileName && (
                <p className="text-xs text-gray-500 mt-2">Selected: {uploadFileName}</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button className="bg-[#023F40] hover:bg-[#035f60]" onClick={handleConfirmUpload}>
                <Upload className="w-4 h-4 mr-2" />
                Upload &amp; Mark Submitted
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">Analysis of Individual E-Moto Possession</h2>
        <p className="text-sm text-gray-600 mt-1 max-w-4xl">
          This page enables the Rebate Team and QA Team to track approved e-moto rebates that do not yet have an
          AF/Client E-Moto Possession Statement. The Rebate Team can upload verified possession statements after
          confirmation. Once uploaded, the rebate moves to Confirmation submitted and can be included in the QA
          CFO disbursement request when eligible.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Awaiting confirmation</p>
            <p className="text-2xl font-bold text-[#023F40]">{awaitingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Confirmation submitted</p>
            <p className="text-2xl font-bold text-[#023F40]">{submittedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600">Asset Financier</p>
              <Select value={filterAf} onValueChange={setFilterAf}>
                <SelectTrigger className="border-[#023F40]/60">
                  <SelectValue placeholder="Asset Financier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Asset Financiers</SelectItem>
                  {financiers.map((af) => (
                    <SelectItem key={af} value={af}>
                      {af}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600">Status</p>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="awaiting-confirmation">Awaiting confirmation</SelectItem>
                  <SelectItem value="confirmation-submitted">Confirmation submitted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600">Search</p>
              <Input
                placeholder="Search ticket, applicant, or submitter..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
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
          </div>
          <p className="text-xs text-gray-500">
            Showing {filtered.length} of {rows.length} approved rebates
            {filterAf !== 'all' ? ` for ${filterAf}` : ''}.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[#023F40]">Possession Analysis Table</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-600">No rebates match the current filters.</div>
          ) : (
            <table className="w-full min-w-[1600px] text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="pb-2 pr-3 font-medium">Ticket No.</th>
                  <th className="pb-2 pr-3 font-medium">Person who submitted rebate proposal</th>
                  <th className="pb-2 pr-3 font-medium">Last Name(s) / First Name(s)</th>
                  <th className="pb-2 pr-3 font-medium">National ID</th>
                  <th className="pb-2 pr-3 font-medium">Moto license</th>
                  <th className="pb-2 pr-3 font-medium">Woman</th>
                  <th className="pb-2 pr-3 font-medium">Retrofit</th>
                  <th className="pb-2 pr-3 font-medium">Asset Financier</th>
                  <th className="pb-2 pr-3 font-medium">Retail Cost of E-Moto (RWF)</th>
                  <th className="pb-2 pr-3 font-medium">Rebate Amount (RWF)</th>
                  <th className="pb-2 pr-3 font-medium">Rebate Percentage (%)</th>
                  <th className="pb-2 pr-3 font-medium">E-Moto Supplier</th>
                  <th className="pb-2 pr-3 font-medium">E-Moto Model</th>
                  <th className="pb-2 pr-3 font-medium">Retrofit Assembler</th>
                  <th className="pb-2 pr-3 font-medium">Any supporting documents</th>
                  <th className="pb-2 pr-3 font-medium">{DOC_NAMES.notarizedAffidavit}</th>
                  <th className="pb-2 pr-3 font-medium">{DOC_NAMES.iceEngineDisposal}</th>
                  <th className="pb-2 pr-3 font-medium">Status</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.ticketNumber} className="border-b align-top">
                    <td className="py-2 pr-3 font-semibold text-[#023F40]">{r.ticketNumber}</td>
                    <td className="py-2 pr-3">{r.submittedBy}</td>
                    <td className="py-2 pr-3">
                      {r.lastName} / {r.firstName}
                    </td>
                    <td className="py-2 pr-3">{r.nationalId}</td>
                    <td className="py-2 pr-3">{r.motoLicense}</td>
                    <td className="py-2 pr-3">{r.isWoman ? 'Yes' : 'No'}</td>
                    <td className="py-2 pr-3">{r.isRetrofit ? 'Yes' : 'No'}</td>
                    <td className="py-2 pr-3">{r.assetFinancier}</td>
                    <td className="py-2 pr-3">{formatNumber(r.retailCost)}</td>
                    <td className="py-2 pr-3">{formatNumber(r.rebateAmount)}</td>
                    <td className="py-2 pr-3">
                      {getRebatePercent({ isWoman: r.isWoman, isRetrofit: r.isRetrofit })}
                    </td>
                    <td className="py-2 pr-3">{r.supplier}</td>
                    <td className="py-2 pr-3">{r.model}</td>
                    <td className="py-2 pr-3">{r.retrofitAssembler}</td>
                    <td className="py-2 pr-3">{r.supportingDocuments.length}</td>
                    <td className="py-2 pr-3">{r.affidavitUploaded ? 'Uploaded' : 'Missing'}</td>
                    <td className="py-2 pr-3">
                      {r.iceAgreementUploaded === null
                        ? 'N/A'
                        : r.iceAgreementUploaded
                          ? 'Uploaded'
                          : 'Missing'}
                    </td>
                    <td className="py-2 pr-3">{statusBadge(r.possessionStatus)}</td>
                    <td className="py-2">
                      {r.possessionStatus === 'awaiting-confirmation' ? (
                        <Button
                          size="sm"
                          className="h-8 bg-[#023F40] hover:bg-[#035f60]"
                          onClick={() => openUploadPage(r)}
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Upload Possession Statement
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="h-8" onClick={() => openUploadPage(r)}>
                          View
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
