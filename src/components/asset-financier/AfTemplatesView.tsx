import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { AF_DOCUMENT_TEMPLATES } from '../../utils/afRebateData';

function PdfFileIcon() {
  return (
    <div className="relative w-[72px] h-[88px]" aria-hidden>
      <div className="absolute inset-0 rounded-md bg-white border border-gray-300 shadow-sm">
        <div className="absolute top-0 right-0 w-5 h-5 bg-gray-100 border-l border-b border-gray-300 rounded-bl-sm" />
        <div className="absolute inset-x-2 top-6 space-y-1.5">
          <div className="h-1 rounded-full bg-gray-200" />
          <div className="h-1 rounded-full bg-gray-200 w-4/5" />
          <div className="h-1 rounded-full bg-gray-200 w-3/5" />
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold tracking-wide">
          PDF
        </div>
      </div>
    </div>
  );
}

export function AfTemplatesView() {
  const handleDownload = (label: string, file: string) => {
    toast.success('Template ready for download', { description: file });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">Download Mandatory Templates</h2>
        <p className="text-sm text-gray-600 mt-1">
          Download and complete these templates to document rebate eligibility before submission to RGF.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {AF_DOCUMENT_TEMPLATES.map((template) => (
          <div
            key={template.file}
            className="flex flex-col items-center gap-2 rounded-lg p-3 hover:bg-gray-50 transition-colors"
          >
            <PdfFileIcon />
            <p className="text-xs leading-snug line-clamp-3 text-center text-gray-800 px-1">
              {template.label}
            </p>
            <button
              type="button"
              onClick={() => handleDownload(template.label, template.file)}
              className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-[#023F40] shadow-sm hover:bg-[#023F40] hover:text-white hover:border-[#023F40] transition-colors"
              aria-label={`Download ${template.label}`}
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
