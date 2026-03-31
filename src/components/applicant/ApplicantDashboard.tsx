import { ApplicationForm } from './ApplicationForm';
import { ApplicationHistory } from './ApplicationHistory';
import { User } from '../../utils/auth';
import { FileText, Plus, TrendingUp } from 'lucide-react';
import { Greeting } from '../ui/Greeting';
import { PageHeader } from '../PageHeader';

interface ApplicantDashboardProps {
  user: User;
  currentPage: string;
}

export function ApplicantDashboard({ user, currentPage }: ApplicantDashboardProps) {
  const renderContent = () => {
    switch (currentPage) {
      case 'submit':
        return (
          <div>
            <h1 className="text-lg sm:text-xl text-[#023F40] mt-6">Submit Application</h1>
            <ApplicationForm user={user} onSuccess={() => {}} />
          </div>
        );
      case 'applications':
        return (
          <div>
            <h1 className="text-lg sm:text-xl text-[#023F40] mt-6">My Applications</h1>
            <ApplicationHistory user={user} />
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div>
            <Greeting user={user} />
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Total Applications</span>
                  <FileText className="w-5 h-5 text-[#023F40]" />
                </div>
                <p className="text-3xl font-semibold text-gray-900">12</p>
                <p className="text-sm text-gray-500 mt-1">All time</p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Pending</span>
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-3xl font-semibold text-gray-900">3</p>
                <p className="text-sm text-orange-600 mt-1">In review</p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Approved</span>
                  <FileText className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-semibold text-gray-900">8</p>
                <p className="text-sm text-green-600 mt-1">67% approval rate</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-[#023F40] mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                  <Plus className="w-6 h-6 text-[#023F40] mb-2" />
                  <p className="font-medium text-gray-900">Submit New Application</p>
                  <p className="text-sm text-gray-600">Start a new rebate claim</p>
                </button>
                <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                  <FileText className="w-6 h-6 text-[#023F40] mb-2" />
                  <p className="font-medium text-gray-900">View My Applications</p>
                  <p className="text-sm text-gray-600">Track application status</p>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader />
      {renderContent()}
    </div>
  );
}