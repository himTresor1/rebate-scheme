const STORAGE_KEY = 'rgf-possession-statements';
export const POSSESSION_CHANGED_EVENT = 'rgf-possession-changed';

export type PossessionStatementStatus = 'pending-verification' | 'verified' | 'rejected';

export interface PossessionStatementRecord {
  ticketNumber: string;
  applicantName: string;
  submittedBy: string;
  fileName: string;
  possessionDate: string;
  uploadedAt: string;
  status: PossessionStatementStatus;
  reviewComment?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

function loadAll(): Record<string, PossessionStatementRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveAll(records: Record<string, PossessionStatementRecord>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(POSSESSION_CHANGED_EVENT));
}

export function getPossessionRecords(): Record<string, PossessionStatementRecord> {
  return loadAll();
}

export function getPossessionRecord(ticketNumber: string): PossessionStatementRecord | undefined {
  return loadAll()[ticketNumber];
}

export function submitPossessionStatement(input: {
  ticketNumber: string;
  applicantName: string;
  submittedBy: string;
  fileName: string;
  possessionDate: string;
}) {
  const records = loadAll();
  records[input.ticketNumber] = {
    ticketNumber: input.ticketNumber,
    applicantName: input.applicantName,
    submittedBy: input.submittedBy,
    fileName: input.fileName,
    possessionDate: input.possessionDate,
    uploadedAt: new Date().toISOString(),
    status: 'pending-verification',
    reviewComment: undefined,
    reviewedBy: undefined,
    reviewedAt: undefined,
  };
  saveAll(records);
}

export function resolvePossessionStatement(
  ticketNumber: string,
  decision: 'verified' | 'rejected',
  comment: string,
  reviewedBy: string
) {
  const records = loadAll();
  const existing = records[ticketNumber];
  if (!existing) return;
  records[ticketNumber] = {
    ...existing,
    status: decision,
    reviewComment: comment || undefined,
    reviewedBy,
    reviewedAt: new Date().toISOString(),
  };
  saveAll(records);
}
