/** Shared filter labels and options — keep terminology consistent across all roles/pages. */

export const FILTER_LABELS = {
  vehicleType: 'Vehicle Type',
  gender: 'Gender',
  assetFinancier: 'Asset Financier',
  eMotoProvider: 'E-Moto Provider',
  retrofitAssembler: 'Retrofit Assembler',
  dateRange: 'Date Range',
  status: 'Status',
} as const;

export const GENDER_FILTER_OPTIONS = [
  { value: 'all', label: 'All genders' },
  { value: 'woman', label: 'Woman' },
  { value: 'man', label: 'Man' },
] as const;

export const VEHICLE_TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'All vehicle types' },
  { value: 'new', label: 'New E-Moto' },
  { value: 'retrofit', label: 'Retrofit' },
] as const;

export const DATE_RANGE_FILTER_OPTIONS = [
  { value: 'all', label: 'All dates' },
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'year', label: 'Last 12 months' },
] as const;

export const ALL_ASSET_FINANCIERS_LABEL = 'All Asset Financiers';
export const ALL_EMOTO_PROVIDERS_LABEL = 'All E-Moto Providers';
export const ALL_RETROFIT_ASSEMBLERS_LABEL = 'All Retrofit Assemblers';
export const ALL_STATUSES_LABEL = 'All statuses';

/** Gender filter: Woman / Man (also accepts legacy yes/no). */
export function matchesGenderFilter(isWoman: boolean, filter: string): boolean {
  if (!filter || filter === 'all') return true;
  if (filter === 'woman' || filter === 'yes') return isWoman;
  if (filter === 'man' || filter === 'no') return !isWoman;
  return true;
}

/** Vehicle Type filter: New E-Moto / Retrofit (also accepts legacy yes/no). */
export function matchesVehicleTypeFilter(isRetrofit: boolean, filter: string): boolean {
  if (!filter || filter === 'all') return true;
  if (filter === 'retrofit' || filter === 'yes') return isRetrofit;
  if (filter === 'new' || filter === 'no') return !isRetrofit;
  return true;
}
