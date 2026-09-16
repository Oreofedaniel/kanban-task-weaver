import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Column {
  id: string;
  title: string;
  color: string;
  order: number;
}

interface RawColumn {
  _id: string;
  name: string;
  color?: string;
  order?: number;
}

const normalizeColumn = (c: RawColumn): Column => ({
  id: c._id,
  title: c.name,
  color: c.color || 'bg-gray-100',
  order: c.order ?? 0,
});

interface ColumnsState {
  columns: Column[];
  loading: boolean;
  fetchColumns: (workspaceId: string) => Promise<void>;
  addColumn: (workspaceId: string, name: string, color?: string) => Promise<Column>;
  updateColumn: (columnId: string, data: Partial<{ name: string; color: string; order: number }>) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
}

export const useColumnsStore = create<ColumnsState>()((set, get) => ({
  columns: [],
  loading: false,

  fetchColumns: async (workspaceId) => {
    set({ loading: true });
    try {
      const { data } = await api.get<RawColumn[]>(`/columns/${workspaceId}`);
      const columns = data.map(normalizeColumn).sort((a, b) => a.order - b.order);
      set({ columns, loading: false });
    } catch (err) {
      console.error('Failed to fetch columns:', err);
      set({ loading: false });
    }
  },

  addColumn: async (workspaceId, name, color) => {
    const { data } = await api.post<{ data: RawColumn }>(`/columns/${workspaceId}`, { name, color });
    const newColumn = normalizeColumn(data.data);
    set((state) => ({ columns: [...state.columns, newColumn] }));
    return newColumn;
  },

  updateColumn: async (columnId, updates) => {
    const body: Record<string, unknown> = {};
    if (updates.name !== undefined) body.name = updates.name;
    if (updates.color !== undefined) body.color = updates.color;
    if (updates.order !== undefined) body.order = updates.order;
    const { data } = await api.put<{ data: RawColumn }>(`/columns/${columnId}`, body);
    const updated = normalizeColumn(data.data);
    set((state) => ({
      columns: state.columns.map((col) => (col.id === columnId ? updated : col)),
    }));
  },

  deleteColumn: async (columnId) => {
    await api.delete(`/columns/${columnId}`);
    set((state) => ({ columns: state.columns.filter((col) => col.id !== columnId) }));
  },
}));
