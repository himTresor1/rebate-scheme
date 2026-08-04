import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DateInput } from '../ui/date-input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { ArrowLeft, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatRebateAmountWithPercent } from '../../utils/rebateCalculation';
import {
  DATE_RANGE_FILTER_OPTIONS,
  FILTER_LABELS,
  GENDER_FILTER_OPTIONS,
  matchesGenderFilter,
  matchesVehicleTypeFilter,
  VEHICLE_TYPE_FILTER_OPTIONS,
} from '../../utils/filterLabels';

export interface AfSummaryRow {
  afName: string;
  advanceDeposits: number;
  committedToRebates: number;
  disbursed: number;
  leasesToDate: number;
  lastBankStatement: string;
}

export interface LeaseDetailRow {
  ticketNo: string;
  applicantName: string;
  woman: boolean;
  retrofit: boolean;
  emotoProvider: string;
  retailCost: number;
  rebateAmount: number;
  status: string;
}

interface TrackRecord {
  disbursementAmount: string;
  dateWithdrawn: string;
  match: 'yes' | 'no' | '';
  comment: string;
}

interface FinanceOfficerAfTrackingPageProps {
  afSummary: AfSummaryRow;
  leases: LeaseDetailRow[];
  onBack: () => void;
}

function money(value: number) {
  return value.toLocaleString();
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="px-4 py-4">
        <p className="text-xs sm:text-sm text-gray-600 leading-snug">{label}</p>
        <p className="text-xl font-bold text-[#023F40] mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

export function FinanceOfficerAfTrackingPage({ afSummary, leases, onBack }: FinanceOfficerAfTrackingPageProps) {
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterVehicleType, setFilterVehicleType] = useState('all');
  const [trackLease, setTrackLease] = useState<LeaseDetailRow | null>(null);
  const [trackForm, setTrackForm] = useState<TrackRecord>({
    disbursementAmount: '',
    dateWithdrawn: '',
    match: '',
    comment: '',
  });
  const [savedTracks, setSavedTracks] = useState<Record<string, TrackRecord>>({});

  const filteredLeases = useMemo(() => {
    return leases.filter((lease) => {
      if (!matchesGenderFilter(lease.woman, filterGender)) return false;
      if (!matchesVehicleTypeFilter(lease.retrofit, filterVehicleType)) return false;
      return true;
    });
  }, [leases, filterGender, filterVehicleType, filterDateRange]);

  const availableBalance = afSummary.advanceDeposits - afSummary.disbursed;

  const openTrackModal = (lease: LeaseDetailRow) => {
    const existing = savedTracks[lease.ticketNo];
    setTrackLease(lease);
    setTrackForm(
      existing || {
        disbursementAmount: lease.rebateAmount.toString(),
        dateWithdrawn: '',
        match: '',
        comment: '',
      }
    );
  };

  const handleSaveTrack = () => {
    if (!trackLease) return;
    if (!trackForm.disbursementAmount || !trackForm.dateWithdrawn || !trackForm.match) {
      toast.error('Complete disbursement amount, date withdrawn, and match status.');
      return;
    }
    setSavedTracks((prev) => ({
      ...prev,
      [trackLease.ticketNo]: trackForm,
    }));
    toast.success(`Tracking saved for ${trackLease.ticketNo} (demo).`);
    setTrackLease(null);
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={onBack}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to verification summary
      </Button>

      <div className="space-y-2">
        <h2 className="text-lg sm:text-xl font-semibold text-[#023F40]">RGF Finance Officer Tracking Page</h2>
        <p className="text-sm text-gray-600">
          Check weekly lease rebates against submitted AF bank statements and record reconciliation outcomes.
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-[#023F40]">Selected Asset Financier: {afSummary.afName}</p>
        <p className="text-xs text-gray-500">Below are all submitted rebates to RGF from the selected AF.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Funds Allocated (RWF)" value={money(afSummary.advanceDeposits)} />
        <SummaryCard label="Total Funds Utilized (RWF)" value={money(afSummary.disbursed)} />
        <SummaryCard label="Available Balance (RWF)" value={money(availableBalance)} />
        <SummaryCard label="Date of Last Verification" value={afSummary.lastBankStatement} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Multiple Filters
            </CardTitle>
            {(filterDateRange !== 'all' || filterGender !== 'all' || filterVehicleType !== 'all') && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-gray-600 hover:text-gray-900"
                onClick={() => {
                  setFilterDateRange('all');
                  setFilterGender('all');
                  setFilterVehicleType('all');
                }}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select value={filterDateRange} onValueChange={setFilterDateRange}>
            <SelectTrigger><SelectValue placeholder={FILTER_LABELS.dateRange} /></SelectTrigger>
            <SelectContent>
              {DATE_RANGE_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterGender} onValueChange={setFilterGender}>
            <SelectTrigger><SelectValue placeholder={FILTER_LABELS.gender} /></SelectTrigger>
            <SelectContent>
              {GENDER_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterVehicleType} onValueChange={setFilterVehicleType}>
            <SelectTrigger><SelectValue placeholder={FILTER_LABELS.vehicleType} /></SelectTrigger>
            <SelectContent>
              {VEHICLE_TYPE_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[#023F40]">
            Check AF weekly lease list against weekly AF bank statements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="pb-3 pr-3">Ticket Number</th>
                  <th className="pb-3 pr-3">Applicant Name</th>
                  <th className="pb-3 pr-3">Amount of Rebate (RWF) reported in System</th>
                  <th className="pb-3 pr-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeases.map((lease) => (
                  <tr key={lease.ticketNo} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 pr-3 font-semibold text-[#023F40]">{lease.ticketNo}</td>
                    <td className="py-3 pr-3">{lease.applicantName}</td>
                    <td className="py-3 pr-3">{formatRebateAmountWithPercent(lease.rebateAmount, { isWoman: lease.woman, isRetrofit: lease.retrofit })}</td>
                    <td className="py-3 pr-3">
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#023F40] text-[#023F40] hover:bg-[#023F40] hover:text-white"
                          onClick={() => openTrackModal(lease)}
                        >
                          Track
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(trackLease)} onOpenChange={(open) => !open && setTrackLease(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#023F40]">
              Track rebate — {trackLease?.ticketNo}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-900">
              Enter bank-statement values and confirm whether they match the system rebate amount.
            </div>
            <div className="space-y-2">
              <Label>Disbursement amount reported by bank (RWF)</Label>
              <Input
                type="number"
                value={trackForm.disbursementAmount}
                onChange={(e) => setTrackForm((prev) => ({ ...prev, disbursementAmount: e.target.value }))}
                placeholder="Enter amount from bank statement"
                className="placeholder:text-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label>Date withdrawn</Label>
              <DateInput
                value={trackForm.dateWithdrawn}
                onChange={(dateWithdrawn) => setTrackForm((prev) => ({ ...prev, dateWithdrawn }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Match?</Label>
              <Select
                value={trackForm.match || undefined}
                onValueChange={(value: 'yes' | 'no') => setTrackForm((prev) => ({ ...prev, match: value }))}
              >
                <SelectTrigger><SelectValue placeholder="YES / NO" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">YES</SelectItem>
                  <SelectItem value="no">NO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Comment</Label>
              <Textarea
                value={trackForm.comment}
                onChange={(e) => setTrackForm((prev) => ({ ...prev, comment: e.target.value }))}
                placeholder="Add reconciliation comment..."
                className="placeholder:text-gray-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackLease(null)}>Cancel</Button>
            <Button className="bg-[#023F40] hover:bg-[#035f60]" onClick={handleSaveTrack}>
              Save tracking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
