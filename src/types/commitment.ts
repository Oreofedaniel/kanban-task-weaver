export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'Not Started' | 'In Progress' | 'Completed';
export type Tab = 'All' | 'Upcoming' | 'Due Today' | 'Completed' | 'Archived';

export interface Commitment {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO
  assignee: { id: string; name: string } | null;
  priority: Priority;
  status: Status;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}
