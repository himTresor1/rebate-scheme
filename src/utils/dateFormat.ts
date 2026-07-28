const DISPLAY_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

/** Format any date value for display as DD/MM/YYYY. */
export function formatDisplayDate(value?: string | Date | null): string {
  if (value == null || value === '') return '—';

  if (typeof value === 'string') {
    const iso = value.match(ISO_DATE_PATTERN);
    if (iso && !value.includes('T')) {
      return `${iso[3]}/${iso[2]}/${iso[1]}`;
    }
    if (DISPLAY_DATE_PATTERN.test(value.trim())) {
      return value.trim();
    }
  }

  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Format a datetime for display as DD/MM/YYYY, HH:mm. */
export function formatDisplayDateTime(value?: string | Date | null): string {
  if (value == null || value === '') return '—';

  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  const date = formatDisplayDate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${date}, ${hours}:${minutes}`;
}

/** Convert DD/MM/YYYY to ISO yyyy-mm-dd for internal storage. Returns null if invalid. */
export function parseDisplayDateInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const match = trimmed.match(DISPLAY_DATE_PATTERN);
  if (!match) return null;

  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const d = new Date(year, month - 1, day);

  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return null;
  }

  return `${yyyy}-${mm}-${dd}`;
}

/** Convert ISO yyyy-mm-dd to DD/MM/YYYY for date inputs. */
export function formatIsoToDisplayInput(iso: string): string {
  if (!iso) return '';
  const formatted = formatDisplayDate(iso);
  return formatted === '—' ? '' : formatted;
}
