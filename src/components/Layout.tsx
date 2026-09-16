import { Outlet, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, BellRing, Clock, CheckCircle, AlertCircle, MessageCircle, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useWorkspaceStore } from './auth/stores/useWorkspace.store';

interface NotificationPreview {
  id: string;
  message: string;
  isRead: boolean;
  type: 'mention' | 'assignment' | 'due-soon' | 'status-change';
  createdAt: string;
}

const Layout = () => {
  const [notificationPreviews, setNotificationPreviews] = useState<NotificationPreview[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { workspaceId } = useParams();
  const { workspaces, selectWorkspace, fetchWorkspaces } = useWorkspaceStore();

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

  // Mock function to fetch notifications - replace with actual API call
  const fetchNotificationPreviews = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data for demonstration
      const mockNotifications: NotificationPreview[] = [
        {
          id: '1',
          message: 'You were mentioned in a comment',
          isRead: false,
          type: 'mention',
          createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        },
        {
          id: '2',
          message: 'Task "Design Review" is due soon',
          isRead: false,
          type: 'due-soon',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        },
        {
          id: '3',
          message: 'You were assigned to a new task',
          isRead: true,
          type: 'assignment',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
      ];
      
      setNotificationPreviews(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notification previews:', error);
      toast({
        title: "Error",
        description: "Could not load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchNotificationPreviews();
  }, []);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Optimistically update the UI
      setNotificationPreviews(prev =>
        prev.map(notif => {
          if (notif.id === id && !notif.isRead) {
            setUnreadCount(prevCount => prevCount - 1);
            return { ...notif, isRead: true };
          }
          return notif;
        })
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast({
        title: "Error",
        description: "Could not mark notification as read",
        variant: "destructive",
      });
      fetchNotificationPreviews();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setNotificationPreviews(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
      toast({
        title: "Marked all as read",
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast({
        title: "Error",
        description: "Could not mark all notifications as read.",
        variant: "destructive",
      });
      fetchNotificationPreviews();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />;
      case 'due-soon': return <Calendar className="w-4 h-4 text-orange-600 mr-2 flex-shrink-0" />;
      case 'mention': return <MessageCircle className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />;
      case 'status-change': return <AlertCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />;
      default: return <Bell className="w-4 h-4 text-gray-600 mr-2 flex-shrink-0" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `now`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
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

              {isLoading ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Loading notifications...
                </div>
              ) : notificationPreviews.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No notifications yet.
                </div>
              ) : (
                notificationPreviews.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`p-3 cursor-pointer flex flex-col items-start ${!notification.isRead ? 'bg-blue-50' : ''}`}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="flex w-full items-start justify-between">
                      <div className="flex items-start">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-tight">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(notification.createdAt)}
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