import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FinancingDetailsView } from '../shared/FinancingDetailsView';
import { toast } from 'sonner';

interface RebateReassignmentReviewProps {
  record: {
    ticketNumber: string;
    priorClient: string;
    newClient: string;
    approvalDate: string;
    financier: string;
    vehicleType: string;
    rebateAmount: number;
  };
  onBack: () => void;
}

export function RebateReassignmentReview({ record, onBack }: RebateReassignmentReviewProps) {
  const [comment, setComment] = useState('');

  const submit = (decision: 'verified' | 'rejected') => {
    if (!comment.trim() || comment.trim().length < 20) {
      toast.error('Mandatory comment required (minimum 20 characters)');
      return;
    }
    toast.success(decision === 'verified' ? 'Reassignment verified' : 'Reassignment rejected');
    onBack();
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack}>Back to pipeline</Button>
      <FinancingDetailsView
        embedded
        data={{
          ticketNumber: record.ticketNumber,
          applicantName: record.newClient,
          status: 'Reassignment review',
          isWoman: false,
          vehicleType: record.vehicleType,
          financier: record.financier,
          submittedAt: record.approvalDate,
          rebateAmount: record.rebateAmount,
        }}
      />
      <Card>
        <CardHeader><CardTitle className="text-base">Prior client: {record.priorClient}</CardTitle></CardHeader>
        <CardContent>
          <Label>Verification comment *</Label>
          <Textarea className="mt-2" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Document verification results and rationale..." />
          <div className="flex gap-2 mt-4">
            <Button variant="destructive" onClick={() => submit('rejected')}>Reject reassignment</Button>
            <Button className="bg-[#023F40] hover:bg-[#035f60]" onClick={() => submit('verified')}>Verify reassignment</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
