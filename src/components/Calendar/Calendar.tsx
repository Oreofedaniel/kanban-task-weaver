// src/components/Calendar/Calendar.tsx
import { useState, useEffect, useMemo } from 'react';
import { useWorkspaceStore } from '@/components/auth/stores/useWorkspace.store';
import { useCalendarStore, Task } from '@/components/auth/stores/useCalendarStore';
import { useTasksStore } from '@/components/auth/stores/useTasksStore';
import { useColumnsStore } from '@/components/auth/stores/useColumns.store';
import { useAuthStore } from '@/components/auth/stores/auth.store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search } from 'lucide-react';
import { TaskModal } from '@/components/TaskModal';
import { toast } from '@/hooks/use-toast';
import { CalendarView } from './CalendarView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { UpcomingTasks } from './UpcomingTasks';
import { DueTodayTasks } from './DueTodayTasks';

const Calendar = () => {
  const { selectedWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const { currentView, currentDate, filters, setView, setCurrentDate, setFilter } = useCalendarStore();
  const { tasks, fetchTasks, addTask, updateTask } = useTasksStore();
  const { columns, fetchColumns } = useColumnsStore();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [prefillDate, setPrefillDate] = useState<string | undefined>(undefined);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchColumns(selectedWorkspace.id);
      fetchTasks(selectedWorkspace.id);
    }
  }, [selectedWorkspace, fetchColumns, fetchTasks]);

  // Only tasks that have a due date can be placed on a calendar.
  const scheduled = useMemo(() => tasks.filter((t) => !!t.dueDate), [tasks]);

  const assignees = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.assignee).filter(Boolean))).sort(),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    const q = filters.search.toLowerCase();
    return scheduled.filter((t) => {
      const matchesSearch =
        q === '' || t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
      const matchesStatus = filters.status === 'all' || t.status === filters.status;
      const matchesAssignee = filters.assignee === 'all' || t.assignee === filters.assignee;
      return matchesSearch && matchesStatus && matchesAssignee;
    });
  }, [scheduled, filters]);

  if (!selectedWorkspace) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Workspace Selected</h1>
          <p className="text-gray-600">Open a workspace from the Workspaces page to see its calendar.</p>
        </div>
      </div>
    );
  }

  const closeModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
    setPrefillDate(undefined);
  };

  const handleTaskSave = async (taskData: Partial<Task>) => {
    try {
      if (selectedTask) {
        await updateTask(selectedTask.id, taskData);
        toast({ title: 'Task Updated', description: 'Task has been successfully updated' });
      } else {
        await addTask({
          title: taskData.title || '',
          description: taskData.description || '',
          status: taskData.status || columns[0]?.id || '',
          assignee: taskData.assignee || '',
          dueDate: taskData.dueDate || prefillDate || '',
          priority: taskData.priority || 'medium',
          tags: taskData.tags || [],
          color: taskData.color || '#6b7280',
          subtasks: taskData.subtasks || [],
          createdBy: user?.name || 'Unknown',
          workspaceId: selectedWorkspace.id,
        });
        toast({ title: 'Task Created', description: 'New task has been created successfully' });
      }
      closeModal();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save task.', variant: 'destructive' });
    }
  };

  const handleCreateTask = (date?: string) => {
    setSelectedTask(null);
    setPrefillDate(date);
    setIsTaskModalOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskDrop = async (taskId: string, newDate: string) => {
    try {
      await updateTask(taskId, { dueDate: newDate });
      toast({ title: 'Task Rescheduled', description: 'Task due date has been updated' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to reschedule task.', variant: 'destructive' });
    }
  };

  return (
    <div className="p-8 m-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600">
          Tasks from <span className="font-medium">{selectedWorkspace.name}</span> by due date — drag a task to a new day to reschedule it
        </p>
      </div>

      <Tabs defaultValue="calendar" className="mb-6">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Tasks</TabsTrigger>
          <TabsTrigger value="dueToday">Due Today</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search tasks..."
                    value={filters.search}
                    onChange={(e) => setFilter('search', e.target.value)}
                    className="w-64"
                  />
                </div>

                <Select value={filters.status} onValueChange={(v) => setFilter('status', v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Columns</SelectItem>
                    {columns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.assignee} onValueChange={(v) => setFilter('assignee', v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    {assignees.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={currentView} onValueChange={(v: 'month' | 'week' | 'day') => setView(v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={() => handleCreateTask()} className="ml-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </div>
            </CardContent>
          </Card>

          {currentView === 'month' && (
            <CalendarView
              currentDate={currentDate}
              tasks={filteredTasks}
              onDateClick={handleCreateTask}
              onTaskClick={handleTaskClick}
              onTaskDrop={handleTaskDrop}
              onDateChange={setCurrentDate}
            />
          )}
          {currentView === 'week' && (
            <WeekView
              currentDate={currentDate}
              tasks={filteredTasks}
              onDateClick={handleCreateTask}
              onTaskClick={handleTaskClick}
              onTaskDrop={handleTaskDrop}
              onDateChange={setCurrentDate}
            />
          )}
          {currentView === 'day' && (
            <DayView
              currentDate={currentDate}
              tasks={filteredTasks}
              onDateClick={handleCreateTask}
              onTaskClick={handleTaskClick}
              onTaskDrop={handleTaskDrop}
              onDateChange={setCurrentDate}
            />
          )}
        </TabsContent>

        <TabsContent value="upcoming">
          <UpcomingTasks tasks={filteredTasks} onTaskClick={handleTaskClick} />
        </TabsContent>

        <TabsContent value="dueToday">
          <DueTodayTasks tasks={filteredTasks} onTaskClick={handleTaskClick} />
        </TabsContent>
      </Tabs>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={closeModal}
        onSave={handleTaskSave}
        task={selectedTask}
        columns={columns}
        prefillDate={prefillDate}
      />
    </div>
  );
};

export default Calendar;
