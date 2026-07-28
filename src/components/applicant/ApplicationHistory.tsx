import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Eye, FileText, Calendar, DollarSign } from 'lucide-react';
import { User } from '../../utils/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Pagination, usePagination } from '../ui/pagination';
import { formatDisplayDate } from '../../utils/dateFormat';

interface Application {
  id: string;
  companyName: string;
  registrationNumber: string;
  rebateAmount: string;
  projectDescription: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  documents?: {
    businessLicense?: { name: string; url: string };
    financialStatements?: { name: string; url: string };
    emissionCertificate?: { name: string; url: string };
  };
  evaluationResults?: any;
}

interface ApplicationHistoryProps {
  user: User;
}

const statusColors: Record<string, string> = {
  draft: 'secondary',
  pending: 'default',
  assigned: 'default',
  'under-review': 'default',
  approved: 'default',
  rejected: 'destructive',
  'manager-review': 'default',
  'program-manager-review': 'default',
  'approved-pending-lease': 'default',
  'lease-review': 'default',
  'pending-payment': 'default',
  'payment-complete': 'default',
  disbursed: 'default',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  pending: 'Pending Review',
  assigned: 'Assigned to Analyst',
  'under-review': 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  'manager-review': 'Manager Review',
  'program-manager-review': 'Program Manager Review',
  'approved-pending-lease': 'Approved Pending Lease',
  'lease-review': 'Lease Review',
  'pending-payment': 'Pending Payment',
  'payment-complete': 'Payment Complete',
  disbursed: 'Disbursed',
};

export function ApplicationHistory({ user }: ApplicationHistoryProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await api.getMyApplications();
      setApplications(data);
    } catch (error: any) {
      toast.error('Failed to load applications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return formatDisplayDate(dateString);
  };

  // Use pagination
  const {
    paginatedItems,
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    totalItems
  } = usePagination(applications, 5);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Loading applications...</p>
        </CardContent>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No applications submitted yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Your submitted applications will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Application History</CardTitle>
          <CardDescription>
            Track the status of your rebate applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paginatedItems.map((app) => (
            <div
              key={app.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium">{app.companyName}</h3>
                    <Badge variant={statusColors[app.status] as any}>
                      {statusLabels[app.status] || app.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Registration: {app.registrationNumber}
                  </p>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{app.companyName}</DialogTitle>
                      <DialogDescription>
                        Application Details & Status
                      </DialogDescription>
                    </DialogHeader>
                    
                    {selectedApp && (
                      <div className="space-y-6">
                        {/* Status */}
                        <div>
                          <h4 className="font-medium mb-2">Status</h4>
                          <Badge variant={statusColors[selectedApp.status] as any}>
                            {statusLabels[selectedApp.status] || selectedApp.status}
                          </Badge>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-1">Company Name</h4>
                            <p className="text-gray-700">{selectedApp.companyName}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Registration Number</h4>
                            <p className="text-gray-700">{selectedApp.registrationNumber}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Rebate Amount</h4>
                            <p className="text-gray-700">${selectedApp.rebateAmount}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Submitted</h4>
                            <p className="text-gray-700">{formatDate(selectedApp.createdAt)}</p>
                          </div>
                        </div>

                        {/* Project Description */}
                        <div>
                          <h4 className="font-medium mb-2">Project Description</h4>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {selectedApp.projectDescription}
                          </p>
                        </div>

                        {/* Documents */}
                        <div>
                          <h4 className="font-medium mb-2">Uploaded Documents</h4>
                          <div className="space-y-2">
                            {selectedApp.documents?.businessLicense && (
                              <a
                                href={selectedApp.documents.businessLicense.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50"
                              >
                                <FileText className="w-4 h-4" />
                                <span>Business License: {selectedApp.documents.businessLicense.name}</span>
                              </a>
                            )}
                            {selectedApp.documents?.financialStatements && (
                              <a
                                href={selectedApp.documents.financialStatements.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50"
                              >
                                <FileText className="w-4 h-4" />
                                <span>Financial Statements: {selectedApp.documents.financialStatements.name}</span>
                              </a>
                            )}
                            {selectedApp.documents?.emissionCertificate && (
                              <a
                                href={selectedApp.documents.emissionCertificate.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50"
                              >
                                <FileText className="w-4 h-4" />
                                <span>Emission Certificate: {selectedApp.documents.emissionCertificate.name}</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Evaluation Results (if any) */}
                        {selectedApp.evaluationResults && (
                          <div>
                            <h4 className="font-medium mb-2">Evaluation Results</h4>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-700">
                                Evaluation details will appear here once the review is complete.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>${app.rebateAmount}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Submitted: {formatDate(app.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Updated: {formatDate(app.updatedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
        {applications.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </Card>
    </div>
  );
}