import { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Filter, FileText, Calendar, Eye, Upload, Loader2, CheckCircle2, X, AlertCircle, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Pagination, usePagination } from '../ui/pagination';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { Alert, AlertDescription } from '../ui/alert';

interface Application {
  id: string;
  applicantName: string;
  applicantNationalId: string;
  status: string;
  submittedAt: string;
  vehicleBrand: string;
  vehicleModel: string;
  rebateAmount: number;
}

interface ApplicationsOverviewProps {
  organizationId: string;
  onNavigateToSubmit?: () => void;
}

export function ApplicationsOverview({ organizationId, onNavigateToSubmit }: ApplicationsOverviewProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchApplications();
  }, [organizationId, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // Get all applications from the general API
      const data = await api.getAllApplications();
      
      // Filter applications for this organization
      const orgApplications = data.filter((app: any) => 
        app.organizationId === organizationId
      );
      
      setApplications(orgApplications);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast.error(error.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = async (app: Application) => {
    try {
      // Fetch full application details
      const allApps = await api.getAllApplications();
      const fullApp = allApps.find((a: any) => a.id === app.id);
      setSelectedApp(fullApp);
      setShowDetailsModal(true);
    } catch (error: any) {
      console.error('Error loading application details:', error);
      toast.error('Failed to load application details');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF only)
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUploadLease = async () => {
    if (!selectedFile || !selectedApp) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      
      // Simulate upload delay for UX (UI-only, no actual file storage)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Strip the 'application:' prefix if present since the API will add it
      const idWithoutPrefix = selectedApp.id.replace('application:', '');
      
      // Update application status via API
      await api.updateApplication(idWithoutPrefix, {
        status: 'lease-review',
        signedLeaseDocument: {
          name: selectedFile.name,
          size: selectedFile.size,
          uploadedAt: new Date().toISOString(),
          // In real implementation: storage URL, etc.
        }
      });
      
      toast.success('Signed lease uploaded successfully!', {
        description: 'The lease will now be reviewed by the Rebate Manager'
      });
      
      // Reset state and reload
      setShowDetailsModal(false);
      setSelectedApp(null);
      setSelectedFile(null);
      await fetchApplications();
    } catch (error: any) {
      console.error('Failed to upload lease:', error);
      toast.error('Failed to upload lease', {
        description: error.message || 'Please try again'
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      'submitted': 'Submitted',
      'under-review': 'Under Review',
      'manager-review': 'Manager Review',
      'program-manager-review': 'Program Manager Review',
      'approved-pending-lease': 'Approved - Pending Lease',
      'lease-review': 'Lease Under Review',
      'pending-payment': 'Pending Payment',
      'payment-complete': 'Payment Complete',
      'rejected': 'Rejected'
    };
    return statusMap[status] || status.replace('_', ' ').replace('-', ' ');
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantNationalId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDateRange = (!dateRange.start || app.submittedAt >= dateRange.start) &&
      (!dateRange.end || app.submittedAt <= dateRange.end);
    
    const matchesStatus = statusFilter === 'ALL' || app.status.toLowerCase() === statusFilter.toLowerCase().replace('_', '-');

    return matchesSearch && matchesDateRange && matchesStatus;
  });

  // Pagination
  const {
    paginatedItems: paginatedApplications,
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    totalItems
  } = usePagination(filteredApplications, 10);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'submitted': 'bg-blue-100 text-blue-800',
      'under-review': 'bg-yellow-100 text-yellow-800',
      'manager-review': 'bg-yellow-100 text-yellow-800',
      'program-manager-review': 'bg-yellow-100 text-yellow-800',
      'approved-pending-lease': 'bg-green-100 text-green-800',
      'lease-review': 'bg-blue-100 text-blue-800',
      'pending-payment': 'bg-purple-100 text-purple-800',
      'payment-complete': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-[#023F40]">Application Management</h2>
            <p className="text-gray-600 mt-1">
              Track and manage all rebate applications submitted by your organization
            </p>
          </div>
          {onNavigateToSubmit && (
            <Button 
              onClick={onNavigateToSubmit}
              className="bg-[#023F40] hover:bg-[#035f60] text-white flex items-center gap-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Submit New Application
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, ID, or application ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 sm:pl-10 text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#023F40]"
          >
            <option value="ALL">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under-review">Under Review</option>
            <option value="manager-review">Manager Review</option>
            <option value="program-manager-review">Program Manager Review</option>
            <option value="approved-pending-lease">Approved - Pending Lease</option>
            <option value="lease-review">Lease Under Review</option>
            <option value="pending-payment">Pending Payment</option>
            <option value="payment-complete">Payment Complete</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Date Range */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="flex-1 text-sm"
            />
            <span className="text-gray-500 text-sm">to</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="flex-1 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">
            <Loader2 className="w-8 h-8 animate-spin text-[#023F40] mx-auto mb-2" />
            Loading applications...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'No applications found matching your filters' 
                : 'No applications submitted yet'}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rebate Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-[#023F40]">
                      {application.id.split(':')[1]?.substring(0, 8) || application.id.substring(0, 8)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{application.applicantName}</div>
                      <div className="text-sm text-gray-500">ID: {application.applicantNationalId || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {application.vehicleBrand || 'N/A'} {application.vehicleModel || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      {Number(application.rebateAmount || 0).toLocaleString()} RWF
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(application.status)}`}>
                      {getStatusDisplay(application.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {application.submittedAt 
                        ? new Date(application.submittedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewApplication(application)}
                      className="text-[#023F40] hover:text-[#035f60]"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredApplications.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Application Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#023F40]">Application Details</DialogTitle>
            <DialogDescription>
              View and manage application for {selectedApp?.applicantName}
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6 py-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(selectedApp.status)}>
                  {getStatusDisplay(selectedApp.status)}
                </Badge>
                <span className="text-sm text-gray-500">
                  ID: {selectedApp.id.split(':')[1] || selectedApp.id}
                </span>
              </div>

              {/* Applicant Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Applicant Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">{selectedApp.applicantName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">National ID</p>
                    <p className="font-medium">{selectedApp.nationalId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{selectedApp.phoneNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{selectedApp.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Motorcycle Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Motorcycle Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Brand & Model</p>
                    <p className="font-medium">{selectedApp.motorcycleBrand} {selectedApp.motorcycleModel}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Chassis Number</p>
                    <p className="font-medium">{selectedApp.chassisNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Battery Capacity</p>
                    <p className="font-medium">{selectedApp.batteryCapacity || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Year</p>
                    <p className="font-medium">{selectedApp.yearOfManufacture || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Financial Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Purchase Price</p>
                    <p className="font-medium">RWF {parseInt(selectedApp.purchasePrice || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Loan Amount</p>
                    <p className="font-medium">RWF {parseInt(selectedApp.loanAmount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Interest Rate</p>
                    <p className="font-medium">{selectedApp.interestRate || 0}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Loan Term</p>
                    <p className="font-medium">{selectedApp.loanTerm || 0} months</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Monthly Repayment</p>
                    <p className="font-medium">RWF {parseInt(selectedApp.monthlyRepayment || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Rebate Amount</p>
                    <p className="font-semibold text-[#023F40] text-lg">
                      RWF {parseInt(selectedApp.rebateAmount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Signed Lease Section - Only show if status is approved-pending-lease */}
              {selectedApp.status === 'approved-pending-lease' && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Action Required:</strong> This application has been approved and is awaiting the signed lease agreement upload.
                    </AlertDescription>
                  </Alert>

                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Upload Signed Lease Agreement</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Please upload the signed lease agreement in PDF format (max 10MB)
                      </p>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="w-full mb-2"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {selectedFile ? selectedFile.name : 'Select PDF File'}
                      </Button>

                      {selectedFile && (
                        <div className="flex items-center gap-2 p-2 bg-white rounded border">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-sm flex-1">{selectedFile.name}</span>
                          <span className="text-xs text-gray-500">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedFile(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleUploadLease}
                      disabled={!selectedFile || uploading}
                      className="w-full bg-[#023F40] hover:bg-[#035f60]"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Signed Lease
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Lease Document Info - Show if lease has been uploaded */}
              {selectedApp.signedLeaseDocument && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Signed Lease Uploaded
                  </h4>
                  <div className="text-sm text-green-800">
                    <p>File: {selectedApp.signedLeaseDocument.name}</p>
                    <p>Uploaded: {new Date(selectedApp.signedLeaseDocument.uploadedAt || selectedApp.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedApp(null);
                setSelectedFile(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}