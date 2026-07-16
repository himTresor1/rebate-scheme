import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
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
  retrofitSuitability?: DocumentStatus;
  possessionConfirmation?: DocumentStatus;
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
  identityDocuments?: Record<string, DocumentStatus>;
  onDocumentUpload: (docType: string, file: { name: string }) => void;
  onDocumentRemove: (docType: string) => void;
  onIdentityDocUpload?: (docType: string, file: { name: string }) => void;
  onIdentityDocRemove?: (docType: string) => void;
  onRetrofitToggle: (value: boolean) => void;
}

export function DocumentUploadSection({
  isRetrofit,
  documents,
  identityDocuments = {},
  onDocumentUpload,
  onDocumentRemove,
  onIdentityDocUpload,
  onIdentityDocRemove,
  onRetrofitToggle
}: DocumentUploadSectionProps) {
  const MAX_ADDITIONAL_DOCS = 5;
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [additionalDocs, setAdditionalDocs] = useState<Array<{ id: string; fileName: string; uploadedAt: string }>>([]);

  const handleFileUpload = (docType: string, source: 'documents' | 'identity' = 'documents') => {
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
          if (source === 'identity') {
            onIdentityDocUpload?.(docType, { name: file.name });
          } else {
            onDocumentUpload(docType, { name: file.name });
          }
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
      label: 'Signed Financing Agreement with Retail Cost of E-Moto',
      description: 'Signed agreement documenting retail cost (RWF).',
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
  ];

  const retrofitDocs = [
    {
      key: 'retrofitSuitability',
      label: 'Signed Retrofit Suitability Statement',
      description: 'An RGF-authorized retrofit assembler is required to certify safety and reliability.',
      mandatory: true,
    },
    {
      key: 'iceDisposalAgreement',
      label: 'ICE-Engine Disposal Agreement (if Retrofit)',
      description: 'Must be signed by client for retrofit applications.',
      mandatory: true,
      hasTemplate: true,
      templateName: 'ICE_Moto_Engine_Disposal_Agreement_Template.pdf',
    },
    {
      key: 'possessionConfirmation',
      label: 'AF and Client Confirmation of E-Moto Possession',
      description: 'Can be submitted later.',
      mandatory: false,
      hasTemplate: true,
      templateName: 'AF_Client_Confirmation_of_EMoto_Possession_Template.pdf',
    },
  ];

  const identityDocs = [
    { key: 'nationalIdDoc', label: 'National ID Document', description: 'Uploaded copy of the National ID.', mandatory: true },
    { key: 'driversLicenseDoc', label: "Motorcycle Driver's License Document", description: 'Uploaded copy of the motorcycle license.', mandatory: true },
    { key: 'dobDoc', label: 'Date of Birth Document', description: 'Proof of date of birth (e.g., ID or birth record).', mandatory: true },
    { key: 'taxiLicense', label: 'Taxi License (RURA)', description: 'Optional, where applicable.', mandatory: false },
  ];

  const mandatoryIdentityDocs = identityDocs.filter(doc => doc.mandatory);
  const mandatoryRetrofitDocs = retrofitDocs.filter(doc => doc.mandatory);
  const uploadedIdentity = mandatoryIdentityDocs.filter(doc => identityDocuments[doc.key]?.uploaded).length;
  const uploadedMandatory = mandatoryDocs.filter(doc => documents[doc.key as keyof Documents]?.uploaded).length;
  const totalMandatory = mandatoryIdentityDocs.length + mandatoryDocs.length + (isRetrofit ? mandatoryRetrofitDocs.length : 0);
  const uploadedRetrofit = isRetrofit ? mandatoryRetrofitDocs.filter(doc => documents[doc.key as keyof Documents]?.uploaded).length : 0;
  const totalUploaded = uploadedIdentity + uploadedMandatory + uploadedRetrofit;

  const triggerTemplateDownload = (templateName: string) => {
    toast.success('Template ready for download', { description: templateName });
  };

  const handleAdditionalUpload = () => {
    if (additionalDocs.length >= MAX_ADDITIONAL_DOCS) {
      toast.error(`You can upload up to ${MAX_ADDITIONAL_DOCS} additional documents`);
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = (e: any) => {
      const files: File[] = Array.from(e.target.files || []);
      if (files.length === 0) return;
      setAdditionalDocs((prev) => {
        const remaining = MAX_ADDITIONAL_DOCS - prev.length;
        if (remaining <= 0) {
          toast.error(`You can upload up to ${MAX_ADDITIONAL_DOCS} additional documents`);
          return prev;
        }
        const accepted = files.slice(0, remaining);
        if (files.length > remaining) {
          toast.error(`Only ${remaining} more document${remaining === 1 ? '' : 's'} can be added`);
        }
        accepted.forEach((file) => toast.success('Additional document uploaded', { description: file.name }));
        return [
          ...prev,
          ...accepted.map((file, idx) => ({
            id: `extra-${Date.now()}-${idx}`,
            fileName: file.name,
            uploadedAt: new Date().toISOString(),
          })),
        ];
      });
    };
    input.click();
  };

  const removeAdditionalDoc = (id: string) => {
    setAdditionalDocs((prev) => prev.filter((doc) => doc.id !== id));
    toast.success('Document removed');
  };

  const renderDocumentRow = (doc: any, isMandatory: boolean, source: 'documents' | 'identity' = 'documents') => {
    const docStatus = source === 'identity'
      ? identityDocuments[doc.key]
      : documents[doc.key as keyof Documents];
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
                onClick={() => handleFileUpload(doc.key, source)}
                disabled={isUploading}
              >
                Replace
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (source === 'identity') {
                    onIdentityDocRemove?.(doc.key);
                  } else {
                    onDocumentRemove(doc.key);
                  }
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
                onClick={() => handleFileUpload(doc.key, source)}
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
        <CardTitle className="text-[#023F40]">Step 2: Add documentation</CardTitle>
        <CardDescription>
          This page is used for submitting the documents required to be eligible for a rebate. The documents marked with an asterisk are mandatory and need to be provided before the rebate can be submitted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        {/* Identification Documents */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            Identification Documents
          </h3>
          <div className="space-y-2">
            {identityDocs.map(doc => renderDocumentRow(doc, doc.mandatory, 'identity'))}
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
              If Retrofit
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              {retrofitDocs.map(doc => renderDocumentRow(doc, !!doc.mandatory))}
            </div>
          </div>
        )}

        {/* Additional Documents */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            Additional Documents
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Add supporting documents (e.g., employment letter, personal reference, mobile money statement). You can
            upload up to {MAX_ADDITIONAL_DOCS} documents &mdash; each one keeps its own file name.
          </p>

          <div className="space-y-3">
            {additionalDocs.map((doc) => (
              <div key={doc.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-green-900 truncate">{doc.fileName}</p>
                      <p className="text-xs text-green-700">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAdditionalDoc(doc.id)}
                    className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {additionalDocs.length < MAX_ADDITIONAL_DOCS ? (
              <div>
                <button
                  type="button"
                  onClick={handleAdditionalUpload}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-3 px-4 cursor-pointer hover:border-[#023F40] hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG, DOC (max 10MB) &middot; {additionalDocs.length}/{MAX_ADDITIONAL_DOCS} added
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Maximum of {MAX_ADDITIONAL_DOCS} additional documents reached.
              </p>
            )}
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