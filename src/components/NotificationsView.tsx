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
  UserPlus, 
  TrendingUp,
  XCircle,
  Filter,
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
  
  // Generate role-specific mock notifications
  const getMockNotifications = (): Notification[] => {
    const baseNotifications: Notification[] = [];
    
    // System Admin notifications
    if (user.role === 'SYSTEM_ADMIN') {
      baseNotifications.push(
        {
          id: 'notif-1',
          type: 'system',
          title: 'System Update Completed',
          message: 'The RGF Rebate System has been successfully updated to version 2.1.0. All modules are functioning normally.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionable: false
        },
        {
          id: 'notif-2',
          type: 'warning',
          title: 'New Asset Financier Pending Approval',
          message: 'Kigali Microfinance has submitted a registration request. Requires admin review.',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionable: true,
          actionLabel: 'Review Application',
          actionUrl: '/admin/pending-registrations'
        },
        {
          id: 'notif-3',
          type: 'info',
          title: 'Monthly Report Generated',
          message: 'The system has automatically generated the monthly analytics report for February 2026.',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          actionable: true,
          actionLabel: 'View Report',
          actionUrl: '/reports'
        },
        {
          id: 'notif-4',
          type: 'system',
          title: 'User Role Updated',
          message: 'David Habimana has been assigned as Rebate Manager. Changes are now active.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          read: true
        }
      );
    }
    
    // Rebate Analyst notifications
    if (user.role === 'REBATE_ANALYST') {
      baseNotifications.push(
        {
          id: 'notif-5',
          type: 'application',
          title: 'New Application Assigned',
          message: 'Application #APP-2026-0847 has been assigned to you for initial review.',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          read: false,
          actionable: true,
          actionLabel: 'Review Application',
          actionUrl: '/applications'
        },
        {
          id: 'notif-6',
          type: 'warning',
          title: 'Additional Information Requested',
          message: 'Application #APP-2026-0812 - Asset Financier has submitted the requested RURA verification documents.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionable: true,
          actionLabel: 'View Documents',
          actionUrl: '/applications'
        },
        {
          id: 'notif-7',
          type: 'success',
          title: 'Application Approved by Manager',
          message: 'Your recommendation for Application #APP-2026-0798 has been approved by Catherine Uwera.',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: 'notif-8',
          type: 'info',
          title: 'Eligibility Criteria Updated',
          message: 'The system admin has updated the income verification criteria. Please review for future applications.',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          actionable: true,
          actionLabel: 'View Criteria',
          actionUrl: '/criteria'
        }
      );
    }
    
    // Rebate Manager notifications
    if (user.role === 'REBATE_MANAGER') {
      baseNotifications.push(
        {
          id: 'notif-9',
          type: 'application',
          title: 'Application Ready for Final Review',
          message: 'Application #APP-2026-0847 has passed analyst review and is ready for your approval.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionable: true,
          actionLabel: 'Review & Approve',
          actionUrl: '/applications'
        },
        {
          id: 'notif-10',
          type: 'warning',
          title: 'SLA Alert: 3 Applications Approaching Deadline',
          message: 'Three applications are approaching the 5-day review deadline. Immediate attention required.',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionable: true,
          actionLabel: 'View Applications',
          actionUrl: '/applications'
        },
        {
          id: 'notif-11',
          type: 'success',
          title: 'Team Performance Report',
          message: 'Your team processed 47 applications this week with a 94% approval rate. Great work!',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionable: true,
          actionLabel: 'View Analytics',
          actionUrl: '/analytics'
        }
      );
    }
    
    // E-Moto Program Manager notifications
    if (user.role === 'E_MOTO_PROGRAM_MANAGER') {
      baseNotifications.push(
        {
          id: 'notif-12',
          type: 'application',
          title: 'Lease Review Required',
          message: 'Application #APP-2026-0834 - Signed lease from Bank of Kigali requires your review.',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          read: false,
          actionable: true,
          actionLabel: 'Review Lease',
          actionUrl: '/lease-review'
        },
        {
          id: 'notif-13',
          type: 'info',
          title: 'Program Milestone Achieved',
          message: 'The RGF E-Moto Rebate Program has successfully disbursed RWF 500M to 2,450 beneficiaries!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: 'notif-14',
          type: 'warning',
          title: 'M&E Investigation Loop Initiated',
          message: 'Application #APP-2026-0789 flagged for field verification by M&E team.',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          read: true,
          actionable: true,
          actionLabel: 'View Details',
          actionUrl: '/applications'
        }
      );
    }
    
    // Finance Officer notifications
    if (user.role === 'DESIGNATED_FINANCE_OFFICER') {
      baseNotifications.push(
        {
          id: 'notif-15',
          type: 'payment',
          title: 'New Payment Pending Processing',
          message: 'Application #APP-2026-0823 - RWF 850,000 rebate payment requires your authorization.',
          timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          read: false,
          actionable: true,
          actionLabel: 'Process Payment',
          actionUrl: '/pending-payments'
        },
        {
          id: 'notif-16',
          type: 'payment',
          title: 'Batch Payment Ready',
          message: '8 approved applications totaling RWF 6,800,000 are ready for batch disbursement.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionable: true,
          actionLabel: 'Process Batch',
          actionUrl: '/pending-payments'
        },
        {
          id: 'notif-17',
          type: 'success',
          title: 'Payment Successfully Disbursed',
          message: 'RWF 750,000 disbursed to Bank of Kigali for Application #APP-2026-0801.',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: 'notif-18',
          type: 'info',
          title: 'Monthly Disbursement Summary',
          message: 'February 2026: RWF 45.2M disbursed across 56 applications. Reconciliation complete.',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          actionable: true,
          actionLabel: 'View Report',
          actionUrl: '/reports'
        }
      );
    }
    
    // M&E Team notifications
    if (user.role === 'ME_TEAM') {
      baseNotifications.push(
        {
          id: 'notif-19',
          type: 'warning',
          title: 'Field Verification Request',
          message: 'Application #APP-2026-0789 requires field verification in Nyarugenge District.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionable: true,
          actionLabel: 'View Details',
          actionUrl: '/applications'
        },
        {
          id: 'notif-20',
          type: 'info',
          title: 'Data Collection Update',
          message: 'Q1 2026 impact assessment data collection is 78% complete. 124 beneficiaries surveyed.',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: 'notif-21',
          type: 'success',
          title: 'Investigation Completed',
          message: 'Your field verification report for Application #APP-2026-0756 has been accepted.',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          read: true
        }
      );
    }
    
    // Asset Financier Admin notifications
    if (user.role === 'ASSET_FINANCIER_ADMIN') {
      baseNotifications.push(
        {
          id: 'notif-22-new',
          type: 'success',
          title: 'Application Approved!',
          message: 'Jean Claude Ndayisaba application has been approved, you can now upload signed lease.',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          read: false,
          actionable: true,
          actionLabel: 'Upload Signed Lease',
          actionData: { type: 'open-application', appId: 'application:APP-2024-1001' }
        },
        {
          id: 'notif-22',
          type: 'success',
          title: 'Application Approved!',
          message: 'Application #APP-2026-0834 has been approved. Please upload the signed lease agreement.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionable: true,
          actionLabel: 'Upload Lease',
          actionUrl: '/my-applications'
        },
        {
          id: 'notif-23',
          type: 'error',
          title: 'Lease Rejected - Correction Required',
          message: 'Application #APP-2026-0798 - Lease rejected. Loan term mismatch. Please upload corrected version.',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionable: true,
          actionLabel: 'View Feedback',
          actionUrl: '/my-applications'
        },
        {
          id: 'notif-24',
          type: 'payment',
          title: 'Rebate Payment Received',
          message: 'RWF 750,000 rebate for Application #APP-2026-0801 has been transferred to your account.',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: 'notif-25',
          type: 'warning',
          title: 'Additional Information Required',
          message: 'Application #APP-2026-0847 - Analyst requires RURA plate registration document.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          actionable: true,
          actionLabel: 'Upload Document',
          actionUrl: '/my-applications'
        }
      );
    }
    
    // Claims Officer notifications
    if (user.role === 'CLAIMS_OFFICER') {
      baseNotifications.push(
        {
          id: 'notif-26',
          type: 'info',
          title: 'New Rebate Program Guidelines',
          message: 'Updated eligibility criteria for electric motorcycles effective March 1, 2026.',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionable: true,
          actionLabel: 'View Guidelines',
          actionUrl: '/guidelines'
        },
        {
          id: 'notif-27',
          type: 'success',
          title: 'Partnership Agreement Active',
          message: 'Your organization has been successfully onboarded to the RGF Rebate System.',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          read: true
        }
      );
    }
    
    // External Reviewer notifications
    if (user.role === 'EXTERNAL_REVIEWER') {
      baseNotifications.push(
        {
          id: 'notif-28',
          type: 'info',
          title: 'Audit Access Granted',
          message: 'You now have read-only access to all applications and financial records for Q1 2026 audit.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: 'notif-29',
          type: 'application',
          title: 'New Applications Available',
          message: '47 new applications have been processed this week and are available for your review.',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionable: true,
          actionLabel: 'View Applications',
          actionUrl: '/applications'
        }
      );
    }
    
    // Add some common notifications for all roles
    baseNotifications.push(
      {
        id: 'notif-30',
        type: 'system',
        title: 'Welcome to the RGF Rebate System',
        message: 'Your account has been successfully created. Explore the dashboard to get started.',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        read: true
      }
    );
    
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

  const getNotificationBgColor = (type: Notification['type'], read: boolean) => {
    // Always return white background with standard border
    return 'bg-white border-gray-200';
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
      <div className="flex items-center gap-2 border-b">
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