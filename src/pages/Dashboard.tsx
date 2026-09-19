import { useState, useEffect } from 'react';
import { useAuthStore } from '@/components/auth/stores/auth.store';
import { useWorkspaceStore } from '@/components/auth/stores/useWorkspace.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Folder, Users, Calendar, BarChart3, Clock, Target, Plus, Edit, Trash, CalendarDays, MoreHorizontal, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useDashboardStore } from '@/components/auth/stores/dashboard.store';

interface DashboardMetrics {
  completedTasks: number;
  inProgressTasks: number;
  teamMembers: number;
  activeWorkspaces?: number;
  totalWorkspaces?: number;
}

interface Meeting {
  id: string;
  title: string;
  description: string;
  dateTime: Date;
  link: string;
  createdAt: Date;
  isRecurring?: boolean;
  recurrenceRule?: string;
}

const Dashboard = () => {
  const { user } = useAuthStore();
  const { workspaces } = useWorkspaceStore();
  const navigate = useNavigate();
  
  // Use Zustand store for dashboard data
  const { 
    metrics, 
    meetings, 
    loading, 
    error,
    fetchMetrics, 
    fetchMeetings, 
    createMeeting, 
    deleteMeeting,
    clearError
  } = useDashboardStore();
  
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    dateTime: '',
    time: '',
    link: '',
    isRecurring: false,
    recurrenceRule: ''
  });

  useEffect(() => {
    // Fetch data when component mounts
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    await Promise.all([fetchMetrics(), fetchMeetings()]);
  };

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: "Connection Issue",
        description: error,
        variant: "destructive"
      });
    }
  }, [error]);

  const handleAddMeeting = async () => {
    if (!newMeeting.title || !newMeeting.dateTime || !newMeeting.link) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Combine date and time
      const dateTime = new Date(`${newMeeting.dateTime}T${newMeeting.time}`);
      
      await createMeeting({
        title: newMeeting.title,
        description: newMeeting.description,
        dateTime,
        link: newMeeting.link,
        isRecurring: newMeeting.isRecurring,
        recurrenceRule: newMeeting.recurrenceRule
      });

      setNewMeeting({
        title: '',
        description: '',
        dateTime: '',
        time: '',
        link: '',
        isRecurring: false,
        recurrenceRule: ''
      });
      setShowMeetingForm(false);
      
      toast({
        title: "Meeting Scheduled",
        description: "New meeting has been scheduled successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create meeting",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    try {
      await deleteMeeting(id);
      toast({
        title: "Meeting Deleted",
        description: "Meeting has been deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete meeting",
        variant: "destructive"
      });
    }
  };

  const formatMeetingDateTime = (dateTime: Date) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const stats = [
    { 
      name: 'Active Workspaces', 
      value: metrics.activeWorkspaces?.toString() || '0', 
      icon: Target, 
      color: 'bg-blue-500',
      onClick: () => navigate('/app/workspaces'),
      description: 'View all active workspaces'
    },
    { 
      name: 'Total Workspaces', 
      value: metrics.totalWorkspaces?.toString() || '0', 
      icon: Folder, 
      color: 'bg-purple-500',
      onClick: () => navigate('/app/workspaces'),
      description: 'Manage all workspaces'
    },
    {
      name: 'Completed Tasks',
      value: metrics.completedTasks.toString(),
      icon: BarChart3,
      color: 'bg-green-500',
      onClick: () => navigate('/app/tasks?status=completed'),
      description: 'View completed tasks'
    },
    {
      name: 'In Progress',
      value: metrics.inProgressTasks.toString(),
      icon: Clock,
      color: 'bg-yellow-500',
      onClick: () => navigate('/app/tasks?status=in-progress'),
      description: 'View tasks in progress'
    },
    {
      name: 'Team Members',
      value: metrics.teamMembers.toString(),
      icon: Users,
      color: 'bg-indigo-500',
      onClick: () => navigate('/app/Teamlist'),
      description: 'Manage team members'
    },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your projects today.
          </p>
        </div>
        <Button 
          onClick={fetchDashboardData} 
          variant="outline" 
          size="sm"
          className="flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-red-700">{error}</p>
          <Button 
            onClick={() => clearError()} 
            variant="ghost" 
            size="sm" 
            className="ml-auto"
          >
            Dismiss
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat) => (
          <Card
            key={stat.name}
            className={`transition-all duration-200 ${stat.onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}`}
            onClick={stat.onClick}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Meetings</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowMeetingForm(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Meeting
              </Button>
            </div>
            <CardDescription>
              Your scheduled meetings and calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {showMeetingForm && (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">New Meeting</h4>
                  <div className="space-y-3">
                    <Input
                      placeholder="Meeting title *"
                      value={newMeeting.title}
                      onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                    />
                    <Textarea
                      placeholder="Description"
                      value={newMeeting.description}
                      onChange={(e) => setNewMeeting({...newMeeting, description: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={newMeeting.dateTime}
                        onChange={(e) => setNewMeeting({...newMeeting, dateTime: e.target.value})}
                      />
                      <Input
                        type="time"
                        value={newMeeting.time}
                        onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                      />
                    </div>
                    <Input
                      placeholder="Meeting link *"
                      value={newMeeting.link}
                      onChange={(e) => setNewMeeting({...newMeeting, link: e.target.value})}
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="recurring"
                        checked={newMeeting.isRecurring}
                        onChange={(e) => setNewMeeting({...newMeeting, isRecurring: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="recurring" className="text-sm">Recurring meeting</label>
                    </div>
                    {newMeeting.isRecurring && (
                      <Input
                        placeholder="Recurrence rule (e.g., RRULE:FREQ=WEEKLY;INTERVAL=1)"
                        value={newMeeting.recurrenceRule}
                        onChange={(e) => setNewMeeting({...newMeeting, recurrenceRule: e.target.value})}
                      />
                    )}
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleAddMeeting}>
                        Create
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setShowMeetingForm(false);
                          setNewMeeting({
                            title: '',
                            description: '',
                            dateTime: '',
                            time: '',
                            link: '',
                            isRecurring: false,
                            recurrenceRule: ''
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {meetings.map((meeting) => {
                const { date, time } = formatMeetingDateTime(meeting.dateTime);
                return (
                  <div key={meeting.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{meeting.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {date} at {time}
                          </Badge>
                          {meeting.isRecurring && (
                            <Badge variant="secondary" className="text-xs">
                              Recurring
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{meeting.description}</p>
                        <p className="text-xs text-gray-500">
                          Created {new Date(meeting.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {meeting.link && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(meeting.link, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteMeeting(meeting.id)}
                              className="text-red-600"
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {meetings.length === 0 && !showMeetingForm && (
                <div className="text-center text-gray-500 py-8">
                  <CalendarDays className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No upcoming meetings</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Navigate to key areas of your workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/app/calendar">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                View Calendar
              </Button>
            </Link>
            <Link to="/app/workspaces">
              <Button className="w-full justify-start" variant="outline">
                <Folder className="w-4 h-4 mr-2" />
                Manage Workspaces
              </Button>
            </Link>
            {user && (
              <Link to="/app/teamlist">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Teams
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;