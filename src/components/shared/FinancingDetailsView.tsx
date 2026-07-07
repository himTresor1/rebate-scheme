import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { FileText, X } from 'lucide-react';

export interface FinancingDetailsData {
  ticketNumber: string;
  applicantName: string;
  status: string;
  isWoman: boolean;
  vehicleType: string;
  financier: string;
  submittedAt: string;
  phoneNumber?: string;
  email?: string;
  nationalId?: string;
  dob?: string;
  rebateAmount?: number;
  documents?: Array<{ label: string; required?: boolean; uploaded?: boolean }>;
}

interface FinancingDetailsViewProps {
  data: FinancingDetailsData;
  onClose?: () => void;
  embedded?: boolean;
}

export function FinancingDetailsView({ data, onClose, embedded = false }: FinancingDetailsViewProps) {
  const docs = data.documents ?? [
    { label: 'National ID', required: true, uploaded: true },
    { label: 'Motorcycle License', required: true, uploaded: true },
    { label: 'Notarized Individual Affidavit', required: true, uploaded: true },
    { label: 'AF Confirmation of Financial Need', required: true, uploaded: true },
    { label: 'AF/Client Confirmation of E-Moto Possession', required: false, uploaded: false },
    { label: 'Mobile Money Statements', required: false, uploaded: false },
  ];

  const content = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div><span className="text-gray-600">Ticket:</span> <span className="font-medium">{data.ticketNumber}</span></div>
        <div><span className="text-gray-600">Status:</span> <Badge variant="outline">{data.status}</Badge></div>
        <div><span className="text-gray-600">Applicant:</span> <span className="font-medium">{data.applicantName}</span></div>
        <div><span className="text-gray-600">Women:</span> <span className="font-medium">{data.isWoman ? 'Yes' : 'No'}</span></div>
        <div><span className="text-gray-600">Vehicle:</span> <span className="font-medium">{data.vehicleType}</span></div>
        <div><span className="text-gray-600">Financier:</span> <span className="font-medium">{data.financier}</span></div>
        <div><span className="text-gray-600">Submitted:</span> <span className="font-medium">{data.submittedAt}</span></div>
        {data.rebateAmount != null && (
          <div><span className="text-gray-600">Rebate:</span> <span className="font-medium">RWF {data.rebateAmount.toLocaleString()}</span></div>
        )}
        {data.phoneNumber && <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{data.phoneNumber}</span></div>}
        {data.email && <div><span className="text-gray-600">Email:</span> <span className="font-medium">{data.email}</span></div>}
        {data.nationalId && <div><span className="text-gray-600">National ID:</span> <span className="font-medium">{data.nationalId}</span></div>}
        {data.dob && <div><span className="text-gray-600">DOB:</span> <span className="font-medium">{data.dob}</span></div>}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Supporting Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {docs.map((doc) => (
            <div key={doc.label} className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#023F40]" />
                <span>{doc.label}{doc.required ? ' *' : ''}</span>
              </div>
              <Button size="sm" variant="outline" disabled={!doc.uploaded}>
                {doc.uploaded ? 'Open' : 'Missing'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  if (embedded) return content;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[#023F40]">View Details on Financing</CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
