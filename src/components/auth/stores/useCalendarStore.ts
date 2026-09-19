import { create } from 'zustand';

// The calendar has no task data of its own: it is a date-based view over the same
// real tasks the Kanban board uses (see useTasksStore).
export type { Task, Subtask } from '@/types/types';

type View = 'month' | 'week' | 'day';

interface CalendarFilters {
  status: string; // a column id, or 'all'
  assignee: string;
  search: string;
}

interface CalendarStore {
  currentView: View;
  currentDate: Date;
  filters: CalendarFilters;
  setView: (view: View) => void;
  setCurrentDate: (date: Date) => void;
  setFilter: (filter: keyof CalendarFilters, value: string) => void;
  clearFilters: () => void;
}

const defaultFilters: CalendarFilters = { status: 'all', assignee: 'all', search: '' };

export const useCalendarStore = create<CalendarStore>()((set) => ({
  currentView: 'month',
  currentDate: new Date(),
  filters: defaultFilters,

  setView: (view) => set({ currentView: view }),
  setCurrentDate: (date) => set({ currentDate: date }),
  setFilter: (filter, value) => set((state) => ({ filters: { ...state.filters, [filter]: value } })),
  clearFilters: () => set({ filters: defaultFilters }),
}));
