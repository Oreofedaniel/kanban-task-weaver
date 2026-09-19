// src/components/Calendar/WeekView.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Task } from '../auth/stores/useCalendarStore';
import { TaskCard } from './TaskCard';

interface WeekViewProps {
  currentDate: Date;
  tasks: Task[];
  onDateClick: (date: string) => void;
  onTaskClick: (task: Task) => void;
  onTaskDrop: (taskId: string, newDate: string) => void;
  onDateChange: (date: Date) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  tasks,
  onDateClick,
  onTaskClick,
  onTaskDrop,
  onDateChange,
}) => {
  const getWeekDates = (date: Date): Date[] => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const weekDates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(startOfWeek);
      nextDate.setDate(startOfWeek.getDate() + i);
      weekDates.push(nextDate);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(currentDate);
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleDragOver = (e: React.DragEvent, date: string) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onTaskDrop(taskId, date);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    onDateChange(newDate);
  };

  const formatTimeRange = (hour: number): string => {
    return `${hour}:00 - ${hour + 1}:00`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            Week of {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
            {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-8 gap-2">
          {/* Time column */}
          <div className="border-r p-2">
            <div className="h-12"></div>
            {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
              <div key={hour} className="h-16 border-b text-xs text-gray-500 flex items-center">
                {formatTimeRange(hour)}
              </div>
            ))}
          </div>

          {/* Days columns */}
          {weekDates.map((date, index) => {
            const dateString = date.toISOString().split('T')[0];
            const isToday = date.toDateString() === new Date().toDateString();
            const dayTasks = tasks.filter(task => task.dueDate === dateString);

            return (
              <div key={index} className="flex flex-col">
                <div className={`text-center p-2 border-b font-medium ${
                  isToday ? 'bg-blue-100 text-blue-800' : 'bg-gray-50'
                }`}>
                  <div className="text-sm">{weekDays[date.getDay()]}</div>
                  <div className="text-lg font-bold">{date.getDate()}</div>
                </div>
                
                <div 
                  className="flex-1 min-h-[768px]"
                  onDragOver={(e) => handleDragOver(e, dateString)}
                  onDrop={(e) => handleDrop(e, dateString)}
                  onClick={() => onDateClick(dateString)}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => {
                    const hourTasks = dayTasks.filter(task => {
                      const taskHour = new Date(task.dueDate).getHours();
                      return taskHour >= hour && taskHour < hour + 1;
                    });

                    return (
                      <div key={hour} className="h-16 border-b p-1">
                        {hourTasks.map(task => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onTaskClick={onTaskClick}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};