import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Upload, FileText, Trash2, Save } from 'lucide-react';
import { User } from '../../utils/auth';
import { Badge } from '../ui/badge';

interface ApplicationFormProps {
  user: User;
  onSuccess: () => void;
}

interface UploadedFile {
  name: string;
  url: string;
  path: string;
  type: string;
}

export function ApplicationForm({ user, onSuccess }: ApplicationFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    registrationNumber: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    rebateAmount: '',
    projectDescription: '',
    vehicleCount: '',
    emissionReduction: '',
  });

  const [documents, setDocuments] = useState<{
    businessLicense: UploadedFile | null;
    financialStatements: UploadedFile | null;
    emissionCertificate: UploadedFile | null;
  }>({
    businessLicense: null,
    financialStatements: null,
    emissionCertificate: null,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileUpload = async (type: keyof typeof documents, file: File) => {
    setUploading(true);
    
    try {
      const result = await api.uploadFile(file);
      setDocuments({
        ...documents,
        [type]: {
          name: file.name,
          url: result.url,
          path: result.path,
          type: file.type
        }
      });
      toast.success('File uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (type: keyof typeof documents) => {
    setDocuments({ ...documents, [type]: null });
  };

  const handleSubmit = async (isDraft: boolean) => {
    // Validate required fields if not draft
    if (!isDraft) {
      const requiredFields = [
        'companyName',
        'registrationNumber',
        'contactPerson',
        'contactEmail',
        'contactPhone',
        'rebateAmount',
        'projectDescription',
      ];

      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          return;
        }
      }

      if (!documents.businessLicense || !documents.financialStatements || !documents.emissionCertificate) {
        toast.error('Please upload all required documents');
        return;
      }
    }

    setLoading(true);

    try {
      await api.submitApplication({
        ...formData,
        documents,
        isDraft,
      });

      toast.success(isDraft ? 'Draft saved successfully' : 'Application submitted successfully');
      
      if (!isDraft) {
        // Clear form
        setFormData({
          companyName: '',
          registrationNumber: '',
          contactPerson: '',
          contactEmail: '',
          contactPhone: '',
          rebateAmount: '',
          projectDescription: '',
          vehicleCount: '',
          emissionReduction: '',
        });
        setDocuments({
          businessLicense: null,
          financialStatements: null,
          emissionCertificate: null,
        });
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rebate Application Form</CardTitle>
        <CardDescription>
          Complete all required fields and upload supporting documents. You can save as draft and return later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Company Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Enter company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number *</Label>
              <Input
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                placeholder="Enter registration number"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person *</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                placeholder="Full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="email@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone Number *</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="+1234567890"
              />
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Project Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rebateAmount">Rebate Amount Requested *</Label>
              <Input
                id="rebateAmount"
                type="number"
                value={formData.rebateAmount}
                onChange={(e) => handleInputChange('rebateAmount', e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleCount">Number of Vehicles</Label>
              <Input
                id="vehicleCount"
                type="number"
                value={formData.vehicleCount}
                onChange={(e) => handleInputChange('vehicleCount', e.target.value)}
                placeholder="Enter count"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emissionReduction">Estimated Emission Reduction (%)</Label>
              <Input
                id="emissionReduction"
                type="number"
                value={formData.emissionReduction}
                onChange={(e) => handleInputChange('emissionReduction', e.target.value)}
                placeholder="Enter percentage"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectDescription">Project Description *</Label>
            <Textarea
              id="projectDescription"
              value={formData.projectDescription}
              onChange={(e) => handleInputChange('projectDescription', e.target.value)}
              placeholder="Describe your project and how it will reduce emissions..."
              rows={4}
            />
          </div>
        </div>

        {/* Document Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Supporting Documents</h3>
          
          <div className="space-y-4">
            {/* Business License */}
            <div className="space-y-2">
              <Label>Business License *</Label>
              {documents.businessLicense ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border rounded-lg bg-green-50">
                  <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="flex-1 break-all text-sm">{documents.businessLicense.name}</span>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Badge variant="default">Uploaded</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeDocument('businessLicense')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('businessLicense', file);
                    }}
                    disabled={uploading}
                    className="w-full"
                  />
                  {uploading && <span className="text-sm text-gray-500 whitespace-nowrap">Uploading...</span>}
                </div>
              )}
            </div>

            {/* Financial Statements */}
            <div className="space-y-2">
              <Label>Financial Statements *</Label>
              {documents.financialStatements ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border rounded-lg bg-green-50">
                  <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="flex-1 break-all text-sm">{documents.financialStatements.name}</span>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Badge variant="default">Uploaded</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeDocument('financialStatements')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('financialStatements', file);
                    }}
                    disabled={uploading}
                    className="w-full"
                  />
                  {uploading && <span className="text-sm text-gray-500 whitespace-nowrap">Uploading...</span>}
                </div>
              )}
            </div>

            {/* Emission Certificate */}
            <div className="space-y-2">
              <Label>Emission Certificate *</Label>
              {documents.emissionCertificate ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border rounded-lg bg-green-50">
                  <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="flex-1 break-all text-sm">{documents.emissionCertificate.name}</span>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Badge variant="default">Uploaded</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeDocument('emissionCertificate')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('emissionCertificate', file);
                    }}
                    disabled={uploading}
                    className="w-full"
                  />
                  {uploading && <span className="text-sm text-gray-500 whitespace-nowrap">Uploading...</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={() => handleSubmit(true)}
            variant="outline"
            disabled={loading || uploading}
            className="w-full sm:w-auto"
          >
            <Save className="w-4 h-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit(false)}
            disabled={loading || uploading}
            className="w-full sm:w-auto"
          >
            <Upload className="w-4 h-4 mr-2" />
            Submit Application
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
