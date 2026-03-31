import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner@2.0.3';
import { Eye, UserPlus, Filter } from 'lucide-react';
import { User } from '../../utils/auth';
import { TableSkeleton } from '../ui/skeletons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Application {
  id: string;
  companyName: string;
  registrationNumber: string;
  rebateAmount: string;
  projectDescription: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  applicantId: string;
  assignedTo?: string;
  documents?: any;
}

interface ApplicationManagerProps {
  user: User;
}

const statusColors: Record<string, string> = {
  draft: 'secondary',
  pending: 'default',
  assigned: 'default',
  'under-review': 'default',
  approved: 'default',
  rejected: 'destructive',
};

export function ApplicationManager({ user }: ApplicationManagerProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [analysts, setAnalysts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appsData, usersData] = await Promise.all([
        api.getAllApplications(),
        api.getUsers(),
      ]);
      
      setApplications(appsData);
      setAnalysts(usersData.filter((u: User) => u.role === 'analyst'));
    } catch (error: any) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedApp || !selectedAnalyst) {
      toast.error('Please select an analyst');
      return;
    }

    try {
      const appId = selectedApp.id.replace('application:', '');
      await api.assignApplication(appId, selectedAnalyst);
      toast.success('Application assigned successfully');
      setAssignDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign application');
      console.error(error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getAnalystName = (analystId?: string) => {
    if (!analystId) return 'Unassigned';
    const analyst = analysts.find(a => a.id === analystId);
    return analyst?.name || 'Unknown';
  };

  const pendingApps = applications.filter(app => app.status === 'pending');
  const assignedApps = applications.filter(app => app.status === 'assigned' || app.status === 'under-review');
  const completedApps = applications.filter(app => ['approved', 'rejected', 'disbursed'].includes(app.status));

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Management</CardTitle>
            <CardDescription>
              Review, screen, and assign applications to rebate analysts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={8} columns={4} showHeader={false} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compact Header - Mobile Responsive */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="mb-4 mt-6">
          <h2 className="text-lg sm:text-xl text-[#023F40]">Application Management</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Review, screen, and assign applications to rebate analysts
          </p>
        </div>
        
        {/* Responsive Tabs */}
        <Tabs defaultValue="pending">
          <TabsList className="flex flex-col sm:grid sm:grid-cols-3 w-full gap-2 sm:gap-0 h-auto sm:h-10">
            <TabsTrigger value="pending" className="w-full justify-center">
              <span className="hidden sm:inline">Pending </span>
              <span className="inline sm:hidden">Pend. </span>
              ({pendingApps.length})
            </TabsTrigger>
            <TabsTrigger value="assigned" className="w-full justify-center">
              <span className="hidden sm:inline">In Progress </span>
              <span className="inline sm:hidden">Prog. </span>
              ({assignedApps.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="w-full justify-center">
              <span className="hidden sm:inline">Completed </span>
              <span className="inline sm:hidden">Done </span>
              ({completedApps.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {pendingApps.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">No pending applications</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pendingApps.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    analysts={analysts}
                    onAssign={(app) => {
                      setSelectedApp(app);
                      setAssignDialogOpen(true);
                    }}
                    formatDate={formatDate}
                    getAnalystName={getAnalystName}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="assigned" className="space-y-4 mt-4">
            {assignedApps.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">No applications in progress</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {assignedApps.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    analysts={analysts}
                    formatDate={formatDate}
                    getAnalystName={getAnalystName}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-4">
            {completedApps.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">No completed applications</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {completedApps.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    analysts={analysts}
                    formatDate={formatDate}
                    getAnalystName={getAnalystName}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Application</DialogTitle>
            <DialogDescription>
              Select a rebate analyst to review this application
            </DialogDescription>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedApp.companyName}</p>
                <p className="text-sm text-gray-600">
                  Rebate Amount: ${selectedApp.rebateAmount}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Analyst</label>
                <Select value={selectedAnalyst} onValueChange={setSelectedAnalyst}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an analyst..." />
                  </SelectTrigger>
                  <SelectContent>
                    {analysts.map((analyst) => (
                      <SelectItem key={analyst.id} value={analyst.id}>
                        {analyst.name} ({analyst.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssign}>
                  Assign
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ApplicationCardProps {
  app: Application;
  analysts: User[];
  onAssign?: (app: Application) => void;
  formatDate: (date: string) => string;
  getAnalystName: (id?: string) => string;
}

function ApplicationCard({ app, analysts, onAssign, formatDate, getAnalystName }: ApplicationCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white relative">
      {/* Status Badge - Top Right */}
      <div className="absolute top-4 right-4">
        <Badge variant={statusColors[app.status] as any} className="text-xs">
          {app.status}
        </Badge>
      </div>

      {/* Title */}
      <div className="mb-3 pr-20">
        <h3 className="font-semibold text-base text-[#023F40]">{app.companyName}</h3>
      </div>

      {/* Information - Middle Section */}
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <span className="font-medium">Amount:</span>
          <span className="text-[#023F40] font-semibold">${app.rebateAmount}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Submitted:</span>
          <span>{formatDate(app.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Assigned to:</span>
          <span className="truncate ml-2">{getAnalystName(app.assignedTo)}</span>
        </div>
      </div>

      {/* Action Buttons - Bottom, Vertical Stack on Mobile */}
      <div className="flex flex-col gap-2 pt-3 border-t">
        {onAssign && (
          <Button size="sm" variant="outline" onClick={() => onAssign(app)} className="w-full justify-center">
            <UserPlus className="w-4 h-4 mr-2" />
            Assign
          </Button>
        )}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="w-full justify-center">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] sm:max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{app.companyName}</DialogTitle>
              <DialogDescription>Application Details</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm">Registration Number</p>
                  <p className="text-gray-700">{app.registrationNumber}</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Rebate Amount</p>
                  <p className="text-gray-700">${app.rebateAmount}</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Status</p>
                  <Badge variant={statusColors[app.status] as any}>{app.status}</Badge>
                </div>
                <div>
                  <p className="font-medium text-sm">Assigned To</p>
                  <p className="text-gray-700">{getAnalystName(app.assignedTo)}</p>
                </div>
              </div>

              <div>
                <p className="font-medium mb-2 text-sm">Project Description</p>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{app.projectDescription}</p>
              </div>

              {app.documents && (
                <div>
                  <p className="font-medium mb-2 text-sm">Documents</p>
                  <div className="space-y-2">
                    {app.documents.businessLicense && (
                      <a
                        href={app.documents.businessLicense.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 border rounded hover:bg-gray-50 text-sm"
                      >
                        Business License: {app.documents.businessLicense.name}
                      </a>
                    )}
                    {app.documents.financialStatements && (
                      <a
                        href={app.documents.financialStatements.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 border rounded hover:bg-gray-50 text-sm"
                      >
                        Financial Statements: {app.documents.financialStatements.name}
                      </a>
                    )}
                    {app.documents.emissionCertificate && (
                      <a
                        href={app.documents.emissionCertificate.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 border rounded hover:bg-gray-50 text-sm"
                      >
                        Emission Certificate: {app.documents.emissionCertificate.name}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}