import { useEffect, useState } from 'react';
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
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDisplayDate } from '../utils/dateFormat';
import {
  AppNotification,
  deleteUserNotification,
  getNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS_CHANGED_EVENT,
} from '../utils/notifications';

interface NotificationsViewProps {
  user: User;
  onAction?: (data: unknown) => void;
}

export function NotificationsView({ user, onAction }: NotificationsViewProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    getNotificationsForUser(user)
  );

  useEffect(() => {
    const sync = () => setNotifications(getNotificationsForUser(user));
    sync();
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [user]);

  const getNotificationIcon = (type: AppNotification['type']) => {
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
    return formatDisplayDate(date);
  };

  const markAsRead = (notifId: string) => {
    markNotificationRead(user, notifId);
    toast.success('Marked as read');
  };

  const markAllAsRead = () => {
    markAllNotificationsRead(user);
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (notifId: string) => {
    deleteUserNotification(user, notifId);
    toast.success('Notification deleted');
  };

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
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
                  : "You don't have any notifications yet."}
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
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4
                        className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}
                      >
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.read && (
                          <div
                            className="w-2 h-2 rounded-full bg-[#023F40]"
                            title="Unread"
                          />
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
                    <p
                      className={`text-sm mb-3 ${!notification.read ? 'text-gray-700' : 'text-gray-600'}`}
                    >
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(notification.timestamp)}
                      </div>

                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark read
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
                                toast.info('Navigating to application…');
                              }
                            }}
                          >
                            Go to application
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
