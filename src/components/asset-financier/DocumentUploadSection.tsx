import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Upload, CheckCircle2, AlertCircle, FileText, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

export interface DocumentStatus {
  uploaded: boolean;
  uploadedAt?: string;
  name?: string;
}

export interface AdditionalDocument {
  id: string;
  label: string;
  fileName: string;
  uploadedAt: string;
}

interface Documents {
  signedLease?: DocumentStatus;
  afFinancialNeed?: DocumentStatus;
  iceDisposalAgreement?: DocumentStatus;
  retrofitSuitability?: DocumentStatus;
  possessionConfirmation?: DocumentStatus;
  affidavit?: DocumentStatus;
}

interface DocumentUploadSectionProps {
  isRetrofit: boolean;
  documents: Documents;
  additionalDocuments: AdditionalDocument[];
  onDocumentUpload: (docType: string, file: { name: string }) => void;
  onDocumentRemove: (docType: string) => void;
  onAdditionalDocumentsChange: (docs: AdditionalDocument[]) => void;
}

const MAX_ADDITIONAL_DOCS = 5;

export function DocumentUploadSection({
  isRetrofit,
  documents,
  additionalDocuments,
  onDocumentUpload,
  onDocumentRemove,
  onAdditionalDocumentsChange,
}: DocumentUploadSectionProps) {
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [pendingLabel, setPendingLabel] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const mandatoryDocs = [
    {
      key: 'signedLease',
      label: 'Signed Financing Agreement with Retail Cost of E-Moto',
      description: 'Signed lease documenting retail cost (RWF).',
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
      description:
        'An RGF-authorized retrofit assembler is required to certify safety and reliability.',
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

  const mandatoryRetrofitDocs = retrofitDocs.filter((d) => d.mandatory);
  const uploadedMandatory = mandatoryDocs.filter((d) => documents[d.key as keyof Documents]?.uploaded).length;
  const uploadedRetrofit = isRetrofit
    ? mandatoryRetrofitDocs.filter((d) => documents[d.key as keyof Documents]?.uploaded).length
    : 0;
  const totalMandatory = mandatoryDocs.length + (isRetrofit ? mandatoryRetrofitDocs.length : 0);
  const totalUploaded = uploadedMandatory + uploadedRetrofit;

  const triggerTemplateDownload = (templateName: string) => {
    toast.success('Template ready for download', { description: templateName });
  };

  const handleFileUpload = (docType: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploadingDoc(docType);
      setTimeout(() => {
        onDocumentUpload(docType, { name: file.name });
        setUploadingDoc(null);
        toast.success('Document uploaded', { description: file.name });
      }, 400);
    };
    input.click();
  };

  const resetAddModal = () => {
    setPendingLabel('');
    setPendingFile(null);
    setAddModalOpen(false);
  };

  const handleChooseAdditionalFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) setPendingFile(file);
    };
    input.click();
  };

  const handleConfirmAdditionalDoc = () => {
    const label = pendingLabel.trim();
    if (!label) {
      toast.error('Enter a name for this supporting document first.');
      return;
    }
    if (!pendingFile) {
      toast.error('Choose a file to upload for this document.');
      return;
    }
    if (additionalDocuments.length >= MAX_ADDITIONAL_DOCS) {
      toast.error(`You can add up to ${MAX_ADDITIONAL_DOCS} additional documents.`);
      return;
    }
    const entry: AdditionalDocument = {
      id: `extra-${Date.now()}`,
      label,
      fileName: pendingFile.name,
      uploadedAt: new Date().toISOString(),
    };
    onAdditionalDocumentsChange([...additionalDocuments, entry]);
    toast.success('Supporting document added', { description: `${label} — ${pendingFile.name}` });
    resetAddModal();
  };

  const removeAdditionalDoc = (id: string) => {
    onAdditionalDocumentsChange(additionalDocuments.filter((d) => d.id !== id));
    toast.success('Document removed');
  };

  const renderDocumentRow = (
    doc: {
      key: string;
      label: string;
      description: string;
      hasTemplate?: boolean;
      templateName?: string;
      mandatory?: boolean;
    },
    isMandatory: boolean
  ) => {
    const docStatus = documents[doc.key as keyof Documents];
    const isUploaded = docStatus?.uploaded;
    const isUploading = uploadingDoc === doc.key;

    return (
      <div key={doc.key} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 bg-white">
        <div className="flex-shrink-0 pt-0.5">
          {isUploaded ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <FileText className="w-5 h-5 text-gray-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm">
            {doc.label}
            {isMandatory ? <span className="text-red-500 ml-0.5">*</span> : null}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">{doc.description}</p>
          {doc.hasTemplate && (
            <button
              type="button"
              onClick={() => triggerTemplateDownload(doc.templateName!)}
              className="text-xs text-[#023F40] underline underline-offset-2 mt-1"
            >
              Get template here
            </button>
          )}
          {isUploaded && docStatus?.name && (
            <div className="flex items-center gap-2 text-xs text-green-800 bg-green-50 border border-green-200 rounded px-2 py-1.5 mt-2">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate font-medium">{docStatus.name}</span>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex items-center gap-2">
          {isUploaded ? (
            <>
              <Button size="sm" variant="outline" onClick={() => handleFileUpload(doc.key)} disabled={isUploading}>
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
            <Button
              size="sm"
              onClick={() => handleFileUpload(doc.key)}
              disabled={isUploading}
              className="bg-[#0a7d4b] hover:bg-[#0c6b42]"
            >
              <Upload className="w-3.5 h-3.5 mr-1" />
              {isUploading ? 'Uploading…' : 'Upload'}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="border-0 shadow-none p-0">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-[#023F40] text-lg">Step 2: Add documentation</CardTitle>
          <CardDescription className="text-sm">
            This page is used for submitting the documents required to be eligible for a rebate. The documents
            marked with an asterisk are mandatory and need to be provided before the rebate can be submitted.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 space-y-6">
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Mandatory document progress</span>
              <span className="text-sm font-semibold text-[#023F40]">
                {totalUploaded} / {totalMandatory}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#023F40] h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalMandatory > 0 ? (totalUploaded / totalMandatory) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Mandatory Documents</h3>
            <div className="space-y-2">{mandatoryDocs.map((doc) => renderDocumentRow(doc, true))}</div>
          </div>

          {isRetrofit && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">If retrofit</h3>
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 space-y-2">
                {retrofitDocs.map((doc) => renderDocumentRow(doc, !!doc.mandatory))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Additional Supporting Documents</h3>
            <p className="text-xs text-gray-600 mb-2">
              Name each document first, then upload the corresponding file. You can add up to{' '}
              {MAX_ADDITIONAL_DOCS} additional documents.
            </p>
            <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-800 mb-1.5">
                Accepted supporting documents:
              </p>
              <ul className="list-disc pl-5 space-y-0.5 text-xs text-gray-700">
                <li>Employment letter</li>
                <li>Personal reference</li>
                <li>Mobile money statement</li>
              </ul>
            </div>

            {additionalDocuments.length > 0 && (
              <div className="space-y-2 mb-3">
                {additionalDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-900">{doc.label}</p>
                      <p className="text-xs text-green-700 truncate">{doc.fileName}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAdditionalDoc(doc.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {additionalDocuments.length < MAX_ADDITIONAL_DOCS ? (
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#023F40] hover:underline"
              >
                <Plus className="w-4 h-4" />
                Add another document
              </button>
            ) : (
              <p className="text-xs text-gray-500">Maximum of {MAX_ADDITIONAL_DOCS} additional documents reached.</p>
            )}
          </div>

          {totalUploaded < totalMandatory && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Missing required documents</p>
                  <p>
                    Upload all mandatory documents ({totalUploaded} of {totalMandatory} complete) before
                    submitting on Step 4.
                  </p>
                </div>
              </div>
            </div>
          )}

          {totalUploaded === totalMandatory && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">All mandatory documents uploaded</p>
                  <p>You can continue to Vehicle Financing and Review.</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addModalOpen} onOpenChange={(open) => !open && resetAddModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add supporting document</DialogTitle>
            <DialogDescription>
              Choose from the accepted supporting documents (employment letter, personal reference, or mobile
              money statement). Enter the document name first, then upload the file.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="additional-doc-name">Document name</Label>
              <Input
                id="additional-doc-name"
                placeholder="Employment letter, Personal reference, or Mobile money statement"
                value={pendingLabel}
                onChange={(e) => setPendingLabel(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>File</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={handleChooseAdditionalFile} className="shrink-0">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose file
                </Button>
                <span className="text-sm text-gray-600 truncate">
                  {pendingFile ? pendingFile.name : 'No file selected'}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetAddModal}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-[#0a7d4b] hover:bg-[#0c6b42]"
              onClick={handleConfirmAdditionalDoc}
            >
              Add document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
