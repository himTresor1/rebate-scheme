import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Filter } from 'lucide-react';
import { formatDisplayDate } from '../../utils/dateFormat';
import { formatRebateAmountWithPercent, rebateOptionsFromRecord } from '../../utils/rebateCalculation';
import {
  ALL_ASSET_FINANCIERS_LABEL,
  ALL_EMOTO_PROVIDERS_LABEL,
  DATE_RANGE_FILTER_OPTIONS,
  FILTER_LABELS,
  GENDER_FILTER_OPTIONS,
  matchesGenderFilter,
  matchesVehicleTypeFilter,
  VEHICLE_TYPE_FILTER_OPTIONS,
} from '../../utils/filterLabels';

interface Application {
  id: string;
  companyName: string;
  applicantName?: string;
  registrationNumber?: string;
  ticketNumber?: string;
  rebateAmount: string;
  status: string;
  createdAt: string;
  assignedAt?: string;
  isRetrofit?: boolean;
  motorcycleBrand?: string;
  motorcycleModel?: string;
  chassisNumber?: string;
  eligibilityCheck?: {
    nationalIdCheck?: { gender?: string };
  };
}

interface ReassignmentCheckingPageProps {
  applications: Application[];
  onOpenApplication: (application: Application) => void;
}

export function ReassignmentCheckingPage({ applications, onOpenApplication }: ReassignmentCheckingPageProps) {
  const [query, setQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
  const [financier, setFinancier] = useState('all');
  const [provider, setProvider] = useState('all');

  const financiers = useMemo(
    () => Array.from(new Set(applications.map((a) => a.companyName))).sort(),
    [applications]
  );
  const providers = useMemo(
    () => Array.from(new Set(applications.map((a) => a.motorcycleBrand).filter(Boolean) as string[])).sort(),
    [applications]
  );

  const rows = useMemo(() => {
    return applications
      .filter((app, idx) => {
        const receivedDate = new Date(app.assignedAt || app.createdAt);
        const days = Math.floor((Date.now() - receivedDate.getTime()) / (1000 * 60 * 60 * 24));
        const isWoman = app.eligibilityCheck?.nationalIdCheck?.gender === 'Female';
        const ticket = (app.ticketNumber || app.registrationNumber || app.id).toLowerCase();
        const applicant = (app.applicantName || '').toLowerCase();
        const q = query.toLowerCase();

        if (q && !ticket.includes(q) && !applicant.includes(q)) return false;
        if (!matchesGenderFilter(isWoman, genderFilter)) return false;
        if (!matchesVehicleTypeFilter(Boolean(app.isRetrofit), vehicleTypeFilter)) return false;
        if (financier !== 'all' && app.companyName !== financier) return false;
        if (provider !== 'all' && (app.motorcycleBrand || '') !== provider) return false;
        if (dateRange === 'day' && days > 1) return false;
        if (dateRange === 'week' && days > 7) return false;
        if (dateRange === 'month' && days > 30) return false;
        if (dateRange === 'year' && days > 365) return false;
        return true;
      })
      .map((app, idx) => ({
        app,
        ticketNumber: app.ticketNumber || app.registrationNumber || app.id.replace('application:', '').slice(0, 8).toUpperCase(),
        oldClient: idx % 2 === 0 ? 'Albert JAMES' : 'Grace UWASE',
        newClient: (app.applicantName || 'Unknown Client').toUpperCase(),
        priorApprovalDate: formatDisplayDate(app.createdAt),
        vehicleType: app.isRetrofit ? 'Retrofit' : 'New E-Moto',
        provider: app.motorcycleBrand || 'N/A',
        vin: app.chassisNumber || 'N/A',
        gender: app.eligibilityCheck?.nationalIdCheck?.gender === 'Female' ? 'Woman' : 'Man',
        rebateAmount: formatRebateAmountWithPercent(app.rebateAmount, rebateOptionsFromRecord(app)),
      }));
  }, [applications, query, dateRange, genderFilter, vehicleTypeFilter, financier, provider]);

  const notOpened = rows.length;
  const waitingQa = rows.filter((row) => row.app.status === 'manager-review').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl text-[#023F40]">Rebate Reassignment Checking Page</h1>
        <p className="text-sm text-gray-600 mt-1">
          Verify reassignment information for new clients linked to previously approved rebate tickets.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total rebate changes</p>
            <p className="text-2xl font-bold text-[#023F40]">{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Not opened</p>
            <p className="text-2xl font-bold text-amber-600">{notOpened}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Waiting QA team review</p>
            <p className="text-2xl font-bold text-blue-600">{waitingQa}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Multiple filters
          </CardTitle>
          <CardDescription>Filter by date range, women, retrofit, financier, and e-moto provider.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Input
            placeholder="Search ticket or client..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger><SelectValue placeholder={FILTER_LABELS.dateRange} /></SelectTrigger>
            <SelectContent>
              {DATE_RANGE_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger><SelectValue placeholder={FILTER_LABELS.gender} /></SelectTrigger>
            <SelectContent>
              {GENDER_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
            <SelectTrigger><SelectValue placeholder={FILTER_LABELS.vehicleType} /></SelectTrigger>
            <SelectContent>
              {VEHICLE_TYPE_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={financier} onValueChange={setFinancier}>
            <SelectTrigger><SelectValue placeholder={FILTER_LABELS.assetFinancier} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{ALL_ASSET_FINANCIERS_LABEL}</SelectItem>
              {financiers.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger><SelectValue placeholder={FILTER_LABELS.eMotoProvider} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{ALL_EMOTO_PROVIDERS_LABEL}</SelectItem>
              {providers.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#023F40]">Pending reassignment review pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="pb-3 pr-3">Ticket Number</th>
                  <th className="pb-3 pr-3">Old Client</th>
                  <th className="pb-3 pr-3">New Client Assuming Rebate</th>
                  <th className="pb-3 pr-3">Prior Rebate Approval Date</th>
                  <th className="pb-3 pr-3">Financier</th>
                  <th className="pb-3 pr-3">Vehicle Type</th>
                  <th className="pb-3 pr-3">E-Moto Provider</th>
                  <th className="pb-3 pr-3">E-Moto VIN</th>
                  <th className="pb-3 pr-3">Gender</th>
                  <th className="pb-3 pr-3">Rebate Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.ticketNumber} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => onOpenApplication(row.app)}>
                    <td className="py-3 pr-3 font-semibold text-[#023F40]">{row.ticketNumber}</td>
                    <td className="py-3 pr-3">{row.oldClient}</td>
                    <td className="py-3 pr-3 font-medium">{row.newClient}</td>
                    <td className="py-3 pr-3">{row.priorApprovalDate}</td>
                    <td className="py-3 pr-3">{row.app.companyName}</td>
                    <td className="py-3 pr-3">{row.vehicleType}</td>
                    <td className="py-3 pr-3">{row.provider}</td>
                    <td className="py-3 pr-3">{row.vin}</td>
                    <td className="py-3 pr-3">
                      <Badge variant="outline">{row.gender}</Badge>
                    </td>
                    <td className="py-3 pr-3">{row.rebateAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

