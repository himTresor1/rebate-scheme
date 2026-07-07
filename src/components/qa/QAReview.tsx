import { RebateVerificationView } from './RebateVerificationView';
import { User } from '../../utils/auth';

interface Application {
  id: string;
  companyName: string;
  registrationNumber: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  rebateAmount: string;
  projectDescription: string;
  vehicleCount?: string;
  emissionReduction?: string;
  documents?: {
    businessLicense?: { name: string; url: string };
    financialStatements?: { name: string; url: string };
    emissionCertificate?: { name: string; url: string };
  };
  status: string;
  createdAt: string;
  flaggedForCFO?: boolean;
  flagReason?: string;
  [key: string]: any;
}

interface QAReviewProps {
  application: Application;
  user: User;
  onBack: () => void;
}

export function QAReview({ application, user, onBack }: QAReviewProps) {
  return (
    <RebateVerificationView
      application={application}
      user={user}
      onBack={onBack}
    />
  );
}
