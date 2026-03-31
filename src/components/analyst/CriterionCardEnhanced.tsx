import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import { DocumentUploadField } from './DocumentUploadField';

interface CriterionCardEnhancedProps {
  criterion: {
    id: string;
    text: string;
  };
  index: number;
  evaluation: boolean | null;
  comment?: string;
  documents?: Array<{
    name: string;
    url: string;
    uploadedAt: string;
    uploadedBy?: string;
  }>;
  onEvaluationChange: (value: boolean) => void;
  onCommentChange: (comment: string) => void;
  onDocumentsChange: (documents: any[]) => void;
  isReadOnly?: boolean;
}

export function CriterionCardEnhanced({
  criterion,
  index,
  evaluation,
  comment = '',
  documents = [],
  onEvaluationChange,
  onCommentChange,
  onDocumentsChange,
  isReadOnly = false
}: CriterionCardEnhancedProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card 
      className={evaluation !== undefined && evaluation !== null ? 'border-[#6DB27F] shadow-md' : ''}
    >
      <CardContent className="p-4">
        <div className="flex gap-2 mb-3">
          <span className="text-[#6DB27F] font-semibold">{index + 1}.</span>
          <p className="flex-1 text-sm text-gray-700">{criterion.text}</p>
        </div>

        <div className="flex gap-2 mb-3">
          <Button
            size="sm"
            variant={evaluation === true ? 'default' : 'outline'}
            onClick={() => onEvaluationChange(true)}
            className={`flex-1 ${evaluation === true ? 'bg-[#6DB27F] hover:bg-[#5da170]' : ''}`}
            disabled={isReadOnly}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            YES
          </Button>
          <Button
            size="sm"
            variant={evaluation === false ? 'destructive' : 'outline'}
            onClick={() => onEvaluationChange(false)}
            className="flex-1"
            disabled={isReadOnly}
          >
            <XCircle className="w-4 h-4 mr-1" />
            NO
          </Button>
        </div>

        {/* Toggle for comments and uploads */}
        {!isReadOnly && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-xs text-gray-600 hover:text-[#023F40]"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Hide Comments & Documents
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Add Comments & Documents {documents.length > 0 && `(${documents.length})`}
              </>
            )}
          </Button>
        )}

        {/* Expanded section for comments and document upload */}
        {isExpanded && !isReadOnly && (
          <div className="mt-3 space-y-3 border-t pt-3">
            {/* Comments field */}
            <div>
              <Label className="text-xs text-gray-600">Comments (Optional)</Label>
              <Textarea
                value={comment}
                onChange={(e) => onCommentChange(e.target.value)}
                placeholder="Add specific notes or observations for this criterion..."
                rows={2}
                className="mt-1 text-xs"
              />
            </div>

            {/* Document upload */}
            <div>
              <Label className="text-xs text-gray-600 mb-2 block">Supporting Documents</Label>
              <DocumentUploadField
                documents={documents}
                onDocumentsChange={onDocumentsChange}
                label="Upload Document"
                multiple={true}
                maxFiles={3}
              />
            </div>
          </div>
        )}

        {/* Show uploaded docs count if not expanded */}
        {!isExpanded && documents.length > 0 && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              {documents.length} document(s) uploaded
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
