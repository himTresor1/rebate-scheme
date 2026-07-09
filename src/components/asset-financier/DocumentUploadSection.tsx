import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Upload, CheckCircle2, AlertCircle, FileText, X } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentStatus {
  uploaded: boolean;
  uploadedAt?: string;
  name?: string;
}

interface Documents {
  signedLease?: DocumentStatus;
  afFinancialNeed?: DocumentStatus;
  iceDisposalAgreement?: DocumentStatus;
  affidavit?: DocumentStatus;
  nationalId?: DocumentStatus;
  taxiLicense?: DocumentStatus;
  coopOrReference?: DocumentStatus;
  secondReference?: DocumentStatus;
  retrofitCompanyLetter?: DocumentStatus;
  retrofitOwnerLetter?: DocumentStatus;
  retrofitAgreement?: DocumentStatus;
  mobileMoneyStatements?: DocumentStatus;
}

interface DocumentUploadSectionProps {
  isRetrofit: boolean;
  documents: Documents;
  onDocumentUpload: (docType: string, file: { name: string }) => void;
  onDocumentRemove: (docType: string) => void;
  onRetrofitToggle: (value: boolean) => void;
}

export function DocumentUploadSection({
  isRetrofit,
  documents,
  onDocumentUpload,
  onDocumentRemove,
  onRetrofitToggle
}: DocumentUploadSectionProps) {
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [additionalDocs, setAdditionalDocs] = useState<Array<{ id: string; title: string; fileName?: string }>>([
    { id: 'extra-1', title: '' },
  ]);

  const handleFileUpload = (docType: string) => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        setUploadingDoc(docType);
        
        // Simulate upload delay
        setTimeout(() => {
          onDocumentUpload(docType, { name: file.name });
          setUploadingDoc(null);
          toast.success('Document uploaded successfully', {
            description: file.name
          });
        }, 1000);
      }
    };
    
    input.click();
  };

  const mandatoryDocs = [
    {
      key: 'signedLease',
      label: 'Signed Lease with Retail Cost of E-Moto',
      description: 'Signed lease documenting retail cost (RWF)',
    },
    {
      key: 'affidavit',
      label: 'Individual Affidavit of Financial Need',
      description: 'Must be signed by client and notarized.',
      hasTemplate: true,
      templateName: 'Individual_Affidavit_of_Financial_Need_Template.pdf',
    },
    {
      key: 'afFinancialNeed',
      label: 'AF Confirmation of Financial Need',
      description: 'Must be signed by Asset Financier.',
      hasTemplate: true,
      templateName: 'AF_Confirmation_of_Financial_Need_Template.pdf',
    },
    {
      key: 'nationalId',
      label: 'National ID',
      description: 'Uploaded copy of National ID',
    },
  ];

  const retrofitDocs = [
    {
      key: 'iceDisposalAgreement',
      label: 'ICE-Moto Engine Disposal Agreement',
      description: 'Must be signed by client for retrofit applications.',
      hasTemplate: true,
      templateName: 'ICE_Moto_Engine_Disposal_Agreement_Template.pdf',
    },
  ];

  const uploadedMandatory = mandatoryDocs.filter(doc => documents[doc.key as keyof Documents]?.uploaded).length;
  const totalMandatory = mandatoryDocs.length + (isRetrofit ? retrofitDocs.length : 0);
  const uploadedRetrofit = isRetrofit ? retrofitDocs.filter(doc => documents[doc.key as keyof Documents]?.uploaded).length : 0;
  const totalUploaded = uploadedMandatory + uploadedRetrofit;

  const triggerTemplateDownload = (templateName: string) => {
    toast.success('Template ready for download', { description: templateName });
  };

  const handleAdditionalUpload = (id: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setAdditionalDocs((prev) =>
        prev.map((doc) => (doc.id === id ? { ...doc, fileName: file.name } : doc))
      );
      toast.success('Additional document uploaded', { description: file.name });
    };
    input.click();
  };

  const renderDocumentRow = (doc: any, isMandatory: boolean) => {
    const docStatus = documents[doc.key as keyof Documents];
    const isUploaded = docStatus?.uploaded;
    const isUploading = uploadingDoc === doc.key;

    return (
      <div 
        key={doc.key}
        className="flex items-center gap-4 p-4 rounded-lg border bg-white"
      >
        <div className="flex-shrink-0">
          {isUploaded ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <FileText className="w-5 h-5 text-gray-500" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-gray-900">
              {doc.label}
              {isMandatory ? <span className="text-red-500 ml-1">*</span> : null}
            </p>
          </div>
          <p className="text-xs text-gray-600">{doc.description}</p>
          
          {isUploaded && docStatus.name && (
            <div className="flex items-center gap-2 text-xs text-gray-600 bg-green-50 border border-green-200 rounded px-2 py-1 mt-2">
              <FileText className="w-3 h-3" />
              <span className="flex-1 truncate">{docStatus.name}</span>
              <span className="text-gray-500">
                {new Date(docStatus.uploadedAt!).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex items-center gap-2">
          {isUploaded ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFileUpload(doc.key)}
                disabled={isUploading}
              >
                Replace
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  onDocumentRemove(doc.key);
                  toast.success('Document removed');
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {doc.hasTemplate ? (
                <button
                  type="button"
                  onClick={() => triggerTemplateDownload(doc.templateName)}
                  className="text-sm text-[#023F40] underline underline-offset-2"
                >
                  Get template here
                </button>
              ) : null}
              <Button
                size="sm"
                onClick={() => handleFileUpload(doc.key)}
                disabled={isUploading}
                className="bg-[#023F40] hover:bg-[#035f60]"
              >
                {isUploading ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <Upload className="w-3 h-3 mr-1" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#023F40]">Required Documents</CardTitle>
        <CardDescription>
          Upload all mandatory documents before submitting your application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Retrofit Toggle */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <input
            type="checkbox"
            id="retrofitToggle"
            checked={isRetrofit}
            onChange={(e) => onRetrofitToggle(e.target.checked)}
            className="w-5 h-5 text-[#023F40] border-gray-300 rounded focus:ring-[#023F40]"
          />
          <div className="flex-1">
            <Label htmlFor="retrofitToggle" className="text-base font-semibold text-gray-900 cursor-pointer">
              Is this a retrofit application?
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Check this if converting an existing ICE motorcycle to electric
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-gray-50 border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">
              Document Upload Progress
            </span>
            <span className="text-sm font-semibold text-[#023F40]">
              {totalUploaded} / {totalMandatory} mandatory documents
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#023F40] h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalMandatory > 0 ? (totalUploaded / totalMandatory) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Mandatory Documents */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            Mandatory Documents
          </h3>
          <div className="space-y-2">
            {mandatoryDocs.map(doc => renderDocumentRow(doc, true))}
          </div>
        </div>

        {/* Retrofit-Specific Documents */}
        {isRetrofit && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" />
              Retrofit-Specific Documents
            </h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> These additional documents are required for retrofit applications
              </p>
            </div>
            <div className="space-y-2">
              {retrofitDocs.map(doc => renderDocumentRow(doc, true))}
            </div>
          </div>
        )}

        {/* Additional Documents */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            Additional Documents
          </h3>
          <div className="space-y-3">
            {additionalDocs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 p-4 border rounded-lg bg-white">
                <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <Input
                  value={doc.title}
                  onChange={(e) =>
                    setAdditionalDocs((prev) =>
                      prev.map((row) => (row.id === doc.id ? { ...row, title: e.target.value } : row))
                    )
                  }
                  placeholder="Document title (e.g., Supporting statement)"
                />
                <Button size="sm" onClick={() => handleAdditionalUpload(doc.id)} className="bg-[#023F40] hover:bg-[#035f60]">
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAdditionalDocs((prev) => prev.filter((row) => row.id !== doc.id))}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={additionalDocs.length === 1}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                setAdditionalDocs((prev) => [
                  ...prev,
                  { id: `extra-${Date.now()}`, title: '' },
                ])
              }
            >
              Add another document
            </Button>
          </div>
        </div>

        {/* Submission Warning */}
        {totalUploaded < totalMandatory && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Missing Required Documents</p>
                <p>
                  Please upload all {totalMandatory} mandatory documents before submitting your application.
                  You have uploaded {totalUploaded} out of {totalMandatory}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {totalUploaded === totalMandatory && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-1">All Required Documents Uploaded</p>
                <p>
                  You can now proceed to submit your application.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}