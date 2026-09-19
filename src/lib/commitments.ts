import { api } from './api';
import { Commitment, Priority, Status, Tab } from '../types/commitment';

interface RawCommitment {
  _id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  assigneeId?: string | { _id: string; name?: string } | null;
  priority: Priority;
  status: Status;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

const normalize = (c: RawCommitment): Commitment => {
  const a = c.assigneeId;
  return {
    id: c._id,
    title: c.title,
    description: c.description || '',
    dueDate: c.dueDate || c.createdAt,
    assignee: a && typeof a === 'object' ? { id: a._id, name: a.name || 'Unknown' } : null,
    priority: c.priority,
    status: c.status,
    archived: !!c.archived,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
};

export interface CommitmentInput {
  title: string;
  description?: string;
  dueDate: string; // ISO
  assigneeId?: string | null;
  priority: Priority;
  status?: Status;
}

export async function fetchCommitments(tab: Tab = 'All'): Promise<Commitment[]> {
  const { data } = await api.get<RawCommitment[]>('/commitments', { params: { tab } });
  return data.map(normalize);
}

export async function createCommitment(payload: CommitmentInput): Promise<void> {
  await api.post('/commitments', payload);
}

export async function updateCommitment(id: string, payload: Partial<CommitmentInput>): Promise<void> {
  await api.patch(`/commitments/${id}`, payload);
}

export async function archiveCommitment(id: string): Promise<void> {
  await api.patch(`/commitments/${id}/archive`);
}

export async function restoreCommitment(id: string): Promise<void> {
  await api.patch(`/commitments/${id}/restore`);
}

export function errorMessage(err: any, fallback: string): string {
  const m = err?.response?.data?.message;
  if (Array.isArray(m)) return m.join(', ');
  return m || fallback;
}
