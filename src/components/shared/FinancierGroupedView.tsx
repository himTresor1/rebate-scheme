import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Building2, ChevronRight, FileText, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Application {
  id: string;
  companyName: string;
  organizationId?: string;
  status: string;
  applicantName: string;
  rebateAmount: string;
  submittedAt?: string;
  [key: string]: any;
}

interface FinancierGroup {
  organizationId: string;
  organizationName: string;
  organizationType?: string;
  applications: Application[];
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

interface FinancierGroupedViewProps {
  applications: Application[];
  onSelectApplication?: (app: Application) => void;
  selectedApplicationId?: string;
  renderApplicationCard: (app: Application) => React.ReactNode;
}

export function FinancierGroupedView({ 
  applications, 
  onSelectApplication,
  selectedApplicationId,
  renderApplicationCard 
}: FinancierGroupedViewProps) {
  const [selectedFinancier, setSelectedFinancier] = useState<string | null>(null);
  const [groups, setGroups] = useState<FinancierGroup[]>([]);

  useEffect(() => {
    groupApplications();
  }, [applications]);

  const groupApplications = () => {
    const groupMap = new Map<string, FinancierGroup>();

    applications.forEach(app => {
      const orgId = app.organizationId || app.companyName;
      const orgName = app.companyName;

      if (!groupMap.has(orgId)) {
        groupMap.set(orgId, {
          organizationId: orgId,
          organizationName: orgName,
          organizationType: getOrganizationType(orgName),
          applications: [],
          stats: {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0
          }
        });
      }

      const group = groupMap.get(orgId)!;
      group.applications.push(app);
      group.stats.total++;

      // Count by status
      const status = app.status?.toLowerCase() || '';
      if (status.includes('pending') || status.includes('submitted') || status.includes('review')) {
        group.stats.pending++;
      } else if (status.includes('approved')) {
        group.stats.approved++;
      } else if (status.includes('rejected')) {
        group.stats.rejected++;
      }
    });

    const sortedGroups = Array.from(groupMap.values()).sort((a, b) => 
      b.stats.total - a.stats.total
    );

    setGroups(sortedGroups);
  };

  const getOrganizationType = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('bank')) return 'Bank';
    if (nameLower.includes('mfi') || nameLower.includes('microfinance')) return 'MFI';
    if (nameLower.includes('moto') || nameLower.includes('electric') || nameLower.includes('ampersand')) return 'E-Moto';
    return 'Financier';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Bank': return 'bg-blue-100 text-blue-800';
      case 'MFI': return 'bg-purple-100 text-purple-800';
      case 'E-Moto': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedFinancier) {
    const group = groups.find(g => g.organizationId === selectedFinancier);
    if (!group) return null;

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-4"
      >
        {/* Header with back button */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedFinancier(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Financiers
          </Button>
        </div>

        <Card className="border-[#023F40]/20">
          <CardHeader className="bg-gradient-to-r from-[#023F40]/5 to-transparent">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#023F40]/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-[#023F40]" />
                </div>
                <div>
                  <CardTitle className="text-xl text-[#023F40]">{group.organizationName}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getTypeColor(group.organizationType || 'Financier')}>
                      {group.organizationType}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {group.stats.total} {group.stats.total === 1 ? 'Application' : 'Applications'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#023F40]">{group.stats.total}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{group.stats.pending}</div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{group.stats.approved}</div>
                  <div className="text-xs text-gray-600">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{group.stats.rejected}</div>
                  <div className="text-xs text-gray-600">Rejected</div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Applications List */}
        <div className="grid grid-cols-1 gap-4">
          {group.applications.map(app => (
            <div key={app.id}>
              {renderApplicationCard(app)}
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Applications by Asset Financier</h3>
          <p className="text-sm text-gray-600">
            {groups.length} financiers • {applications.length} total applications
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => (
          <motion.div
            key={group.organizationId}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedFinancier(group.organizationId)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-[#023F40]/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-[#023F40]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate mb-1">
                        {group.organizationName}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getTypeColor(group.organizationType || 'Financier')} text-xs`}>
                          {group.organizationType}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {group.stats.total} {group.stats.total === 1 ? 'Application' : 'Applications'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {groups.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No applications found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}