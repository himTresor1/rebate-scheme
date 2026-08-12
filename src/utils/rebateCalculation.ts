/**
 * Client-side rebate calculation per RGF June 2026 spec.
 * Backend will own authoritative calculation; this drives UI preview only.
 */
import { formatNumber } from './numberFormat';

export type RebateRateOptions = { isWoman: boolean; isRetrofit: boolean };

export function calculateRebateAmount(
  retailCostRwf: number,
  options: RebateRateOptions
): number {
  if (!retailCostRwf || retailCostRwf <= 0) return 0;

  let rate = 0.18; // new e-moto (men)
  if (options.isRetrofit) rate = 0.2;
  if (options.isWoman) rate = 0.25;

  return Math.round(retailCostRwf * rate);
}

export function getRebateRateLabel(options: RebateRateOptions): string {
  if (options.isWoman) return '25% (women applicant)';
  if (options.isRetrofit) return '20% (retrofit)';
  return '18% (new e-moto)';
}

/** Short rebate percentage for tables and detail views (e.g. "18%"). */
export function getRebatePercent(options: RebateRateOptions): string {
  if (options.isWoman) return '25%';
  if (options.isRetrofit) return '20%';
  return '18%';
}

/** Amount with percent beside it — e.g. "150,000 (18%)". */
export function formatRebateAmountWithPercent(
  amount: number | string | null | undefined,
  options: RebateRateOptions
): string {
  return `${formatNumber(amount)} (${getRebatePercent(options)})`;
}

/** Derive rate inputs from common application / record shapes. */
export function rebateOptionsFromRecord(record: {
  isWoman?: boolean;
  isRetrofit?: boolean;
  woman?: boolean;
  retrofit?: boolean;
  gender?: string;
  vehicleType?: string;
  eligibilityCheck?: { nationalIdCheck?: { gender?: string } };
}): RebateRateOptions {
  const gender = record.gender || record.eligibilityCheck?.nationalIdCheck?.gender || '';
  const isWoman =
    record.isWoman === true ||
    record.woman === true ||
    gender === 'Female' ||
    gender === 'Woman' ||
    gender === 'W';
  const isRetrofit =
    record.isRetrofit === true ||
    record.retrofit === true ||
    record.vehicleType === 'Retrofit';
  return { isWoman, isRetrofit };
}

export function getRebateEligibilityLabel(options: RebateRateOptions): string {
  let percent = '18%';
  if (options.isWoman) percent = '25%';
  else if (options.isRetrofit) percent = '20%';

  const category = options.isWoman
    ? options.isRetrofit
      ? 'women retrofitting their ICE-moto'
      : 'women acquiring a new e-moto'
    : options.isRetrofit
      ? 'men retrofitting their ICE-moto'
      : 'men acquiring a new e-moto';

  const priceBasis = options.isRetrofit ? 'Retrofit Price' : 'Retail E-Moto Price';

  return `Rebate percent for ${category}: ${percent} of ${priceBasis}`;
}

/** Standardizes any stored gender representation (Male/Female, M/W, etc.) to the display label "Man"/"Woman". */
export function formatGenderLabel(gender?: string): string {
  if (!gender) return '—';
  const normalized = gender.trim().toLowerCase();
  if (['female', 'woman', 'w', 'f'].includes(normalized)) return 'Woman';
  if (['male', 'man', 'm'].includes(normalized)) return 'Man';
  return gender;
}

export function generateTicketPreview(): string {
  const seq = Math.floor(Math.random() * 900) + 100;
  return `REB-${seq}`;
}
