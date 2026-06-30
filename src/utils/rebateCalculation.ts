/**
 * Client-side rebate calculation per RGF June 2026 spec.
 * Backend will own authoritative calculation; this drives UI preview only.
 */
export function calculateRebateAmount(
  retailCostRwf: number,
  options: { isWoman: boolean; isRetrofit: boolean }
): number {
  if (!retailCostRwf || retailCostRwf <= 0) return 0;

  let rate = 0.15; // new e-moto
  if (options.isRetrofit) rate = 0.2;
  if (options.isWoman) rate = 0.25;

  return Math.round(retailCostRwf * rate);
}

export function getRebateRateLabel(options: { isWoman: boolean; isRetrofit: boolean }): string {
  if (options.isWoman) return '25% (women applicant)';
  if (options.isRetrofit) return '20% (retrofit)';
  return '15% (new e-moto)';
}

export function generateTicketPreview(): string {
  const seq = Math.floor(Math.random() * 900) + 100;
  return `REB-${seq}`;
}
