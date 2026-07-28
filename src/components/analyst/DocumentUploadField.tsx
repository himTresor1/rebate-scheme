import { useState } from 'react';
import { Button } from '../ui/button';
import { Upload, X, FileText, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { formatDisplayDateTime } from '../../utils/dateFormat';

interface UploadedDocument {
  name: string;
  url: string;
  uploadedAt: string;
  uploadedBy?: string;
}

interface DocumentUploadFieldProps {
  documents?: UploadedDocument[];
  onDocumentsChange: (documents: UploadedDocument[]) => void;
  label?: string;
  multiple?: boolean;
  disabled?: boolean;
  maxFiles?: number;
  acceptedFileTypes?: string;
}

export function DocumentUploadField({
  documents = [],
  onDocumentsChange,
  label = "Upload Documents",
  multiple = false,
  disabled = false,
  maxFiles = 5,
  acceptedFileTypes = ".pdf,.jpg,.jpeg,.png"
}: DocumentUploadFieldProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Check max files limit
    if (documents.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(f => f.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error('Some files exceed the 10MB size limit');
      return;
    }

    setUploading(true);

    try {
      // Simulate file upload - in production, this would upload to server/storage
      const newDocuments: UploadedDocument[] = await Promise.all(
        files.map(async (file) => {
          // Simulate upload delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Create mock URL (in production, this would be the actual uploaded file URL)
          const mockUrl = `https://storage.example.com/documents/${Date.now()}-${file.name}`;
          
          return {
            name: file.name,
            url: mockUrl,
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'Current Analyst'
          };
        })
      );

      onDocumentsChange([...documents, ...newDocuments]);
      toast.success(`${newDocuments.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload files');
      console.error(error);
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemoveDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    onDocumentsChange(newDocuments);
    toast.success('Document removed');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div>
        <input
          type="file"
          id={`file-upload-${label}`}
          className="hidden"
          multiple={multiple}
          accept={acceptedFileTypes}
          onChange={handleFileSelect}
          disabled={disabled || uploading || documents.length >= maxFiles}
        />
        <label htmlFor={`file-upload-${label}`}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || uploading || documents.length >= maxFiles}
            className="cursor-pointer"
            asChild
          >
            <span>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {label}
                </>
              )}
            </span>
          </Button>
        </label>
        {maxFiles > 1 && (
          <p className="text-xs text-gray-500 mt-1">
            {documents.length} / {maxFiles} files uploaded
          </p>
        )}
      </div>

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDisplayDateTime(doc.uploadedAt)}
                    {doc.uploadedBy && ` • ${doc.uploadedBy}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(doc.url, '_blank')}
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveDocument(index)}
                  disabled={disabled}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
