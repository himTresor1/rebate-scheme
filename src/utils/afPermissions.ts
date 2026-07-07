export type AfPermissionLevel = 'rgf-submit' | 'internal-proposal';

export interface AfPermissionEntry {
  id: string;
  name: string;
  email: string;
  level: AfPermissionLevel;
}

const STORAGE_KEY = 'rgf-af-permissions';

const DEFAULT_ENTRIES: AfPermissionEntry[] = [
  { id: '1', name: 'Grace Mukandori', email: 'admin@bankofkigali.rw', level: 'rgf-submit' },
  { id: '2', name: 'Kevin Agent', email: 'agent1@bankofkigali.rw', level: 'internal-proposal' },
];

export function loadAfPermissions(): AfPermissionEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ENTRIES;
    const parsed = JSON.parse(raw) as AfPermissionEntry[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ENTRIES;
  } catch {
    return DEFAULT_ENTRIES;
  }
}

export function saveAfPermissions(entries: AfPermissionEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getAfPermissionLevel(email: string): AfPermissionLevel {
  const entry = loadAfPermissions().find(
    (e) => e.email.toLowerCase() === email.toLowerCase()
  );
  return entry?.level ?? 'rgf-submit';
}
