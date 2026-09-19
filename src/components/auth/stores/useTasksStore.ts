import { create } from "zustand";
import { api } from "@/lib/api";
import { Task, Subtask } from "@/types/types";

interface RawSubtask {
  _id: string;
  title: string;
  description?: string;
  completed?: boolean;
}

interface RawTask {
  _id: string;
  title: string;
  description?: string;
  columnId?: string;
  workspaceId?: string;
  assignee?: string;
  createdBy?: string;
  dueDate?: string;
  priority?: string;
  tags?: string[];
  color?: string;
  subtasks?: RawSubtask[];
}

const normalizeSubtask = (s: RawSubtask): Subtask => ({
  id: s._id,
  title: s.title,
  description: s.description || "",
  status: "todo",
  assignee: "",
  dueDate: "",
  priority: "medium",
  tags: [],
  completed: !!s.completed,
});

const normalizeTask = (t: RawTask): Task => ({
  id: t._id,
  title: t.title,
  description: t.description || "",
  status: t.columnId || "",
  assignee: t.assignee || "",
  dueDate: t.dueDate || "",
  priority: (t.priority as Task["priority"]) || "medium",
  tags: t.tags || [],
  color: t.color || "#6b7280",
  subtasks: (t.subtasks || []).map(normalizeSubtask),
  createdBy: t.createdBy || "Unknown",
  workspaceId: t.workspaceId || "",
});

const toPayload = (task: Partial<Task>) => ({
  title: task.title,
  description: task.description,
  columnId: task.status || undefined,
  workspaceId: task.workspaceId,
  assignee: task.assignee,
  createdBy: task.createdBy,
  dueDate: task.dueDate,
  priority: task.priority,
  tags: task.tags,
  color: task.color,
  subtasks: task.subtasks?.map((st) => ({
    title: st.title,
    description: st.description,
    completed: st.completed,
  })),
});

interface TaskState {
  tasks: Task[];
  loading: boolean;
  fetchTasks: (workspaceId: string) => Promise<void>;
  addTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  setTasks: (tasks: Task[]) => void;
}

export const useTasksStore = create<TaskState>()((set) => ({
  tasks: [],
  loading: false,

  fetchTasks: async (workspaceId) => {
    set({ loading: true });
    try {
      const { data } = await api.get<RawTask[]>("/tasks", { params: { workspaceId } });
      set({ tasks: data.map(normalizeTask), loading: false });
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      set({ loading: false });
    }
  },

  addTask: async (task) => {
    const { data } = await api.post<RawTask>("/tasks", toPayload(task));
    const newTask = normalizeTask(data);
    set((state) => ({ tasks: [...state.tasks, newTask] }));
    return newTask;
  },

  updateTask: async (taskId, updates) => {
    const { data } = await api.put<RawTask>(`/tasks/${taskId}`, toPayload(updates));
    const updated = normalizeTask(data);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? updated : t)),
    }));
  },

  deleteTask: async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) }));
  },

  setTasks: (tasks) => set({ tasks }),
}));
