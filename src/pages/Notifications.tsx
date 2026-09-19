import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellRing, Clock, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/components/auth/stores/auth.store';
import { useNotificationsStore, timeAgo, NotificationType } from '@/components/auth/stores/useNotificationsStore';
import { NotificationIcon } from '@/components/NotificationIcon';

const priorityOf = (type: NotificationType): 'low' | 'medium' | 'high' =>
  type === 'due-soon' ? 'high' : type === 'status-change' ? 'low' : 'medium';

const priorityColor = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

const Notifications = () => {
  const { user } = useAuthStore();
  const { notifications, loading, fetchNotifications, markRead, markUnread, markAllRead, remove } =
    useNotificationsStore();

  useEffect(() => {
    if (user) fetchNotifications(user.id);
  }, [user, fetchNotifications]);

  const run = async (action: () => Promise<void>, failure: string, success?: string) => {
    try {
      await action();
      if (success) toast({ title: success });
    } catch (err) {
      toast({ title: 'Error', description: failure, variant: 'destructive' });
      if (user) fetchNotifications(user.id, { silent: true });
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center py-12">
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <BellRing className="w-8 h-8 mr-3 text-blue-600" />
            Notifications
            {unreadCount > 0 && <Badge className="ml-3 bg-red-500 text-white">{unreadCount} unread</Badge>}
          </h1>
          <p className="text-gray-600">Stay updated with your team activities</p>
        </div>
        {unreadCount > 0 && user && (
          <Button
            onClick={() =>
              run(() => markAllRead(user.id), 'Could not mark all notifications as read.', 'All notifications marked as read')
            }
          >
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => {
          const priority = priorityOf(notification.type);
          return (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md ${!notification.isRead ? 'border-blue-200 bg-blue-50/30' : ''} ${
                notification.isValid === false ? 'opacity-60' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <NotificationIcon type={notification.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.type
                            .split('-')
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(' ')}
                        </h3>
                        {!notification.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                        <Badge className={priorityColor[priority]}>{priority}</Badge>
                        {notification.isValid === false && (
                          <Badge variant="outline" className="text-gray-500">
                            Link Expired
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{timeAgo(notification.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                    <div className="flex space-x-2">
                      {notification.isRead ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => run(() => markUnread(notification.id), 'Could not mark as unread.')}
                        >
                          <EyeOff className="w-4 h-4 mr-1" /> Mark Unread
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => run(() => markRead(notification.id), 'Could not mark as read.')}
                        >
                          <Eye className="w-4 h-4 mr-1" /> Mark Read
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => run(() => remove(notification.id), 'Could not delete notification.', 'Notification deleted')}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                      {notification.link && notification.isValid !== false && (
                        <Button size="sm" variant="ghost" asChild>
                          <Link
                            to={notification.link.split('?')[0]}
                            onClick={() => !notification.isRead && markRead(notification.id).catch(() => undefined)}
                          >
                            View
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500 text-center">
              You're all caught up! You'll be notified when a commitment is assigned to you, changes status, or is due soon.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notifications;
