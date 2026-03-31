import { useState } from 'react';
import { User } from '../../utils/auth';
import { FinanceInitiatorView } from './FinanceInitiatorView';
import { FinanceApproverView } from './FinanceApproverView';
import { PaymentProcessingView } from './PaymentProcessingView';
import { DeliveryConfirmationView } from './DeliveryConfirmationView';
import { FinanceOfficerPaymentView } from './FinanceOfficerPaymentView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  FileCheck,
  Shield,
  DollarSign,
  Bike
} from 'lucide-react';
import { Greeting } from '../ui/Greeting';
import { PageHeader } from '../PageHeader';

interface FinanceDashboardProps {
  user: User;
  currentPage: string;
}

export function FinanceDashboard({ user, currentPage }: FinanceDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Show payment view for DESIGNATED_FINANCE_OFFICER when on pending-payments page
  if (user.role === 'DESIGNATED_FINANCE_OFFICER' && currentPage === 'pending-payments') {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <PageHeader />
        <FinanceOfficerPaymentView user={user} />
      </div>
    );
  }

  // Check permissions
  const canInitiatePayment = user.permissions?.includes('financial.initiate_payment') || false;
  const canAuthorizePayment = user.permissions?.includes('financial.authorize_payment') || false;
  const isFinanceRole = ['FINANCE_OFFICER', 'finance', 'REBATE_MANAGER', 'SYSTEM_ADMIN'].includes(user.role);
  const isAssetFinancier = ['ASSET_FINANCIER_ADMIN', 'CLAIMS_OFFICER'].includes(user.role);

  // Determine which views to show
  const showInitiatorView = canInitiatePayment;
  const showApproverView = canAuthorizePayment;
  const showPaymentProcessing = isFinanceRole;
  const showDeliveryConfirmation = isAssetFinancier;

  // If user has only one permission, show that view directly
  const hasSinglePermission = 
    (showInitiatorView && !showApproverView && !showPaymentProcessing && !showDeliveryConfirmation) ||
    (!showInitiatorView && showApproverView && !showPaymentProcessing && !showDeliveryConfirmation) ||
    (!showInitiatorView && !showApproverView && showPaymentProcessing && !showDeliveryConfirmation) ||
    (!showInitiatorView && !showApproverView && !showPaymentProcessing && showDeliveryConfirmation);

  if (hasSinglePermission) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <PageHeader />
        {showInitiatorView && <FinanceInitiatorView user={user} />}
        {showApproverView && <FinanceApproverView user={user} />}
        {showPaymentProcessing && <PaymentProcessingView user={user} />}
        {showDeliveryConfirmation && <DeliveryConfirmationView user={user} />}
      </div>
    );
  }

  // If user has multiple permissions, show tabs
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader />
      <Greeting user={user} />
      <h1 className="text-lg sm:text-xl text-[#023F40] mt-6">Finance & Disbursement</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2">
          {showInitiatorView && (
            <TabsTrigger value="initiate" className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              <span className="hidden md:inline">Initiate Disbursement</span>
              <span className="md:hidden">Initiate</span>
            </TabsTrigger>
          )}
          {showApproverView && (
            <TabsTrigger value="approve" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden md:inline">Final Approval</span>
              <span className="md:hidden">Approve</span>
            </TabsTrigger>
          )}
          {showPaymentProcessing && (
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden md:inline">Process Payment</span>
              <span className="md:hidden">Payment</span>
            </TabsTrigger>
          )}
          {showDeliveryConfirmation && (
            <TabsTrigger value="delivery" className="flex items-center gap-2">
              <Bike className="w-4 h-4" />
              <span className="hidden md:inline">Delivery</span>
              <span className="md:hidden">Delivery</span>
            </TabsTrigger>
          )}
        </TabsList>

        {showInitiatorView && (
          <TabsContent value="initiate">
            <FinanceInitiatorView user={user} />
          </TabsContent>
        )}

        {showApproverView && (
          <TabsContent value="approve">
            <FinanceApproverView user={user} />
          </TabsContent>
        )}

        {showPaymentProcessing && (
          <TabsContent value="payment">
            <PaymentProcessingView user={user} />
          </TabsContent>
        )}

        {showDeliveryConfirmation && (
          <TabsContent value="delivery">
            <DeliveryConfirmationView user={user} />
          </TabsContent>
        )}

        {/* Default view if no specific tab is selected */}
        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Finance & Disbursement Dashboard</CardTitle>
              <CardDescription>
                Select a tab above to view and manage different stages of the payment workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {showInitiatorView && (
                  <div
                    className="border rounded-lg p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setActiveTab('initiate')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#023F40]/10 flex items-center justify-center">
                        <FileCheck className="w-6 h-6 text-[#023F40]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Initiate Disbursement</h3>
                        <p className="text-sm text-gray-600">
                          Review QA-approved applications and provide first signature
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {showApproverView && (
                  <div
                    className="border rounded-lg p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setActiveTab('approve')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#6DB27F]/20 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-[#6DB27F]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Final Approval</h3>
                        <p className="text-sm text-gray-600">
                          Provide second signature and authorize payment release
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {showPaymentProcessing && (
                  <div
                    className="border rounded-lg p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setActiveTab('payment')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Process Payment</h3>
                        <p className="text-sm text-gray-600">
                          Execute bank transfers and upload proof of payment
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {showDeliveryConfirmation && (
                  <div
                    className="border rounded-lg p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setActiveTab('delivery')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Bike className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Delivery Confirmation</h3>
                        <p className="text-sm text-gray-600">
                          Record e-moto handover with signed receipt and geotagged photo
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Workflow Diagram */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
                <h3 className="font-semibold text-lg mb-4 text-[#023F40]">
                  Payment Workflow (Two-Signature System)
                </h3>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 text-sm">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#023F40] text-white flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <span className="font-medium">Finance Officer Initiates</span>
                    </div>
                    <p className="text-gray-600 ml-10">
                      First signature - selects QA-approved applications
                    </p>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#6DB27F] text-white flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <span className="font-medium">CFO Approves</span>
                    </div>
                    <p className="text-gray-600 ml-10">
                      Second signature - must be different user
                    </p>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                      <span className="font-medium">Finance Processes</span>
                    </div>
                    <p className="text-gray-600 ml-10">
                      Execute payment and upload proof
                    </p>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                        4
                      </div>
                      <span className="font-medium">Delivery Confirmed</span>
                    </div>
                    <p className="text-gray-600 ml-10">
                      Asset Financier confirms handover
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}