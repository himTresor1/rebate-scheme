import { useState, useEffect } from 'react';
import { User } from '../../utils/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../utils/api';
import { Alert, AlertDescription } from '../ui/alert';

interface LeaseUploadViewProps {
  user: User;
}

export function LeaseUploadView({ user }: LeaseUploadViewProps) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await api.getAllApplications();
      
      // Filter applications that are approved and pending lease upload for this organization
      const pendingLease = data.filter((app: any) => 
        app.status === 'approved-pending-lease' && 
        app.organizationId === (user.organizationId || user.id)
      );
      
      setApplications(pendingLease);
    } catch (error: any) {
      console.error('Failed to load applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaseUpload = async (applicationId: string) => {
    setUploading(applicationId);
    
    try {
      // UI-only simulation - no actual file upload
      // In a real implementation, you would:
      // 1. Show file picker
      // 2. Validate file (PDF, size < 10MB)
      // 3. Upload to storage
      // 4. Update application with reference
      
      // Simulate delay for UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Strip the 'application:' prefix if present since the API will add it
      const idWithoutPrefix = applicationId.replace('application:', '');
      
      // Update application status via API
      await api.updateApplication(idWithoutPrefix, {
        status: 'lease-review',
        signedLeaseDocument: {
          name: `signed_lease_${Date.now()}.pdf`,
          uploadedAt: new Date().toISOString(),
          // In real implementation: storage URL, size, etc.
        }
      });
      
      toast.success('Signed lease uploaded successfully!', {
        description: 'The lease will now be reviewed by the Rebate Manager'
      });
      
      // Reload applications
      await loadApplications();
    } catch (error: any) {
      console.error('Failed to upload lease:', error);
      toast.error('Failed to upload lease', {
        description: error.message || 'Please try again'
      });
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#023F40]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#023F40]">Signed Lease Upload</h2>
        <p className="text-gray-600 mt-1">
          Upload signed lease agreements for approved rebate applications
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Applications Pending Lease Upload
              </h3>
              <p className="text-gray-600">
                All approved applications have had their leases uploaded.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Please ensure the signed lease agreement is:
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>Signed by both the rider and your organization</li>
                <li>Contains all terms matching the approved application</li>
                <li>In PDF format</li>
                <li>Clearly legible</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="grid gap-6">
            {applications.map((app) => (
              <Card key={app.id} className="border-2 hover:border-[#023F40]/20 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{app.applicantName}</CardTitle>
                      <CardDescription className="mt-1">
                        Application ID: {app.id?.split(':')[1] || 'N/A'}
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Approved
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Motorcycle</p>
                      <p className="font-medium">{app.motorcycleBrand} {app.motorcycleModel}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Chassis Number</p>
                      <p className="font-medium">{app.chassisNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Loan Amount</p>
                      <p className="font-medium">RWF {parseInt(app.loanAmount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Rebate Amount</p>
                      <p className="font-medium text-[#023F40]">
                        RWF {parseInt(app.rebateAmount).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Lease Agreement Requirements
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Loan Term: {app.loanTerm} months</li>
                      <li>• Monthly Payment: RWF {parseInt(app.monthlyRepayment).toLocaleString()}</li>
                      <li>• Interest Rate: {app.interestRate}%</li>
                      <li>• Total Financed: RWF {parseInt(app.loanAmount).toLocaleString()}</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      <p>Approved on: {new Date(app.updatedAt).toLocaleDateString()}</p>
                      <p>Rider: {app.applicantName}</p>
                    </div>
                    <Button
                      onClick={() => handleLeaseUpload(app.id)}
                      disabled={uploading !== null}
                      className="bg-[#023F40] hover:bg-[#035f60]"
                    >
                      {uploading === app.id ? (
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
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}