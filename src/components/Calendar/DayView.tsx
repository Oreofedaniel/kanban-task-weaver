import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Task } from '../auth/stores/useCalendarStore';
import { TaskCard } from './TaskCard';

interface DayViewProps {
  currentDate: Date;
  tasks: Task[];
  onDateClick: (date: string) => void;
  onTaskClick: (task: Task) => void;
  onTaskDrop: (taskId: string, newDate: string) => void;
  onDateChange: (date: Date) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  tasks,
  onDateClick,
  onTaskClick,
  onTaskDrop,
  onDateChange,
}) => {
  const dateString = currentDate.toISOString().split('T')[0];
  const isToday = currentDate.toDateString() === new Date().toDateString();
  const dayTasks = tasks.filter(task => task.dueDate === dateString);

  const handleDragOver = (e: React.DragEvent, date: string) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onTaskDrop(taskId, date);
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1));
    onDateChange(newDate);
  };

  const formatTimeRange = (hour: number): string => {
    return `${hour}:00 - ${hour + 1}:00`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={() => navigateDay('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigateDay('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <div 
            className="min-h-[800px]"
            onDragOver={(e) => handleDragOver(e, dateString)}
            onDrop={(e) => handleDrop(e, dateString)}
            onClick={() => onDateClick(dateString)}
          >
            {Array.from({ length: 14 }, (_, i) => i + 8).map((hour) => {
              const hourTasks = dayTasks.filter(task => {
                const taskHour = new Date(task.dueDate).getHours();
                return taskHour >= hour && taskHour < hour + 1;
              });

              return (
                <div key={hour} className="border-b p-4 min-h-[80px]">
                  <div className="flex">
                    <div className="w-32 text-sm text-gray-500 font-medium">
                      {formatTimeRange(hour)}
                    </div>
                    <div className="flex-1 space-y-2">
                      {hourTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onTaskClick={onTaskClick}
                        />
                      ))}
                      {hourTasks.length === 0 && (
                        <div className="text-gray-400 text-sm">No tasks scheduled</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};