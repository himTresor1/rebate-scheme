import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { SubmitApplicationForm } from './SubmitApplicationForm';

interface TransferDraft {
  ticketNumber: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  dateOfBirth: string;
  isWoman: 'yes' | 'no';
  driversLicense: string;
  phoneNumber: string;
  supplier: string;
  model: string;
  retrofitAssembler: string;
  retailCost: string;
  isRetrofit: boolean;
}

const MOCK_BY_TICKET: Record<string, TransferDraft> = {
  'REB-001': {
    ticketNumber: 'REB-001',
    firstName: 'Jean Claude',
    lastName: 'Ndayisaba',
    dateOfBirth: '1995-06-12',
    nationalId: '1198780012345678',
    isWoman: 'no',
    driversLicense: 'DL-2024-1022',
    phoneNumber: '+250788000001',
    supplier: 'Ampersand',
    model: 'AMP-E2',
    retrofitAssembler: '',
    retailCost: '830000',
    isRetrofit: false,
  },
  'REB-002': {
    ticketNumber: 'REB-002',
    firstName: 'Grace',
    lastName: 'Uwase',
    dateOfBirth: '1997-03-01',
    nationalId: '1198780098765432',
    isWoman: 'yes',
    driversLicense: 'DL-2023-8831',
    phoneNumber: '+250788000002',
    supplier: 'Spiro',
    model: 'SP-Retrofit',
    retrofitAssembler: 'Green Volt Retrofit Ltd',
    retailCost: '800000',
    isRetrofit: true,
  },
};

export function ClientTransferForm({ organizationId }: { organizationId: string }) {
  const [ticketLookup, setTicketLookup] = useState('');
  const [loadedDraft, setLoadedDraft] = useState<TransferDraft | null>(null);

  const loadTicket = () => {
    const found = MOCK_BY_TICKET[ticketLookup.trim().toUpperCase()];
    if (!found) {
      toast.error('Ticket not found in demo dataset');
      return;
    }
    setLoadedDraft({ ...found });
    toast.success(`Loaded ${found.ticketNumber}`, {
      description: 'Application has been pre-filled. Edit as needed and submit.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">Client Transfer</h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter the original ticket number to load the existing application, then edit the client and any other data before submitting.
        </p>
      </div>

      <div className="bg-white border rounded-lg p-6 space-y-4">
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          This form is pre-filled from the original application. Update the new client and any changed fields, then submit again.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Original ticket number (e.g., REB-001)"
            value={ticketLookup}
            onChange={(e) => setTicketLookup(e.target.value)}
          />
          <Button onClick={loadTicket} className="bg-[#023F40] hover:bg-[#035f60]">
            Load application
          </Button>
        </div>
      </div>

      {loadedDraft && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Pre-filled application — {loadedDraft.ticketNumber}</h3>
          <SubmitApplicationForm
            key={loadedDraft.ticketNumber}
            organizationId={organizationId}
            prefilledTicketNumber={loadedDraft.ticketNumber}
            initialData={{
              firstName: loadedDraft.firstName,
              lastName: loadedDraft.lastName,
              dateOfBirth: loadedDraft.dateOfBirth,
              nationalId: loadedDraft.nationalId,
              isWoman: loadedDraft.isWoman,
              driversLicense: loadedDraft.driversLicense,
              phoneNumber: loadedDraft.phoneNumber,
              brand: loadedDraft.supplier,
              model: loadedDraft.model,
              retrofitAssembler: loadedDraft.retrofitAssembler,
              purchasePrice: loadedDraft.retailCost,
              isRetrofit: loadedDraft.isRetrofit,
            }}
          />
        </div>
      )}
    </div>
  );
}
