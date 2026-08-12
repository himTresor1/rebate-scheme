import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ArrowLeft, Filter, Eye, X, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatNumber } from '../../utils/numberFormat';
import { getRebatePercent } from '../../utils/rebateCalculation';
import { DOC_NAMES } from '../../utils/documentNames';
import {
  ALL_ASSET_FINANCIERS_LABEL,
  ALL_STATUSES_LABEL,
  FILTER_LABELS,
  GENDER_FILTER_OPTIONS,
  matchesGenderFilter,
  matchesVehicleTypeFilter,
  VEHICLE_TYPE_FILTER_OPTIONS,
} from '../../utils/filterLabels';
import { addNotificationForRoles } from '../../utils/notifications';
import {
  getPossessionRecords,
  POSSESSION_CHANGED_EVENT,
  PossessionStatementRecord,
  resolvePossessionStatement,
} from '../../utils/possessionStore';
import { APPROVED_POSSESSION_CASES, ApprovedPossessionCase } from '../../utils/possessionCatalog';

type PossessionStatus = 'awaiting-confirmation' | 'pending-verification' | 'verified' | 'rejected';

type PossessionAnalysisRow = ApprovedPossessionCase;

const MOCK_POSSESSION_ANALYSIS: PossessionAnalysisRow[] = APPROVED_POSSESSION_CASES;

function statusBadge(status: PossessionStatus) {
  if (status === 'verified') {
    return (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Confirmed
      </Badge>
    );
  }
  if (status === 'pending-verification') {
    return <Badge className="bg-blue-100 text-blue-800">Awaiting your review</Badge>;
  }
  if (status === 'rejected') {
    return (
      <Badge className="bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Rejected
      </Badge>
    );
  }
  return <Badge className="bg-amber-100 text-amber-800">Awaiting AF submission</Badge>;
}

interface PossessionAnalysisViewProps {
  currentUserName?: string;
  autoOpenTicket?: string | null;
  onAutoOpenHandled?: () => void;
}

export function PossessionAnalysisView({
  currentUserName = 'RGF Rebate Team',
  autoOpenTicket,
  onAutoOpenHandled,
}: PossessionAnalysisViewProps = {}) {
  const [rows] = useState(MOCK_POSSESSION_ANALYSIS);
  const [submissions, setSubmissions] = useState<Record<string, PossessionStatementRecord>>(() =>
    getPossessionRecords()
  );
  const [query, setQuery] = useState('');
  const [filterAf, setFilterAf] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterVehicleType, setFilterVehicleType] = useState('all');
  const [selected, setSelected] = useState<PossessionAnalysisRow | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [acceptComment, setAcceptComment] = useState('');

  useEffect(() => {
    const sync = () => setSubmissions(getPossessionRecords());
    sync();
    window.addEventListener(POSSESSION_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(POSSESSION_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    if (!autoOpenTicket) return;
    const row = rows.find((r) => r.ticketNumber === autoOpenTicket);
    if (row) {
      setSelected(row);
      onAutoOpenHandled?.();
    }
  }, [autoOpenTicket, rows, onAutoOpenHandled]);

  const statusFor = (ticketNumber: string): PossessionStatus =>
    submissions[ticketNumber]?.status || 'awaiting-confirmation';

  const financiers = useMemo(
    () => Array.from(new Set(rows.map((r) => r.assetFinancier))).sort(),
    [rows]
  );

  const isFiltered =
    query !== '' || filterAf !== 'all' || filterStatus !== 'all' || filterGender !== 'all' || filterVehicleType !== 'all';

  const clearFilters = () => {
    setQuery('');
    setFilterAf('all');
    setFilterStatus('all');
    setFilterGender('all');
    setFilterVehicleType('all');
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const q = query.toLowerCase();
      if (
        q &&
        !r.ticketNumber.toLowerCase().includes(q) &&
        !r.firstName.toLowerCase().includes(q) &&
        !r.lastName.toLowerCase().includes(q) &&
        !r.submittedBy.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (filterAf !== 'all' && r.assetFinancier !== filterAf) return false;
      if (filterStatus !== 'all' && statusFor(r.ticketNumber) !== filterStatus) return false;
      if (!matchesGenderFilter(r.isWoman, filterGender)) return false;
      if (!matchesVehicleTypeFilter(r.isRetrofit, filterVehicleType)) return false;
      return true;
    });
  }, [rows, query, filterAf, filterStatus, filterGender, filterVehicleType, submissions]);

  const awaitingCount = rows.filter((r) => statusFor(r.ticketNumber) === 'awaiting-confirmation').length;
  const pendingReviewCount = rows.filter((r) => statusFor(r.ticketNumber) === 'pending-verification').length;
  const verifiedCount = rows.filter((r) => statusFor(r.ticketNumber) === 'verified').length;
  const rejectedCount = rows.filter((r) => statusFor(r.ticketNumber) === 'rejected').length;
  const totalCount = rows.length;
  const verifiedShare = totalCount === 0 ? 0 : Math.round((verifiedCount / totalCount) * 100);

  const applyStatusFilter = (status: string) => {
    setFilterStatus(status);
    document.getElementById('possession-analysis-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const possessionOverview = [
    { name: 'Confirmed', count: verifiedCount, fill: '#6DB27F' },
    { name: 'Awaiting your review', count: pendingReviewCount, fill: '#2563eb' },
    { name: 'Rejected', count: rejectedCount, fill: '#dc2626' },
    { name: 'Awaiting AF submission', count: awaitingCount, fill: '#023F40' },
  ].filter((d) => d.count > 0);

  const byAfPossession = useMemo(() => {
    const map = new Map<string, { awaiting: number; submitted: number }>();
    for (const r of rows) {
      const entry = map.get(r.assetFinancier) || { awaiting: 0, submitted: 0 };
      if (statusFor(r.ticketNumber) === 'awaiting-confirmation') entry.awaiting += 1;
      else entry.submitted += 1;
      map.set(r.assetFinancier, entry);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, v]) => ({
        name,
        awaiting: v.awaiting,
        submitted: v.submitted,
        total: v.awaiting + v.submitted,
      }));
  }, [rows, submissions]);

  const notifyAf = (ticket: PossessionAnalysisRow, decision: 'verified' | 'rejected', comment: string) => {
    addNotificationForRoles(
      ['ASSET_FINANCIER_ADMIN', 'ASSET_FINANCIER_STAFF', 'ASSET_FINANCIER_OFFICER', 'CLAIMS_OFFICER'],
      decision === 'verified'
        ? {
            type: 'success',
            title: 'E-Moto Possession Statement verified',
            message: `RGF confirmed the E-Moto Possession Statement for ${ticket.applicantName} (${ticket.ticketNumber}). The rebate is now eligible for disbursement authorization.`,
            actionable: true,
            actionLabel: 'View possession status',
            actionUrl: '/possession',
            actionData: { type: 'open-possession' },
          }
        : {
            type: 'error',
            title: 'E-Moto Possession Statement rejected',
            message: `RGF rejected the E-Moto Possession Statement for ${ticket.applicantName} (${ticket.ticketNumber}): "${comment}". Please upload a corrected statement.`,
            actionable: true,
            actionLabel: 'Resubmit possession statement',
            actionUrl: '/possession',
            actionData: { type: 'open-possession' },
          }
    );
  };

  const handleAccept = () => {
    if (!selected) return;
    resolvePossessionStatement(selected.ticketNumber, 'verified', acceptComment, currentUserName);
    notifyAf(selected, 'verified', acceptComment);
    toast.success(`Possession statement accepted for ${selected.ticketNumber}`, {
      description: 'The Asset Financier has been notified. This rebate is now eligible for disbursement authorization.',
    });
    setAcceptComment('');
    setSelected(null);
  };

  const handleReject = () => {
    if (!selected) return;
    if (!rejectComment.trim()) {
      toast.error('A comment is required to reject the possession statement.');
      return;
    }
    resolvePossessionStatement(selected.ticketNumber, 'rejected', rejectComment, currentUserName);
    notifyAf(selected, 'rejected', rejectComment);
    toast.success(`Possession statement rejected for ${selected.ticketNumber}`, {
      description: 'The Asset Financier has been notified and asked to resubmit.',
    });
    setShowRejectDialog(false);
    setRejectComment('');
    setSelected(null);
  };

  if (selected) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setSelected(null)} className="w-fit">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Possession Analysis
        </Button>
        <div>
          <h2 className="text-lg sm:text-xl text-[#023F40]">Review E-Moto Possession Statement</h2>
          <p className="text-sm text-gray-600 mt-1 max-w-3xl">
            Review the complete rebate information and the E-Moto Possession Statement uploaded by the Asset
            Financier, then accept or reject it.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Ticket No.</p>
              <p className="font-semibold text-[#023F40]">{selected.ticketNumber}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Asset Financier</p>
              <p className="font-medium">{selected.assetFinancier}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Submitted By</p>
              <p className="font-medium">{selected.submittedBy}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Applicant</p>
              <p className="font-medium">
                {selected.lastName}, {selected.firstName}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">National ID</p>
              <p className="font-medium">{selected.nationalId}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Moto License</p>
              <p className="font-medium">{selected.motoLicense}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Gender</p>
              <p className="font-medium">{selected.isWoman ? 'Woman' : 'Man'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Vehicle Type</p>
              <p className="font-medium">{selected.isRetrofit ? 'Retrofit' : 'New E-Moto'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">E-Moto Supplier</p>
              <p className="font-medium">{selected.supplier}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">E-Moto Model</p>
              <p className="font-medium">{selected.model}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Retrofit Assembler</p>
              <p className="font-medium">{selected.retrofitAssembler}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Retail Cost (RWF)</p>
              <p className="font-medium">{formatNumber(selected.retailCost)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Rebate Amount (RWF)</p>
              <p className="font-semibold text-[#023F40]">
                {formatNumber(selected.rebateAmount)} (
                {getRebatePercent({ isWoman: selected.isWoman, isRetrofit: selected.isRetrofit })})
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Phone</p>
              <p className="font-medium">{selected.phone || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
              <p className="font-medium">{selected.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
              <div className="mt-1">{statusBadge(statusFor(selected.ticketNumber))}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-[#023F40]">Existing Documentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between border rounded-lg p-3">
              <span>{DOC_NAMES.notarizedAffidavit}</span>
              <span>{selected.affidavitUploaded ? 'Uploaded' : 'Missing'}</span>
            </div>
            <div className="flex justify-between border rounded-lg p-3">
              <span>{DOC_NAMES.iceEngineDisposal}</span>
              <span>
                {selected.iceAgreementUploaded === null
                  ? 'N/A'
                  : selected.iceAgreementUploaded
                    ? 'Uploaded'
                    : 'Missing'}
              </span>
            </div>
            {selected.supportingDocuments.map((doc) => (
              <div key={doc} className="flex justify-between border rounded-lg p-3">
                <span>{doc}</span>
                <Button size="sm" variant="outline" className="h-7" type="button">
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-[#023F40]">
              {DOC_NAMES.possessionStatement}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const submission = submissions[selected.ticketNumber];
              if (!submission) {
                return (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    The Asset Financier has not yet submitted the E-Moto Possession Statement for this
                    rebate.
                  </p>
                );
              }
              return (
                <>
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{submission.fileName}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded {new Date(submission.uploadedAt).toLocaleString()} by{' '}
                        {submission.submittedBy} · Possession date{' '}
                        {new Date(submission.possessionDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const blob = new Blob([`Demo document preview for ${submission.fileName}`], {
                          type: 'text/plain',
                        });
                        window.open(URL.createObjectURL(blob), '_blank');
                      }}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>
                  </div>

                  {submission.status === 'pending-verification' && (
                    <div className="space-y-3 border-t pt-4">
                      <div>
                        <Label htmlFor="possession-accept-comment">Comment (optional)</Label>
                        <Textarea
                          id="possession-accept-comment"
                          value={acceptComment}
                          onChange={(e) => setAcceptComment(e.target.value)}
                          placeholder="Add an optional comment for the record..."
                          rows={2}
                          className="mt-1.5"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => setShowRejectDialog(true)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        <Button className="bg-[#0a7d4b] hover:bg-[#0c6b42]" onClick={handleAccept}>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  )}

                  {submission.status !== 'pending-verification' && (
                    <div
                      className={`border-t pt-4 text-sm space-y-1 ${
                        submission.status === 'verified' ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      <p className="font-medium">
                        {submission.status === 'verified' ? 'Accepted' : 'Rejected'} by{' '}
                        {submission.reviewedBy} ·{' '}
                        {submission.reviewedAt && new Date(submission.reviewedAt).toLocaleString()}
                      </p>
                      {submission.reviewComment && <p>"{submission.reviewComment}"</p>}
                    </div>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>

        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject E-Moto Possession Statement</DialogTitle>
              <DialogDescription>
                Explain why the statement for {selected.ticketNumber} is being rejected. The Asset Financier
                will see this comment and be asked to resubmit.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="possession-reject-comment">Comment (required)</Label>
              <Textarea
                id="possession-reject-comment"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="e.g. The signature does not match the client's ID, or the document is illegible..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Confirm rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">Analysis of Individual E-Moto Possession</h2>
        <p className="text-sm text-gray-600 mt-1 max-w-4xl">
          This page enables the Rebate Team and QA Team to review E-Moto Possession Statements uploaded by
          Asset Financiers. Accept a statement to make the rebate eligible for disbursement authorization, or
          reject it with a comment so the Asset Financier can resubmit.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card
          role="button"
          tabIndex={0}
          aria-pressed={filterStatus === 'all'}
          onClick={() => applyStatusFilter('all')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              applyStatusFilter('all');
            }
          }}
          className={`cursor-pointer transition-colors hover:border-[#023F40]/50 hover:shadow-md ${
            filterStatus === 'all' ? 'ring-2 ring-[#023F40]/40 border-[#023F40]/50' : ''
          }`}
        >
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total approved rebates tracked</p>
            <p className="text-2xl font-bold text-[#023F40]">{totalCount}</p>
          </CardContent>
        </Card>
        <Card
          role="button"
          tabIndex={0}
          aria-pressed={filterStatus === 'pending-verification'}
          onClick={() => applyStatusFilter('pending-verification')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              applyStatusFilter('pending-verification');
            }
          }}
          className={`cursor-pointer transition-colors hover:border-blue-400 hover:shadow-md ${
            filterStatus === 'pending-verification' ? 'ring-2 ring-blue-300 border-blue-400' : ''
          }`}
        >
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Awaiting your review</p>
            <p className="text-2xl font-bold text-blue-700">{pendingReviewCount}</p>
          </CardContent>
        </Card>
        <Card
          role="button"
          tabIndex={0}
          aria-pressed={filterStatus === 'verified'}
          onClick={() => applyStatusFilter('verified')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              applyStatusFilter('verified');
            }
          }}
          className={`cursor-pointer transition-colors hover:border-[#6DB27F]/60 hover:shadow-md ${
            filterStatus === 'verified' ? 'ring-2 ring-[#6DB27F]/50 border-[#6DB27F]/60' : ''
          }`}
        >
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Confirmed</p>
            <p className="text-2xl font-bold text-[#023F40]">{verifiedCount}</p>
            <p className="text-xs text-gray-500 mt-1">{verifiedShare}% of total</p>
          </CardContent>
        </Card>
        <Card
          role="button"
          tabIndex={0}
          aria-pressed={filterStatus === 'rejected'}
          onClick={() => applyStatusFilter('rejected')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              applyStatusFilter('rejected');
            }
          }}
          className={`cursor-pointer transition-colors hover:border-red-400 hover:shadow-md ${
            filterStatus === 'rejected' ? 'ring-2 ring-red-300 border-red-400' : ''
          }`}
        >
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Rejected</p>
            <p className="text-2xl font-bold text-red-700">{rejectedCount}</p>
          </CardContent>
        </Card>
        <Card
          role="button"
          tabIndex={0}
          aria-pressed={filterStatus === 'awaiting-confirmation'}
          onClick={() => applyStatusFilter('awaiting-confirmation')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              applyStatusFilter('awaiting-confirmation');
            }
          }}
          className={`cursor-pointer transition-colors hover:border-[#023F40]/50 hover:shadow-md ${
            filterStatus === 'awaiting-confirmation' ? 'ring-2 ring-[#023F40]/40 border-[#023F40]/50' : ''
          }`}
        >
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Awaiting AF submission</p>
            <p className="text-2xl font-bold text-[#023F40]">{awaitingCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-1">E-Moto Possession Overview</h3>
            <p className="text-sm text-gray-500">
              Possession confirmation relative to total approved rebates
            </p>
          </div>
          {possessionOverview.length === 0 ? (
            <p className="text-sm text-gray-500 py-10 text-center">No rebates to chart</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart id="possession-overview-pie">
                <Pie
                  data={possessionOverview}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }: { name: string; count: number }) => `${name}: ${count}`}
                  outerRadius={100}
                  dataKey="count"
                  isAnimationActive={false}
                >
                  {possessionOverview.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: any) => [`${value} rebate(s)`, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-1">Possession by Asset Financier</h3>
            <p className="text-sm text-gray-500">Awaiting vs submitted confirmation, by AF</p>
          </div>
          {byAfPossession.length === 0 ? (
            <p className="text-sm text-gray-500 py-10 text-center">No rebates to chart</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={byAfPossession}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                id="possession-af-breakout-bar"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis allowDecimals={false} stroke="#6b7280" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar
                  dataKey="submitted"
                  name="Confirmation submitted"
                  stackId="possession"
                  fill="#6DB27F"
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="awaiting"
                  name="Awaiting confirmation"
                  stackId="possession"
                  fill="#023F40"
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
            {isFiltered && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-gray-600 hover:text-gray-900"
                onClick={clearFilters}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600">{FILTER_LABELS.assetFinancier}</p>
              <Select value={filterAf} onValueChange={setFilterAf}>
                <SelectTrigger className="border-[#023F40]/60">
                  <SelectValue placeholder={FILTER_LABELS.assetFinancier} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{ALL_ASSET_FINANCIERS_LABEL}</SelectItem>
                  {financiers.map((af) => (
                    <SelectItem key={af} value={af}>
                      {af}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600">{FILTER_LABELS.status}</p>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={FILTER_LABELS.status} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{ALL_STATUSES_LABEL}</SelectItem>
                  <SelectItem value="pending-verification">Awaiting your review</SelectItem>
                  <SelectItem value="verified">Confirmed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="awaiting-confirmation">Awaiting AF submission</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600">Search</p>
              <Input
                placeholder="Search ticket, applicant, or submitter..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600">{FILTER_LABELS.gender}</p>
              <Select value={filterGender} onValueChange={setFilterGender}>
                <SelectTrigger>
                  <SelectValue placeholder={FILTER_LABELS.gender} />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_FILTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600">{FILTER_LABELS.vehicleType}</p>
              <Select value={filterVehicleType} onValueChange={setFilterVehicleType}>
                <SelectTrigger>
                  <SelectValue placeholder={FILTER_LABELS.vehicleType} />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPE_FILTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Showing {filtered.length} of {rows.length} approved rebates
            {filterAf !== 'all' ? ` for ${filterAf}` : ''}.
          </p>
        </CardContent>
      </Card>

      <Card id="possession-analysis-table">
        <CardHeader>
          <CardTitle className="text-base text-[#023F40]">Possession Analysis Table</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-600">No rebates match the current filters.</div>
          ) : (
            <table className="w-full min-w-[1600px] text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="pb-2 pr-3 font-medium">Ticket No.</th>
                  <th className="pb-2 pr-3 font-medium">Person who submitted rebate proposal</th>
                  <th className="pb-2 pr-3 font-medium">Last Name(s) / First Name(s)</th>
                  <th className="pb-2 pr-3 font-medium">National ID</th>
                  <th className="pb-2 pr-3 font-medium">Moto license</th>
                  <th className="pb-2 pr-3 font-medium">Gender</th>
                  <th className="pb-2 pr-3 font-medium">Retrofit</th>
                  <th className="pb-2 pr-3 font-medium">Asset Financier</th>
                  <th className="pb-2 pr-3 font-medium">Retail Cost of E-Moto (RWF)</th>
                  <th className="pb-2 pr-3 font-medium">Rebate Amount (RWF)</th>
                  <th className="pb-2 pr-3 font-medium">Rebate Percentage (%)</th>
                  <th className="pb-2 pr-3 font-medium">E-Moto Supplier</th>
                  <th className="pb-2 pr-3 font-medium">E-Moto Model</th>
                  <th className="pb-2 pr-3 font-medium">Retrofit Assembler</th>
                  <th className="pb-2 pr-3 font-medium">Any supporting documents</th>
                  <th className="pb-2 pr-3 font-medium">{DOC_NAMES.notarizedAffidavit}</th>
                  <th className="pb-2 pr-3 font-medium">{DOC_NAMES.iceEngineDisposal}</th>
                  <th className="pb-2 pr-3 font-medium">Status</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.ticketNumber} className="border-b align-top">
                    <td className="py-2 pr-3 font-semibold text-[#023F40]">{r.ticketNumber}</td>
                    <td className="py-2 pr-3">{r.submittedBy}</td>
                    <td className="py-2 pr-3">
                      {r.lastName} / {r.firstName}
                    </td>
                    <td className="py-2 pr-3">{r.nationalId}</td>
                    <td className="py-2 pr-3">{r.motoLicense}</td>
                    <td className="py-2 pr-3">{r.isWoman ? 'Woman' : 'Man'}</td>
                    <td className="py-2 pr-3">{r.isRetrofit ? 'Yes' : 'No'}</td>
                    <td className="py-2 pr-3">{r.assetFinancier}</td>
                    <td className="py-2 pr-3">{formatNumber(r.retailCost)}</td>
                    <td className="py-2 pr-3">{formatNumber(r.rebateAmount)}</td>
                    <td className="py-2 pr-3">
                      {getRebatePercent({ isWoman: r.isWoman, isRetrofit: r.isRetrofit })}
                    </td>
                    <td className="py-2 pr-3">{r.supplier}</td>
                    <td className="py-2 pr-3">{r.model}</td>
                    <td className="py-2 pr-3">{r.retrofitAssembler}</td>
                    <td className="py-2 pr-3">{r.supportingDocuments.length}</td>
                    <td className="py-2 pr-3">{r.affidavitUploaded ? 'Uploaded' : 'Missing'}</td>
                    <td className="py-2 pr-3">
                      {r.iceAgreementUploaded === null
                        ? 'N/A'
                        : r.iceAgreementUploaded
                          ? 'Uploaded'
                          : 'Missing'}
                    </td>
                    <td className="py-2 pr-3">{statusBadge(statusFor(r.ticketNumber))}</td>
                    <td className="py-2">
                      {statusFor(r.ticketNumber) === 'pending-verification' ? (
                        <Button
                          size="sm"
                          className="h-8 bg-[#023F40] hover:bg-[#035f60]"
                          onClick={() => setSelected(r)}
                        >
                          Review
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="h-8" onClick={() => setSelected(r)}>
                          View
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
