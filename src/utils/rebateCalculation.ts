/**
 * Client-side rebate calculation per RGF June 2026 spec.
 * Backend will own authoritative calculation; this drives UI preview only.
 */
export function calculateRebateAmount(
  retailCostRwf: number,
  options: { isWoman: boolean; isRetrofit: boolean }
): number {
  if (!retailCostRwf || retailCostRwf <= 0) return 0;

  let rate = 0.18; // new e-moto (men)
  if (options.isRetrofit) rate = 0.2;
  if (options.isWoman) rate = 0.25;

  return Math.round(retailCostRwf * rate);
}

export function getRebateRateLabel(options: { isWoman: boolean; isRetrofit: boolean }): string {
  if (options.isWoman) return '25% (women applicant)';
  if (options.isRetrofit) return '20% (retrofit)';
  return '18% (new e-moto)';
}

/** Short rebate percentage for tables and detail views (e.g. "18%"). */
export function getRebatePercent(options: { isWoman: boolean; isRetrofit: boolean }): string {
  if (options.isWoman) return '25%';
  if (options.isRetrofit) return '20%';
  return '18%';
}

export function getRebateEligibilityLabel(options: { isWoman: boolean; isRetrofit: boolean }): string {
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

export function generateTicketPreview(): string {
  const seq = Math.floor(Math.random() * 900) + 100;
  return `REB-${seq}`;
}
