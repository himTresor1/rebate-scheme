import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { AlertCircle, Loader2, Search } from 'lucide-react';

interface ForwardToMEDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onForward: (data: MEForwardData) => Promise<void>;
  applicationId: string;
}

export interface MEForwardData {
  reason: string;
  areasOfConcern: string[];
  expectedTimeline: string;
  additionalNotes?: string;
}

const AREAS_OF_CONCERN = [
  { id: 'identity', label: 'Identity Verification Issues' },
  { id: 'income', label: 'Income/Financial Discrepancies' },
  { id: 'residence', label: 'Residence Verification Needed' },
  { id: 'employment', label: 'Employment Status Unclear' },
  { id: 'vehicle', label: 'Vehicle Ownership/Documentation' },
  { id: 'social-registry', label: 'Social Registry Data Inconsistencies' },
  { id: 'eligibility', label: 'Eligibility Criteria Concerns' },
  { id: 'documents', label: 'Document Authenticity Questions' },
  { id: 'prior-claims', label: 'Previous Claims/Applications' },
  { id: 'other', label: 'Other Investigation Required' }
];

const TIMELINE_OPTIONS = [
  { value: '3-days', label: '3 Business Days' },
  { value: '5-days', label: '5 Business Days' },
  { value: '1-week', label: '1 Week' },
  { value: '2-weeks', label: '2 Weeks' },
  { value: 'urgent', label: 'Urgent (24-48 hours)' }
];

export function ForwardToMEDialog({
  open,
  onOpenChange,
  onForward,
  applicationId
}: ForwardToMEDialogProps) {
  const [reason, setReason] = useState('');
  const [areasOfConcern, setAreasOfConcern] = useState<string[]>([]);
  const [expectedTimeline, setExpectedTimeline] = useState('5-days');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAreaToggle = (areaId: string) => {
    setAreasOfConcern(prev => 
      prev.includes(areaId)
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!reason.trim()) {
      return;
    }

    if (areasOfConcern.length === 0) {
      return;
    }

    setSubmitting(true);

    try {
      await onForward({
        reason: reason.trim(),
        areasOfConcern,
        expectedTimeline,
        additionalNotes: additionalNotes.trim() || undefined
      });

      // Reset form
      setReason('');
      setAreasOfConcern([]);
      setExpectedTimeline('5-days');
      setAdditionalNotes('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to forward to M&E:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = reason.trim().length >= 20 && areasOfConcern.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Search className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle>Forward to M&E for Investigation</DialogTitle>
              <DialogDescription>
                This application will be sent to the Monitoring & Evaluation team for further investigation
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Warning Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-medium mb-1">Investigation Required</p>
                <p className="text-amber-800">
                  Please provide detailed information about why this application requires M&E investigation. 
                  The M&E team will review and conduct necessary field verification.
                </p>
              </div>
            </div>
          </div>

          {/* Reason for Investigation */}
          <div className="space-y-2">
            <Label htmlFor="investigation-reason" className="text-sm font-medium">
              Reason for Investigation <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="investigation-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the specific concerns or discrepancies that require investigation..."
              className="min-h-[100px] text-sm"
              required
            />
            <p className="text-xs text-gray-500">
              {reason.length} / 20 minimum characters
              {reason.length < 20 && reason.length > 0 && (
                <span className="text-amber-600 ml-2">
                  • Need {20 - reason.length} more characters
                </span>
              )}
            </p>
          </div>

          {/* Areas of Concern */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Areas of Concern <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-600">
              Select all areas that require investigation (minimum 1 required)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {AREAS_OF_CONCERN.map((area) => (
                <label
                  key={area.id}
                  className="flex items-start gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                >
                  <Checkbox
                    checked={areasOfConcern.includes(area.id)}
                    onCheckedChange={() => handleAreaToggle(area.id)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-gray-900">{area.label}</span>
                </label>
              ))}
            </div>
            {areasOfConcern.length > 0 && (
              <p className="text-xs text-green-600">
                ✓ {areasOfConcern.length} area(s) selected
              </p>
            )}
          </div>

          {/* Expected Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline" className="text-sm font-medium">
              Expected Investigation Timeline
            </Label>
            <select
              id="timeline"
              value={expectedTimeline}
              onChange={(e) => setExpectedTimeline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#023F40] focus:border-transparent"
            >
              {TIMELINE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="additional-notes" className="text-sm font-medium">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="additional-notes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any additional information or specific instructions for the M&E team..."
              className="min-h-[80px] text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Forwarding...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Forward to M&E Team
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
