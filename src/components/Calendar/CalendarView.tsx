import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task } from '../auth/stores/useCalendarStore';
import { TaskCard } from './TaskCard';
import { Card, CardContent } from '@/components/ui/card';

interface CalendarViewProps {
  currentDate: Date;
  tasks: Task[];
  onDateClick: (date: string) => void;
  onTaskClick: (task: Task) => void;
  onTaskDrop: (taskId: string, newDate: string) => void;
  onDateChange: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  tasks,
  onDateClick,
  onTaskClick,
  onTaskDrop,
  onDateChange,
}) => {
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Fill initial empty days
  for (let i = 0; i < startingDayOfWeek; i++) {
    currentWeek.push(new Date(year, month, i - startingDayOfWeek + 1));
  }

  // Fill month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    currentWeek.push(date);

    if (currentWeek.length === 7 || day === daysInMonth) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  }

  // Fill remaining empty days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      const nextDate = new Date(currentWeek[currentWeek.length - 1]);
      nextDate.setDate(nextDate.getDate() + 1);
      currentWeek.push(nextDate);
    }
    weeks.push(currentWeek);
  }

  const handleDragOver = (e: React.DragEvent, date: string) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onTaskDrop(taskId, date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(direction === 'prev' ? month - 1 : month + 1);
    onDateChange(newDate);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center font-medium text-sm text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weeks.map((week, weekIndex) =>
            week.map((date, dayIndex) => {
              const dateString = date.toISOString().split('T')[0];
              const isCurrentMonth = date.getMonth() === month;
              const isToday = date.toDateString() === new Date().toDateString();
              const dayTasks = tasks.filter(task => task.dueDate === dateString);

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`min-h-[120px] p-2 border rounded-lg ${
                    !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                  } ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}`}
                  onDragOver={(e) => handleDragOver(e, dateString)}
                  onDrop={(e) => handleDrop(e, dateString)}
                  onClick={() => onDateClick(dateString)}
                >
                  <div className="text-sm font-medium mb-2">
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onTaskClick={onTaskClick}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};