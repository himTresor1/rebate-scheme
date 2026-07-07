import { useState } from 'react';
import { ApplicationReviewEnhanced } from '../analyst/ApplicationReviewEnhanced';
import { ScoreComparisonView } from './ScoreComparisonView';
import { Button } from '../ui/button';
import { User } from '../../utils/auth';
import { BarChart3, FileText } from 'lucide-react';

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

interface CFOReviewProps {
  application: Application;
  user: User;
  onBack: () => void;
}

export function CFOReview({ application, user, onBack }: CFOReviewProps) {
  const [viewMode, setViewMode] = useState<'comparison' | 'detailed'>('comparison');

  return (
    <div className="space-y-4 container mx-auto p-4 sm:p-6 lg:p-8 max-w-6xl">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-3 bg-white p-4 sm:p-5 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'comparison' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('comparison')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Score Comparison
          </Button>
          <Button
            variant={viewMode === 'detailed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('detailed')}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Detailed Review
          </Button>
        </div>
      </div>

      {/* Conditional View */}
      {viewMode === 'comparison' ? (
        <ScoreComparisonView applicationId={application.id} onBack={onBack} />
      ) : (
        <ApplicationReviewEnhanced
          application={application}
          user={user}
          onBack={onBack}
        />
      )}
    </div>
  );
}
