import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Info, Mail, Phone, MapPin, HelpCircle } from 'lucide-react';

export function PageHeader() {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <>
      {/* Header Buttons */}
      <div className="fixed top-6 right-6 z-30 flex items-center gap-3">
        <Button
          onClick={() => setShowAboutModal(true)}
          variant="outline"
          className="bg-white hover:bg-gray-50 border-[#023F40]/20 text-[#023F40] shadow-sm"
        >
          <Info className="w-4 h-4 mr-2" />
          About Rebate Scheme
        </Button>
        <Button
          onClick={() => setShowContactModal(true)}
          variant="outline"
          className="bg-white hover:bg-gray-50 border-[#023F40]/20 text-[#023F40] shadow-sm"
        >
          <Mail className="w-4 h-4 mr-2" />
          Contact Us
        </Button>
      </div>

      {/* About Rebate Scheme Modal */}
      <Dialog open={showAboutModal} onOpenChange={setShowAboutModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#023F40] flex items-center gap-2">
              <HelpCircle className="w-6 h-6" />
              About the Rebate Scheme
            </DialogTitle>
            <DialogDescription className="text-base">
              Understanding the RGF E-Moto Rebate Management System
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Overview Section */}
            <div>
              <h3 className="text-lg font-semibold text-[#023F40] mb-3">Overview</h3>
              <p className="text-gray-700 leading-relaxed">
                The RGF on-line rebate management system is designed to enhance e-moto affordability 
                and waste disposal by streamlining rebate applications through a comprehensive 
                multi-stage validation process.
              </p>
            </div>

            {/* Key Features */}
            <div>
              <h3 className="text-lg font-semibold text-[#023F40] mb-3">Key Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#023F40]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#023F40] font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Multi-Level Approval Workflow</p>
                    <p className="text-sm text-gray-600">
                      Applications undergo rigorous review by Rebate Analysts, Rebate Managers, 
                      E-Moto Program Managers, and Finance Officers.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#023F40]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#023F40] font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Configurable Eligibility Scoring</p>
                    <p className="text-sm text-gray-600">
                      Dynamic criteria management ensures fair and transparent evaluation of 
                      all rebate applications.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#023F40]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#023F40] font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Document Management & Verification</p>
                    <p className="text-sm text-gray-600">
                      Secure document upload, review, and verification with comprehensive 
                      tracking throughout the approval process.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#023F40]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#023F40] font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Two-Signature Finance Workflow</p>
                    <p className="text-sm text-gray-600">
                      Enhanced financial controls with dual approval requirements for payment 
                      processing and disbursement.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Who Can Use This System */}
            <div>
              <h3 className="text-lg font-semibold text-[#023F40] mb-3">Who Can Use This System</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900 text-sm">RGF Administrators</p>
                  <p className="text-xs text-gray-600">System configuration and oversight</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900 text-sm">E-Moto Companies</p>
                  <p className="text-xs text-gray-600">Submit rebate applications</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900 text-sm">Asset Financiers</p>
                  <p className="text-xs text-gray-600">Manage lease agreements</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900 text-sm">Commercial Banks</p>
                  <p className="text-xs text-gray-600">Financial processing & disbursement</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900 text-sm">Rebate Analysts</p>
                  <p className="text-xs text-gray-600">Review and score applications</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900 text-sm">Finance Officers</p>
                  <p className="text-xs text-gray-600">Process approved payments</p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-[#023F40]/5 p-5 rounded-lg border border-[#023F40]/10">
              <h3 className="text-lg font-semibold text-[#023F40] mb-3">Program Benefits</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#023F40]"></div>
                  Enhanced affordability of electric motorcycles for end-users
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#023F40]"></div>
                  Streamlined rebate application and approval process
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#023F40]"></div>
                  Improved waste disposal management
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#023F40]"></div>
                  Transparent and auditable approval workflows
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#023F40]"></div>
                  Real-time tracking and notification system
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Us Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#023F40] flex items-center gap-2">
              <Mail className="w-6 h-6" />
              Contact Us
            </DialogTitle>
            <DialogDescription>
              Get in touch with the RGF Rebate System support team
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#023F40] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Email Support</p>
                  <a 
                    href="mailto:support@rgf.rw" 
                    className="text-[#023F40] hover:underline"
                  >
                    support@rgf.rw
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    For technical issues and application inquiries
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#023F40] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Phone Support</p>
                  <a 
                    href="tel:+250788000000" 
                    className="text-[#023F40] hover:underline"
                  >
                    +250 788 000 000
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    Monday - Friday, 8:00 AM - 5:00 PM (EAT)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#023F40] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Office Location</p>
                  <p className="text-gray-700">
                    Rwanda Green Fund (RGF)
                  </p>
                  <p className="text-gray-700">
                    Kigali, Rwanda
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Visit by appointment only
                  </p>
                </div>
              </div>
            </div>

            {/* Support Hours */}
            <div className="bg-[#023F40]/5 p-4 rounded-lg border border-[#023F40]/10">
              <h4 className="font-semibold text-[#023F40] mb-2">Support Hours</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <p><span className="font-medium">Monday - Friday:</span> 8:00 AM - 5:00 PM</p>
                <p><span className="font-medium">Saturday - Sunday:</span> Closed</p>
                <p className="text-xs text-gray-600 mt-2">
                  * Emergency support available for critical system issues
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Additional Resources</h4>
              <div className="grid grid-cols-1 gap-2">
                <button className="text-left px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-sm text-[#023F40]">User Guide & Documentation</p>
                  <p className="text-xs text-gray-600">Access comprehensive system tutorials</p>
                </button>
                <button className="text-left px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-sm text-[#023F40]">Frequently Asked Questions</p>
                  <p className="text-xs text-gray-600">Find answers to common questions</p>
                </button>
                <button className="text-left px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-sm text-[#023F40]">Submit a Support Ticket</p>
                  <p className="text-xs text-gray-600">Report issues or request assistance</p>
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}