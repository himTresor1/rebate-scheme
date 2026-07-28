/** Format a number with thousand separators (e.g. 3,500,000). */
export function formatNumber(value?: number | string | null): string {
  if (value === undefined || value === null || value === '') return '—';
  const n = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  if (Number.isNaN(n)) return '—';
  return Math.round(n).toLocaleString('en-US');
}

/** Format a RWF amount with commas and optional suffix. */
export function formatRwfAmount(value?: number | string | null, withSuffix = false): string {
  const formatted = formatNumber(value);
  if (formatted === '—') return formatted;
  return withSuffix ? `${formatted} RWF` : formatted;
}
