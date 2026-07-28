import { User } from './auth';

export type NotificationType =
  | 'success'
  | 'warning'
  | 'info'
  | 'error'
  | 'payment'
  | 'application'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable?: boolean;
  actionLabel?: string;
  actionUrl?: string;
  actionData?: unknown;
}

export const NOTIFICATIONS_CHANGED_EVENT = 'rgf-notifications-changed';

type StoredNotifState = {
  readIds: string[];
  deletedIds: string[];
};

function storageKey(user: User): string {
  return `rgf-notif-state:${user.id || user.email || user.role}`;
}

function loadState(user: User): StoredNotifState {
  try {
    const raw = localStorage.getItem(storageKey(user));
    if (!raw) return { readIds: [], deletedIds: [] };
    const parsed = JSON.parse(raw) as Partial<StoredNotifState>;
    return {
      readIds: Array.isArray(parsed.readIds) ? parsed.readIds : [],
      deletedIds: Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [],
    };
  } catch {
    return { readIds: [], deletedIds: [] };
  }
}

function saveState(user: User, state: StoredNotifState) {
  localStorage.setItem(storageKey(user), JSON.stringify(state));
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

function buildMockNotifications(role: string): AppNotification[] {
  const mins = (n: number) => new Date(Date.now() - n * 60 * 1000).toISOString();
  const hrs = (n: number) => new Date(Date.now() - n * 60 * 60 * 1000).toISOString();
  const days = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
  const baseNotifications: AppNotification[] = [];

  if (role === 'SYSTEM_ADMIN' || role === 'admin') {
    baseNotifications.push(
      {
        id: 'sa-1',
        type: 'warning',
        title: 'New Asset Financier pending approval',
        message:
          'Bank of Kigali has submitted a registration request and is awaiting your review.',
        timestamp: hrs(2),
        read: false,
        actionable: true,
        actionLabel: 'Review registration',
        actionUrl: '/admin/pending-registrations',
      },
      {
        id: 'sa-2',
        type: 'system',
        title: 'New internal users invited',
        message:
          'Bank of Kigali added a Marketing Agent and an AF Finance Decision-Maker to their organization.',
        timestamp: hrs(6),
        read: false,
      },
      {
        id: 'sa-3',
        type: 'info',
        title: 'Weekly QA report generated',
        message:
          'The weekly rebate disbursement report for CFO signature is ready in the QA workspace.',
        timestamp: days(1),
        read: true,
      }
    );
  }

  if (role === 'REBATE_ANALYST' || role === 'analyst') {
    baseNotifications.push(
      {
        id: 'an-1',
        type: 'application',
        title: 'New rebates received for review',
        message:
          '5 new rebate submissions have arrived from Asset Financiers and are waiting in your review pipeline.',
        timestamp: mins(30),
        read: false,
        actionable: true,
        actionLabel: 'Open review pipeline',
        actionUrl: '/rebate-review',
      },
      {
        id: 'an-2',
        type: 'warning',
        title: 'Over 2 days since received',
        message:
          'Ticket REB-002 has been awaiting review for more than 2 days. Please prioritise it.',
        timestamp: hrs(3),
        read: false,
        actionable: true,
        actionLabel: 'Review REB-002',
        actionUrl: '/rebate-review',
      },
      {
        id: 'an-3',
        type: 'success',
        title: 'QA accepted your recommendations',
        message: 'The QA team approved the recommendations you submitted last week.',
        timestamp: hrs(20),
        read: false,
      },
      {
        id: 'an-4',
        type: 'info',
        title: 'Reassignment request to check',
        message: 'A client transfer / reassignment for REB-014 needs your verification.',
        timestamp: days(1),
        read: true,
        actionable: true,
        actionLabel: 'Open reassignment checking',
        actionUrl: '/reassignment-checking',
      }
    );
  }

  if (role === 'REBATE_MANAGER') {
    baseNotifications.push(
      {
        id: 'qa-1',
        type: 'application',
        title: 'Recommendations submitted for QA',
        message:
          'The Rebate Team submitted 8 analyst recommendations for your weekly QA decision.',
        timestamp: hrs(1),
        read: false,
        actionable: true,
        actionLabel: 'Open QA review',
        actionUrl: '/qa-review',
      },
      {
        id: 'qa-2',
        type: 'warning',
        title: 'Rebates awaiting QA decision',
        message:
          '12 rebates are pending QA approval this week. Submit your decisions before the weekly cut-off.',
        timestamp: hrs(4),
        read: false,
        actionable: true,
        actionLabel: 'Review & decide',
        actionUrl: '/qa-review',
      },
      {
        id: 'qa-3',
        type: 'info',
        title: 'Weekly report ready for CFO',
        message:
          "This week's approved-rebate report is ready to download and send to the CFO for signature.",
        timestamp: hrs(8),
        read: false,
        actionable: true,
        actionLabel: 'Open weekly report',
        actionUrl: '/weekly-report',
      }
    );
  }

  if (role === 'E_MOTO_PROGRAM_MANAGER') {
    baseNotifications.push(
      {
        id: 'cfo-1',
        type: 'payment',
        title: 'Rebates awaiting your authorization',
        message:
          '3 QA-approved rebates with confirmed e-moto possession are awaiting your disbursement authorization (10-day SLA).',
        timestamp: mins(45),
        read: false,
        actionable: true,
        actionLabel: 'Authorize disbursements',
        actionUrl: '/authorizations',
      },
      {
        id: 'cfo-2',
        type: 'info',
        title: 'E-moto possession confirmed',
        message:
          'E-moto possession has been confirmed for REB-001 — the rebate is now eligible for disbursement authorization.',
        timestamp: hrs(2),
        read: false,
      },
      {
        id: 'cfo-3',
        type: 'warning',
        title: 'AF top-up request pending',
        message:
          'Bank of Kigali has requested a top-up of their advance rebate funds. Your decision is required.',
        timestamp: hrs(6),
        read: true,
        actionable: true,
        actionLabel: 'Review request',
        actionUrl: '/top-up-requests',
      }
    );
  }

  if (role === 'DESIGNATED_FINANCE_OFFICER') {
    baseNotifications.push(
      {
        id: 'fo-1',
        type: 'application',
        title: 'AF bank statement uploaded',
        message:
          'Bank of Kigali uploaded a new bank statement for reconciliation against system rebate records.',
        timestamp: mins(25),
        read: false,
        actionable: true,
        actionLabel: 'Open verification',
        actionUrl: '/verification-checking',
      },
      {
        id: 'fo-2',
        type: 'warning',
        title: 'Disbursement mismatch flagged',
        message:
          'The disbursement reported by the bank for REB-002 does not match the system amount. Please investigate.',
        timestamp: hrs(3),
        read: false,
        actionable: true,
        actionLabel: 'Review lease tracking',
        actionUrl: '/verification-checking',
      },
      {
        id: 'fo-3',
        type: 'payment',
        title: 'Top-up request to track',
        message:
          'A new top-up request from an Asset Financier is pending CFO decision — track it in the tracker.',
        timestamp: hrs(9),
        read: false,
        actionable: true,
        actionLabel: 'Open top-up tracker',
        actionUrl: '/top-up-requests',
      },
      {
        id: 'fo-4',
        type: 'success',
        title: 'Advance funds wired',
        message:
          'RWF 20,000,000 advance rebate funds were wired to Bank of Kigali and recorded.',
        timestamp: days(1),
        read: true,
      }
    );
  }

  if (
    role === 'ASSET_FINANCIER_ADMIN' ||
    role === 'ASSET_FINANCIER_OFFICER' ||
    role === 'CLAIMS_OFFICER' ||
    role === 'applicant'
  ) {
    baseNotifications.push(
      {
        id: 'af-1',
        type: 'application',
        title: 'New rebate proposal from marketing person',
        message:
          'Kevin Agent submitted rebate proposal REB-002 for your review and submission to RGF.',
        timestamp: mins(15),
        read: false,
        actionable: true,
        actionLabel: 'Review & submit to RGF',
        actionUrl: '/rebate-status',
      },
      {
        id: 'af-2',
        type: 'success',
        title: 'Rebate approved by RGF',
        message:
          'RGF Rebate Team approved REB-001. Confirm e-moto possession before drawing rebate funds from your escrow account.',
        timestamp: hrs(2),
        read: false,
        actionable: true,
        actionLabel: 'Confirm possession',
        actionUrl: '/possession',
      },
      {
        id: 'af-3',
        type: 'error',
        title: 'Rebate rejected by QA',
        message:
          'REB-007 was rejected by the QA team. Open the rebate to view the reason and follow-up actions.',
        timestamp: hrs(5),
        read: false,
        actionable: true,
        actionLabel: 'View reason',
        actionUrl: '/rebate-status',
      },
      {
        id: 'af-4',
        type: 'payment',
        title: 'Rebate disbursement authorized',
        message:
          'The CFO authorized disbursement for REB-005. You may deduct the rebate from your Rebate Bank Account.',
        timestamp: days(1),
        read: false,
      },
      {
        id: 'af-5',
        type: 'warning',
        title: 'Possession confirmation reminder',
        message:
          'REB-001 still needs the AF and Client E-Moto Possession Statement before funds can be withdrawn.',
        timestamp: days(2),
        read: true,
        actionable: true,
        actionLabel: 'Upload confirmation',
        actionUrl: '/possession',
      }
    );
  }

  if (role === 'ASSET_FINANCIER_STAFF') {
    baseNotifications.push(
      {
        id: 'ma-1',
        type: 'success',
        title: 'Proposal submitted to RGF',
        message:
          'Your rebate proposal REB-002 was reviewed and submitted to RGF by your AF finance Rebate Team.',
        timestamp: mins(20),
        read: false,
      },
      {
        id: 'ma-2',
        type: 'warning',
        title: 'Proposal needs more documents',
        message:
          'Your rebate proposal REB-011 is missing a Signed Financing Agreement. Please add it and resubmit for review.',
        timestamp: hrs(4),
        read: false,
        actionable: true,
        actionLabel: 'Open proposal',
        actionUrl: '/rebate-status',
      },
      {
        id: 'ma-3',
        type: 'info',
        title: 'Keep developing proposals',
        message: 'You can submit new rebate proposals at any time from the Submit Rebate page.',
        timestamp: days(1),
        read: true,
      }
    );
  }

  if (role === 'EXTERNAL_REVIEWER' || role === 'ME_TEAM') {
    baseNotifications.push(
      {
        id: 'ext-1',
        type: 'info',
        title: 'Read-only access granted',
        message:
          'You have read-only access to rebate records and disbursements for the current reporting period.',
        timestamp: hrs(2),
        read: false,
      },
      {
        id: 'ext-2',
        type: 'application',
        title: 'New disbursed rebates available',
        message: 'Newly disbursed rebates are available for your review and reporting.',
        timestamp: days(1),
        read: false,
        actionable: true,
        actionLabel: 'View rebates',
        actionUrl: '/rebates',
      }
    );
  }

  baseNotifications.push({
    id: 'common-welcome',
    type: 'system',
    title: 'Welcome to the RGF Rebate System',
    message: 'Your account is ready. Use the menu to navigate your rebate workflow.',
    timestamp: days(7),
    read: true,
  });

  return baseNotifications.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getNotificationsForUser(user: User): AppNotification[] {
  const state = loadState(user);
  return buildMockNotifications(user.role)
    .filter((n) => !state.deletedIds.includes(n.id))
    .map((n) => ({
      ...n,
      read: n.read || state.readIds.includes(n.id),
    }));
}

export function getUnreadNotificationCount(user: User): number {
  return getNotificationsForUser(user).filter((n) => !n.read).length;
}

export function markNotificationRead(user: User, notifId: string) {
  const state = loadState(user);
  if (!state.readIds.includes(notifId)) {
    state.readIds = [...state.readIds, notifId];
    saveState(user, state);
  }
}

export function markAllNotificationsRead(user: User) {
  const state = loadState(user);
  const ids = getNotificationsForUser(user).map((n) => n.id);
  state.readIds = Array.from(new Set([...state.readIds, ...ids]));
  saveState(user, state);
}

export function deleteUserNotification(user: User, notifId: string) {
  const state = loadState(user);
  if (!state.deletedIds.includes(notifId)) {
    state.deletedIds = [...state.deletedIds, notifId];
    saveState(user, state);
  }
}
