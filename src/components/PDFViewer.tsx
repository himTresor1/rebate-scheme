import { useState } from 'react';
import { 
  Download, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Maximize2,
  X
} from 'lucide-react';

interface PDFViewerProps {
  fileName?: string;
  onClose?: () => void;
}

export function PDFViewer({ fileName = 'Document.pdf', onClose }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const totalPages = 5; // Simulated total pages

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  return (
    <div className="fixed inset-0 bg-[#525659] z-50 flex flex-col">
      {/* Chrome-style Header */}
      <div className="bg-[#323639] h-14 flex items-center px-4 gap-4 text-white shadow-lg">
        {/* Left Side - Navigation and File Info */}
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-2 hover:bg-white/10 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-white/10 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#525659] px-3 py-1.5 rounded">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  setCurrentPage(page);
                }
              }}
              className="w-12 bg-transparent text-center text-white outline-none"
              min="1"
              max={totalPages}
            />
            <span className="text-white/70 text-sm">/ {totalPages}</span>
          </div>
        </div>

        {/* Center - Filename */}
        <div className="flex-1 text-center">
          <span className="text-sm font-medium">{fileName}</span>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="p-2 hover:bg-white/10 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          {/* Zoom Level */}
          <div className="bg-[#525659] px-3 py-1.5 rounded min-w-[80px] text-center">
            <span className="text-sm">{zoom}%</span>
          </div>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="p-2 hover:bg-white/10 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Rotate clockwise"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          {/* Fullscreen */}
          <button
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-white/20 mx-1" />

          {/* Print */}
          <button
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Print"
            onClick={() => window.print()}
          >
            <Printer className="w-5 h-5" />
          </button>

          {/* Download */}
          <button
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="flex-1 overflow-auto flex justify-center py-8">
        <div 
          className="bg-white shadow-2xl"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'top center',
            width: '794px', // A4 width
            minHeight: '1123px', // A4 height
            transition: 'transform 0.2s ease'
          }}
        >
          {/* Simulated PDF Content */}
          <div className="p-16 space-y-6">
            {/* Document Header */}
            <div className="border-b-4 border-[#023F40] pb-4 mb-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 bg-[#023F40] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">RGF</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#023F40]">Rwanda Green Fund</h1>
                  <p className="text-sm text-gray-600">E-Moto Rebate Program</p>
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {fileName.replace('.pdf', '')}
              </h2>
              <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
            </div>

            {/* Sample Content */}
            <div className="space-y-4 text-gray-700">
              <p className="text-justify leading-relaxed">
                This is a simulated PDF document viewer demonstrating the RGF Rebate System's document 
                viewing capabilities. In a production environment, this would display actual PDF content 
                using a PDF rendering library.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Document Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Document Type:</span>
                    <span className="ml-2 font-medium">Template Document</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date Created:</span>
                    <span className="ml-2 font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2 font-medium text-green-600">Active</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Version:</span>
                    <span className="ml-2 font-medium">1.0</span>
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mt-6 mb-2">Sample Section</h3>
              <p className="text-justify leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>

              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>First requirement or guideline</li>
                <li>Second requirement or guideline</li>
                <li>Third requirement or guideline</li>
                <li>Fourth requirement or guideline</li>
              </ul>

              <p className="text-justify leading-relaxed">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
                fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
                culpa qui officia deserunt mollit anim id est laborum.
              </p>

              {/* Signature Section */}
              <div className="mt-12 grid grid-cols-2 gap-8">
                <div>
                  <div className="border-t border-gray-400 pt-2">
                    <p className="text-sm font-medium">Authorized Signature</p>
                    <p className="text-xs text-gray-500">Date: __________</p>
                  </div>
                </div>
                <div>
                  <div className="border-t border-gray-400 pt-2">
                    <p className="text-sm font-medium">Witness Signature</p>
                    <p className="text-xs text-gray-500">Date: __________</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-4 border-t border-gray-300 text-xs text-gray-500 text-center">
              <p>Rwanda Green Fund - E-Moto Rebate Program</p>
              <p className="mt-1">Kigali, Rwanda | Email: support@rgf.rw | Phone: +250 XXX XXX XXX</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Page Indicator (optional) */}
      <div className="bg-[#323639] h-10 flex items-center justify-center text-white text-sm">
        <span>Page {currentPage} of {totalPages}</span>
      </div>
    </div>
  );
}
