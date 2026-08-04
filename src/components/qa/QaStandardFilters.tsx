import { Filter, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DateInput } from '../ui/date-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  ALL_ASSET_FINANCIERS_LABEL,
  ALL_EMOTO_PROVIDERS_LABEL,
  ALL_RETROFIT_ASSEMBLERS_LABEL,
  ALL_STATUSES_LABEL,
  FILTER_LABELS,
  GENDER_FILTER_OPTIONS,
  VEHICLE_TYPE_FILTER_OPTIONS,
} from '../../utils/filterLabels';

/** QA perspective Status options (All Rebates / Decisions / CFO disbursement). */
export const QA_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: ALL_STATUSES_LABEL },
  { value: 'submitted', label: 'Submitted' },
  { value: 'in-process', label: 'In Process' },
  { value: 'no-possession', label: 'Approved but no e-moto possession' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'disbursed', label: 'Disbursed' },
] as const;

export const QA_SORT_FILTER_OPTIONS = [
  { value: 'date-oldest', label: 'AF submission date (Oldest first)' },
  { value: 'amount-high', label: 'Rebate Amount (Highest first)' },
] as const;

export type QaStatusFilterValue = (typeof QA_STATUS_FILTER_OPTIONS)[number]['value'];
export type QaSortFilterValue = (typeof QA_SORT_FILTER_OPTIONS)[number]['value'];

export interface QaStandardFiltersValues {
  query: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  gender: string;
  vehicleType: string;
  assetFinancier: string;
  eMotoProvider: string;
  retrofitAssembler: string;
  sortBy: string;
}

export const QA_DEFAULT_FILTER_VALUES: QaStandardFiltersValues = {
  query: '',
  status: 'all',
  dateFrom: '',
  dateTo: '',
  gender: 'all',
  vehicleType: 'all',
  assetFinancier: 'all',
  eMotoProvider: 'all',
  retrofitAssembler: 'all',
  sortBy: 'date-oldest',
};

export interface QaStandardFiltersProps {
  values: QaStandardFiltersValues;
  onChange: (patch: Partial<QaStandardFiltersValues>) => void;
  financiers: string[];
  providers: string[];
  assemblers: string[];
  showingCount: number;
  totalCount: number;
  showingLabel?: string;
  showStatus?: boolean;
  showSort?: boolean;
}

export function QaStandardFilters({
  values,
  onChange,
  financiers,
  providers,
  assemblers,
  showingCount,
  totalCount,
  showingLabel = 'rebates submitted to RGF',
  showStatus = true,
  showSort = true,
}: QaStandardFiltersProps) {
  const isFiltered = Object.entries(values).some(
    ([key, value]) => value !== QA_DEFAULT_FILTER_VALUES[key as keyof QaStandardFiltersValues]
  );

  return (
    <Card className="mt-6 mb-6 print:hidden">
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
              onClick={() => onChange(QA_DEFAULT_FILTER_VALUES)}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <Input
            placeholder="Search ticket/applicant..."
            value={values.query}
            onChange={(e) => onChange({ query: e.target.value })}
          />
          {showStatus ? (
            <Select value={values.status} onValueChange={(status) => onChange({ status })}>
              <SelectTrigger>
                <SelectValue placeholder={FILTER_LABELS.status} />
              </SelectTrigger>
              <SelectContent>
                {QA_STATUS_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          <div className="grid grid-cols-2 gap-2">
            <DateInput
              value={values.dateFrom}
              onChange={(dateFrom) => onChange({ dateFrom })}
              placeholder="From DD/MM/YYYY"
            />
            <DateInput
              value={values.dateTo}
              onChange={(dateTo) => onChange({ dateTo })}
              placeholder="To DD/MM/YYYY"
            />
          </div>
          <Select value={values.gender} onValueChange={(gender) => onChange({ gender })}>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <Select
            value={values.assetFinancier}
            onValueChange={(assetFinancier) => onChange({ assetFinancier })}
          >
            <SelectTrigger>
              <SelectValue placeholder={FILTER_LABELS.assetFinancier} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{ALL_ASSET_FINANCIERS_LABEL}</SelectItem>
              {financiers.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={values.eMotoProvider} onValueChange={(eMotoProvider) => onChange({ eMotoProvider })}>
            <SelectTrigger>
              <SelectValue placeholder={FILTER_LABELS.eMotoProvider} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{ALL_EMOTO_PROVIDERS_LABEL}</SelectItem>
              {providers.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={values.retrofitAssembler}
            onValueChange={(retrofitAssembler) => onChange({ retrofitAssembler })}
          >
            <SelectTrigger>
              <SelectValue placeholder={FILTER_LABELS.retrofitAssembler} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{ALL_RETROFIT_ASSEMBLERS_LABEL}</SelectItem>
              {assemblers.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showSort ? (
            <Select value={values.sortBy} onValueChange={(sortBy) => onChange({ sortBy })}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                {QA_SORT_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="w-full sm:w-56">
            <Select value={values.vehicleType} onValueChange={(vehicleType) => onChange({ vehicleType })}>
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
          <p className="text-xs text-gray-500">
            Showing {showingCount} of {totalCount} {showingLabel}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
