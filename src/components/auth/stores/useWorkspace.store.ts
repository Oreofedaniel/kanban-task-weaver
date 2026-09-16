import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Workspace {
  id: string;
  name: string;
  description: string;
  members: string[];
  owner?: string;
}

interface RawWorkspace {
  _id: string;
  name: string;
  description?: string;
  members?: Array<string | { _id: string }>;
  owner?: string | { _id: string };
}

const normalizeWorkspace = (w: RawWorkspace): Workspace => ({
  id: w._id,
  name: w.name,
  description: w.description || '',
  members: (w.members || []).map((m) => (typeof m === 'string' ? m : m._id)),
  owner: typeof w.owner === 'string' ? w.owner : w.owner?._id,
});

interface WorkspaceState {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  editingItem: Workspace | null;
  loading: boolean;
  fetchWorkspaces: () => Promise<void>;
  selectWorkspace: (workspace: Workspace | null) => void;
  addWorkspace: (workspaceData: Partial<Workspace>) => Promise<void>;
  updateWorkspace: (id: string, workspaceData: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  setEditingItem: (item: Workspace | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()((set, get) => ({
  workspaces: [],
  selectedWorkspace: null,
  editingItem: null,
  loading: false,

  fetchWorkspaces: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get<RawWorkspace[]>('/workspaces');
      const workspaces = data.map(normalizeWorkspace);
      set((state) => ({
        workspaces,
        loading: false,
        selectedWorkspace: state.selectedWorkspace
          ? workspaces.find((w) => w.id === state.selectedWorkspace!.id) || state.selectedWorkspace
          : null,
      }));
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
      set({ loading: false });
    }
  },

  selectWorkspace: (workspace) => set({ selectedWorkspace: workspace }),

  addWorkspace: async (workspaceData) => {
    const { data } = await api.post<RawWorkspace>('/workspaces', {
      name: workspaceData.name,
      description: workspaceData.description,
    });
    const newWorkspace = normalizeWorkspace(data);
    set((state) => ({
      workspaces: [...state.workspaces, newWorkspace],
      selectedWorkspace: newWorkspace,
    }));
  },

  updateWorkspace: async (id, workspaceData) => {
    const { data } = await api.put<RawWorkspace>(`/workspaces/${id}`, {
      name: workspaceData.name,
      description: workspaceData.description,
    });
    const updated = normalizeWorkspace(data);
    set((state) => ({
      workspaces: state.workspaces.map((workspace) => (workspace.id === id ? updated : workspace)),
      selectedWorkspace: state.selectedWorkspace?.id === id ? updated : state.selectedWorkspace,
    }));
  },

  deleteWorkspace: async (id) => {
    await api.delete(`/workspaces/${id}`);
    set((state) => ({
      workspaces: state.workspaces.filter((workspace) => workspace.id !== id),
      selectedWorkspace: state.selectedWorkspace?.id === id ? null : state.selectedWorkspace,
    }));
  },

  setEditingItem: (item) => set({ editingItem: item }),
}));
