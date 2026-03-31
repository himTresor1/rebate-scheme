import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { api } from '../../utils/api';
import { toast } from 'sonner@2.0.3';
import {
  Bike,
  Upload,
  MapPin,
  FileText,
  CheckCircle2,
  User,
  Building2,
  DollarSign,
  Clock
} from 'lucide-react';
import { User as UserType } from '../../utils/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface Application {
  id: string;
  companyName: string;
  registrationNumber: string;
  rebateAmount: string;
  status: string;
  riderName?: string;
  riderNationalId?: string;
  eMotoModel?: string;
  fundedAt?: string;
  proofOfPaymentUrl?: string;
}

interface DeliveryConfirmationViewProps {
  user: UserType;
}

export function DeliveryConfirmationView({ user }: DeliveryConfirmationViewProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Delivery confirmation fields
  const [handoverReceiptUrl, setHandoverReceiptUrl] = useState('');
  const [geotaggedPhotoUrl, setGeotaggedPhotoUrl] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [kilometresTraveled, setKilometresTraveled] = useState('');
  const [co2Transmitted, setCo2Transmitted] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingDelivery();
      setApplications(data);
    } catch (error: any) {
      toast.error('Failed to load applications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!selectedApp) return;

    if (!handoverReceiptUrl.trim() || !geotaggedPhotoUrl.trim()) {
      toast.error('Please provide both handover receipt and geotagged photo');
      return;
    }

    setProcessing(true);
    try {
      await api.confirmDelivery({
        applicationId: selectedApp.id,
        handoverReceiptUrl,
        geotaggedPhotoUrl,
        deliveryNotes,
        kilometresTraveled,
        co2Transmitted
      });

      toast.success('Delivery confirmed successfully! Application completed.');
      setShowConfirmDialog(false);
      resetForm();
      loadApplications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm delivery');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setHandoverReceiptUrl('');
    setGeotaggedPhotoUrl('');
    setDeliveryNotes('');
    setKilometresTraveled('');
    setCo2Transmitted('');
    setSelectedApp(null);
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDeliveryDeadline = (fundedAt: string) => {
    const fundedDate = new Date(fundedAt);
    const deadline = new Date(fundedDate.getTime() + 48 * 60 * 60 * 1000); // 48 hours
    return deadline;
  };

  const isDeadlineClose = (fundedAt: string) => {
    const deadline = calculateDeliveryDeadline(fundedAt);
    const now = new Date();
    const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursRemaining < 12; // Warning if less than 12 hours remaining
  };

  const filteredApps = applications.filter(app => {
    const searchLower = searchTerm.toLowerCase();
    return (
      app.companyName?.toLowerCase().includes(searchLower) ||
      app.riderName?.toLowerCase().includes(searchLower) ||
      app.registrationNumber?.toLowerCase().includes(searchLower) ||
      app.eMotoModel?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#023F40] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#6DB27F]/20 flex items-center justify-center">
              <Bike className="w-6 h-6 text-[#6DB27F]" />
            </div>
            <div>
              <CardTitle>Delivery Confirmation</CardTitle>
              <CardDescription>
                Record e-moto handover to riders within 48-hour window
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Funded Applications</CardTitle>
              <CardDescription>
                {applications.length} e-moto{applications.length !== 1 ? 's' : ''} ready for delivery
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Search by rider, company, or e-moto model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Deliveries List */}
          {paginatedApps.length === 0 ? (
            <div className="text-center py-12">
              <Bike className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No deliveries pending</p>
              <p className="text-sm text-gray-500 mt-2">
                Funded applications will appear here for delivery confirmation
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedApps.map((app) => {
                  const deadline = app.fundedAt ? calculateDeliveryDeadline(app.fundedAt) : null;
                  const isUrgent = app.fundedAt ? isDeadlineClose(app.fundedAt) : false;

                  return (
                    <div
                      key={app.id}
                      className={`border rounded-lg p-6 ${
                        isUrgent
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          {/* Application Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {app.registrationNumber || app.id.slice(-8)}
                              </h3>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  <span>{app.riderName || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Bike className="w-4 h-4" />
                                  <span>{app.eMotoModel || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Rebate Amount</p>
                              <p className="text-xl font-bold text-[#023F40]">
                                {formatCurrency(app.rebateAmount)}
                              </p>
                            </div>
                          </div>

                          {/* Funding Details */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-sm text-gray-900">
                                Payment Received
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              {app.fundedAt && (
                                <div>
                                  <p className="text-gray-600">Funded At</p>
                                  <p className="font-medium">{formatDate(app.fundedAt)}</p>
                                </div>
                              )}
                              {deadline && (
                                <div>
                                  <p className="text-gray-600">Delivery Deadline</p>
                                  <p className={`font-medium ${isUrgent ? 'text-orange-600' : ''}`}>
                                    {formatDate(deadline.toISOString())}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Deadline Warning */}
                          {isUrgent && (
                            <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 mb-4 flex items-start gap-2">
                              <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                              <div className="text-sm text-orange-800">
                                <p className="font-semibold">Urgent: Delivery Deadline Approaching</p>
                                <p>
                                  Less than 12 hours remaining to complete delivery within the 48-hour window.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Rider Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-600">Rider Name</p>
                              <p className="font-medium">{app.riderName || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">National ID</p>
                              <p className="font-medium">{app.riderNationalId || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="md:w-48">
                          <Button
                            onClick={() => {
                              setSelectedApp(app);
                              setShowConfirmDialog(true);
                            }}
                            className="w-full bg-[#6DB27F] hover:bg-[#5da26f] text-white"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Confirm Delivery
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredApps.length)} of{' '}
                    {filteredApps.length} deliveries
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirm Delivery Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm E-Moto Delivery</DialogTitle>
            <DialogDescription>
              Upload proof of handover to complete the rebate process
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Rider</p>
                    <p className="font-semibold">{selectedApp.riderName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">E-Moto Model</p>
                    <p className="font-semibold">{selectedApp.eMotoModel || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Rebate Amount</p>
                    <p className="font-semibold text-[#023F40]">
                      {formatCurrency(selectedApp.rebateAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">National ID</p>
                    <p className="font-semibold">{selectedApp.riderNationalId || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="handover-receipt">
                  Signed Handover Receipt URL *
                  <span className="text-xs text-gray-500 ml-2">(Document signed by both parties)</span>
                </Label>
                <Input
                  id="handover-receipt"
                  value={handoverReceiptUrl}
                  onChange={(e) => setHandoverReceiptUrl(e.target.value)}
                  placeholder="https://... (Upload document and paste URL)"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload the signed handover receipt to storage and paste the URL here
                </p>
              </div>

              <div>
                <Label htmlFor="geotagged-photo">
                  Geotagged Photo URL *
                  <span className="text-xs text-gray-500 ml-2">(Photo of rider with e-moto)</span>
                </Label>
                <Input
                  id="geotagged-photo"
                  value={geotaggedPhotoUrl}
                  onChange={(e) => setGeotaggedPhotoUrl(e.target.value)}
                  placeholder="https://... (Upload photo and paste URL)"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Photo must include metadata with time and location of handover
                </p>
              </div>

              <div>
                <Label htmlFor="delivery-notes">Delivery Notes (Optional)</Label>
                <Textarea
                  id="delivery-notes"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Add any notes about the delivery (e.g., location, time, witness details)..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kilometres-traveled">
                    Kilometres Traveled
                    <span className="text-xs text-gray-500 ml-2">(km)</span>
                  </Label>
                  <Input
                    id="kilometres-traveled"
                    type="number"
                    step="0.1"
                    min="0"
                    value={kilometresTraveled}
                    onChange={(e) => setKilometresTraveled(e.target.value)}
                    placeholder="0.0"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Estimated distance traveled by the e-moto
                  </p>
                </div>

                <div>
                  <Label htmlFor="co2-transmitted">
                    CO₂ Emissions Saved
                    <span className="text-xs text-gray-500 ml-2">(kg CO₂e)</span>
                  </Label>
                  <Input
                    id="co2-transmitted"
                    type="number"
                    step="0.01"
                    min="0"
                    value={co2Transmitted}
                    onChange={(e) => setCo2Transmitted(e.target.value)}
                    placeholder="0.00"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Estimated CO₂ emissions saved vs. petrol motorcycle
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Required Documentation:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>Signed handover receipt (both financier and rider signatures)</li>
                      <li>Geotagged photo of rider with the e-moto</li>
                      <li>Photo metadata must confirm delivery time and location</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-900">
                  <strong>Status Update:</strong> Once delivery is confirmed, the application status will
                  be updated to <strong>COMPLETED</strong>. This closes the disbursement loop and the
                  rebate process is officially finished.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowConfirmDialog(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelivery}
              disabled={processing || !handoverReceiptUrl.trim() || !geotaggedPhotoUrl.trim()}
              className="bg-[#6DB27F] hover:bg-[#5da26f] text-white"
            >
              {processing ? 'Confirming...' : 'Confirm Delivery'}
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}