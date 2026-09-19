import { Outlet, useParams, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, BellRing, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { useWorkspaceStore } from './auth/stores/useWorkspace.store';
import { useAuthStore } from './auth/stores/auth.store';
import { useNotificationsStore, timeAgo } from './auth/stores/useNotificationsStore';
import { NotificationIcon } from './NotificationIcon';

const POLL_MS = 30000;

const Layout = () => {
  const { workspaceId } = useParams();
  const { workspaces, selectWorkspace, fetchWorkspaces } = useWorkspaceStore();
  const { user } = useAuthStore();
  const { notifications, loading, fetchNotifications, markRead, markAllRead } = useNotificationsStore();

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (workspaceId) {
      const workspace = workspaces.find(w => w.id === workspaceId);
      if (workspace) {
        selectWorkspace(workspace);
      }
    }
  }, [workspaceId, workspaces, selectWorkspace]);

  // Load notifications now and keep the bell fresh.
  useEffect(() => {
    if (!user) return;
    fetchNotifications(user.id);
    const timer = setInterval(() => fetchNotifications(user.id, { silent: true }), POLL_MS);
    return () => clearInterval(timer);
  }, [user, fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const previews = notifications.slice(0, 6);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await markRead(id);
    } catch (error) {
      toast({ title: "Error", description: "Could not mark notification as read", variant: "destructive" });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await markAllRead(user.id);
      toast({ title: "Marked all as read" });
    } catch (error) {
      toast({ title: "Error", description: "Could not mark all notifications as read.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                    Mark all read
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Loading notifications...
                </div>
              ) : previews.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No notifications yet.
                </div>
              ) : (
                previews.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`p-3 cursor-pointer flex flex-col items-start ${!notification.isRead ? 'bg-blue-50' : ''}`}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="flex w-full items-start justify-between">
                      <div className="flex items-start">
                        <span className="mr-2 mt-0.5 flex-shrink-0">
                          <NotificationIcon type={notification.type} className="w-4 h-4" />
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-tight">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {timeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-2 flex-shrink-0"
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))
              )}

              <div className="p-2 border-t">
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link to="/app/notifications">
                    <BellRing className="w-4 h-4 mr-2" />
                    View All Notifications
                  </Link>
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
