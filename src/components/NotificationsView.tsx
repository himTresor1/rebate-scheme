import { useState } from 'react';
import { User } from '../utils/auth';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  FileText, 
  DollarSign, 
  Clock, 
  XCircle,
  Check,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface NotificationsViewProps {
  user: User;
  onAction?: (data: any) => void;
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error' | 'payment' | 'application' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable?: boolean;
  actionLabel?: string;
  actionUrl?: string;
  actionData?: any;
}

export function NotificationsView({ user, onAction }: NotificationsViewProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Generate role-specific mock notifications aligned to the current rebate workflow
  const getMockNotifications = (): Notification[] => {
    const mins = (n: number) => new Date(Date.now() - n * 60 * 1000).toISOString();
    const hrs = (n: number) => new Date(Date.now() - n * 60 * 60 * 1000).toISOString();
    const days = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
    const baseNotifications: Notification[] = [];

    // System Admin
    if (user.role === 'SYSTEM_ADMIN' || user.role === 'admin') {
      baseNotifications.push(
        {
          id: 'sa-1',
          type: 'warning',
          title: 'New Asset Financier pending approval',
          message: 'Bank of Kigali has submitted a registration request and is awaiting your review.',
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
          message: 'Bank of Kigali added a Marketing Agent and an AF Finance Staff user to their organization.',
          timestamp: hrs(6),
          read: false,
        },
        {
          id: 'sa-3',
          type: 'info',
          title: 'Weekly QA report generated',
          message: 'The weekly rebate disbursement report for CFO signature is ready in the QA workspace.',
          timestamp: days(1),
          read: true,
        },
      );
    }

    // RGF Rebate Team (Analyst)
    if (user.role === 'REBATE_ANALYST' || user.role === 'analyst') {
      baseNotifications.push(
        {
          id: 'an-1',
          type: 'application',
          title: 'New rebates received for review',
          message: '5 new rebate submissions have arrived from Asset Financiers and are waiting in your review pipeline.',
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
          message: 'Ticket REB-002 has been awaiting review for more than 2 days. Please prioritise it.',
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
        },
      );
    }

    // QA Team (Rebate Manager)
    if (user.role === 'REBATE_MANAGER') {
      baseNotifications.push(
        {
          id: 'qa-1',
          type: 'application',
          title: 'Recommendations submitted for QA',
          message: 'The Rebate Team submitted 8 analyst recommendations for your weekly QA decision.',
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
          message: '12 rebates are pending QA approval this week. Submit your decisions before the weekly cut-off.',
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
          message: 'This week’s approved-rebate report is ready to download and send to the CFO for signature.',
          timestamp: hrs(8),
          read: false,
          actionable: true,
          actionLabel: 'Open weekly report',
          actionUrl: '/weekly-report',
        },
      );
    }

    // CFO / E-Moto Program Manager
    if (user.role === 'E_MOTO_PROGRAM_MANAGER') {
      baseNotifications.push(
        {
          id: 'cfo-1',
          type: 'payment',
          title: 'Rebates awaiting your authorization',
          message: '3 QA-approved rebates with confirmed e-moto possession are awaiting your disbursement authorization (10-day SLA).',
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
          message: 'E-moto possession has been confirmed for REB-001 — the rebate is now eligible for disbursement authorization.',
          timestamp: hrs(2),
          read: false,
        },
        {
          id: 'cfo-3',
          type: 'warning',
          title: 'AF top-up request pending',
          message: 'Bank of Kigali has requested a top-up of their advance rebate funds. Your decision is required.',
          timestamp: hrs(6),
          read: true,
          actionable: true,
          actionLabel: 'Review request',
          actionUrl: '/top-up-requests',
        },
      );
    }

    // RGF Finance Officer
    if (user.role === 'DESIGNATED_FINANCE_OFFICER') {
      baseNotifications.push(
        {
          id: 'fo-1',
          type: 'application',
          title: 'AF bank statement uploaded',
          message: 'Bank of Kigali uploaded a new bank statement for reconciliation against system rebate records.',
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
          message: 'The disbursement reported by the bank for REB-002 does not match the system amount. Please investigate.',
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
          message: 'A new top-up request from an Asset Financier is pending CFO decision — track it in the tracker.',
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
          message: 'RWF 20,000,000 advance rebate funds were wired to Bank of Kigali and recorded.',
          timestamp: days(1),
          read: true,
        },
      );
    }

    // Asset Financier Admin + AF Finance Staff (decision takers who submit to RGF)
    if (
      user.role === 'ASSET_FINANCIER_ADMIN' ||
      user.role === 'ASSET_FINANCIER_OFFICER' ||
      user.role === 'CLAIMS_OFFICER'
    ) {
      baseNotifications.push(
        {
          id: 'af-1',
          type: 'application',
          title: 'New rebate proposal from marketing agent',
          message: 'Kevin Agent submitted rebate proposal REB-002 for your review and submission to RGF.',
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
          message: 'RGF Rebate Team approved REB-001. Confirm e-moto possession before drawing rebate funds from your escrow account.',
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
          message: 'REB-007 was rejected by the QA team. Open the rebate to view the reason and follow-up actions.',
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
          message: 'The CFO authorized disbursement for REB-005. You may deduct the rebate from your Rebate Bank Account.',
          timestamp: days(1),
          read: false,
        },
        {
          id: 'af-5',
          type: 'warning',
          title: 'Possession confirmation reminder',
          message: 'REB-001 still needs the signed AF/Client E-Moto Possession Confirmation before funds can be withdrawn.',
          timestamp: days(2),
          read: true,
          actionable: true,
          actionLabel: 'Upload confirmation',
          actionUrl: '/possession',
        },
      );
    }

    // Marketing Agent
    if (user.role === 'ASSET_FINANCIER_STAFF') {
      baseNotifications.push(
        {
          id: 'ma-1',
          type: 'success',
          title: 'Proposal submitted to RGF',
          message: 'Your rebate proposal REB-002 was reviewed and submitted to RGF by your AF finance staff.',
          timestamp: mins(20),
          read: false,
        },
        {
          id: 'ma-2',
          type: 'warning',
          title: 'Proposal needs more documents',
          message: 'Your rebate proposal REB-011 is missing a signed financing agreement. Please add it and resubmit for review.',
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
        },
      );
    }

    // External Reviewer / M&E
    if (user.role === 'EXTERNAL_REVIEWER' || user.role === 'ME_TEAM') {
      baseNotifications.push(
        {
          id: 'ext-1',
          type: 'info',
          title: 'Read-only access granted',
          message: 'You have read-only access to rebate records and disbursements for the current reporting period.',
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
        },
      );
    }

    // Common
    baseNotifications.push({
      id: 'common-welcome',
      type: 'system',
      title: 'Welcome to the RGF Rebate System',
      message: 'Your account is ready. Use the menu to navigate your rebate workflow.',
      timestamp: days(7),
      read: true,
    });

    return baseNotifications.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const [notifications, setNotifications] = useState<Notification[]>(getMockNotifications());

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'payment':
        return <DollarSign className="w-5 h-5 text-blue-600" />;
      case 'application':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'system':
        return <Bell className="w-5 h-5 text-gray-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = (notifId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    );
    toast.success('Marked as read');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (notifId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    toast.success('Notification deleted');
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#023F40]">Notifications</h2>
          <p className="text-gray-600 mt-1">
            Stay updated with important system alerts and actions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-[#023F40] border-[#023F40]">
            {unreadCount} Unread
          </Badge>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="text-[#023F40] hover:bg-[#023F40]/10"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-2">
        <Button
          variant={filter === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-[#023F40] hover:bg-[#035f60]' : ''}
        >
          All Notifications
          <Badge variant="secondary" className="ml-2">
            {notifications.length}
          </Badge>
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('unread')}
          className={filter === 'unread' ? 'bg-[#023F40] hover:bg-[#035f60]' : ''}
        >
          Unread
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-red-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
              </h3>
              <p className="text-gray-600">
                {filter === 'unread' 
                  ? 'All caught up! Check back later for updates.'
                  : 'You don\'t have any notifications yet.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className="border border-gray-200 bg-white transition-all hover:shadow-md"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-[#023F40]" title="Unread" />
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm mb-3 ${!notification.read ? 'text-gray-700' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(notification.timestamp)}
                      </div>

                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs h-7"
                          >
                            Mark as read
                          </Button>
                        )}
                        {notification.actionable && (
                          <Button
                            size="sm"
                            className="bg-[#023F40] hover:bg-[#035f60] h-7 text-xs"
                            onClick={() => {
                              markAsRead(notification.id);
                              if (notification.actionData && onAction) {
                                onAction(notification.actionData);
                              } else {
                                toast.info(`Navigating to: ${notification.actionLabel}`);
                              }
                            }}
                          >
                            {notification.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
