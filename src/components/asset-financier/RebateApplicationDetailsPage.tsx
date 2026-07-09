import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, FileText } from 'lucide-react';

export interface RebateApplicationDetailsData {
  ticketNumber: string;
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
  retrofitAssembler?: string;
  status: 'proposal' | 'awaiting-rgf' | 'approved-disbursed';
  submittedAt: string;
  supportingDocuments: string[];
  affidavitUploaded: boolean;
  afFinancialNeedUploaded: boolean;
  iceAgreementUploaded: boolean;
}

interface RebateApplicationDetailsPageProps {
  data: RebateApplicationDetailsData;
  onBack: () => void;
}

const statusBadgeClass: Record<RebateApplicationDetailsData['status'], string> = {
  proposal: 'bg-amber-100 text-amber-800',
  'awaiting-rgf': 'bg-blue-100 text-blue-800',
  'approved-disbursed': 'bg-green-100 text-green-800',
};

const statusLabel: Record<RebateApplicationDetailsData['status'], string> = {
  proposal: 'AF proposal',
  'awaiting-rgf': 'Awaiting RGF authorization',
  'approved-disbursed': 'Approved disbursed',
};

export function RebateApplicationDetailsPage({ data, onBack }: RebateApplicationDetailsPageProps) {
  const openDocument = (name: string) => {
    const blob = new Blob([`Demo document preview for ${name}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Rebate Status
        </Button>
        <Badge className={statusBadgeClass[data.status]}>{statusLabel[data.status]}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#023F40]">Rebate Application Details — {data.ticketNumber}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div><span className="text-gray-500">Submitted by</span><p className="font-medium">{data.submittedBy}</p></div>
            <div><span className="text-gray-500">Submitted on</span><p className="font-medium">{data.submittedAt}</p></div>
            <div><span className="text-gray-500">Ticket No</span><p className="font-medium text-[#023F40]">{data.ticketNumber}</p></div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Client identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div><span className="text-gray-500">First Name(s)</span><p className="font-medium">{data.firstName}</p></div>
              <div><span className="text-gray-500">Last Name(s)</span><p className="font-medium">{data.lastName}</p></div>
              <div><span className="text-gray-500">National ID</span><p className="font-medium">{data.nationalId}</p></div>
              <div><span className="text-gray-500">Moto license</span><p className="font-medium">{data.motoLicense}</p></div>
              <div><span className="text-gray-500">Woman</span><p className="font-medium">{data.isWoman ? 'Yes' : 'No'}</p></div>
              <div><span className="text-gray-500">Retrofit</span><p className="font-medium">{data.isRetrofit ? 'Yes' : 'No'}</p></div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Vehicle and financing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div><span className="text-gray-500">E-Moto Supplier</span><p className="font-medium">{data.supplier}</p></div>
              <div><span className="text-gray-500">E-Moto Model</span><p className="font-medium">{data.model}</p></div>
              <div><span className="text-gray-500">Retrofit Assembler</span><p className="font-medium">{data.retrofitAssembler || 'N/A'}</p></div>
              <div><span className="text-gray-500">Retail cost of e-moto (RWF)</span><p className="font-medium">{data.retailCost.toLocaleString()}</p></div>
              <div><span className="text-gray-500">Rebate amount (RWF)</span><p className="font-medium text-[#023F40]">{data.rebateAmount.toLocaleString()}</p></div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Uploaded documents</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
                <span>Individual Affidavit of Financial Need</span>
                <Badge className={data.affidavitUploaded ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                  {data.affidavitUploaded ? 'Uploaded' : 'Missing'}
                </Badge>
              </div>
              <div className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
                <span>AF Confirmation of Financial Need</span>
                <Badge className={data.afFinancialNeedUploaded ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                  {data.afFinancialNeedUploaded ? 'Uploaded' : 'Missing'}
                </Badge>
              </div>
              {data.isRetrofit && (
                <div className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
                  <span>ICE-Moto Engine Disposal Agreement</span>
                  <Badge className={data.iceAgreementUploaded ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                    {data.iceAgreementUploaded ? 'Uploaded' : 'Missing'}
                  </Badge>
                </div>
              )}
              {data.supportingDocuments.map((doc) => (
                <div key={doc} className="flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>{doc}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openDocument(doc)}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
