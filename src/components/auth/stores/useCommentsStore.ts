import { create } from "zustand";
import { api } from "@/lib/api";

export interface Comment {
  id: string;
  userId: string;
  author: string;
  content: string;
  timestamp: string;
}

interface RawComment {
  _id: string;
  content: string;
  userId: string | { _id: string; name?: string; email?: string };
  createdAt?: string;
}

const normalizeComment = (c: RawComment): Comment => {
  const populated = typeof c.userId === "object" && c.userId !== null;
  return {
    id: c._id,
    userId: populated ? (c.userId as { _id: string })._id : (c.userId as string),
    author: populated ? (c.userId as { name?: string }).name || "Unknown" : "Unknown",
    content: c.content,
    timestamp: c.createdAt || new Date().toISOString(),
  };
};

interface CommentsState {
  comments: Comment[];
  loading: boolean;
  fetchComments: (taskId: string) => Promise<void>;
  addComment: (taskId: string, userId: string, content: string) => Promise<void>;
  editComment: (taskId: string, commentId: string, userId: string, content: string) => Promise<void>;
  deleteComment: (taskId: string, commentId: string, userId: string) => Promise<void>;
  clearComments: () => void;
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
  comments: [],
  loading: false,

  fetchComments: async (taskId) => {
    set({ loading: true });
    try {
      const { data } = await api.get<RawComment[]>(`/tasks/${taskId}/comments`);
      set({ comments: data.map(normalizeComment), loading: false });
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      set({ comments: [], loading: false });
    }
  },

  addComment: async (taskId, userId, content) => {
    await api.post(`/tasks/${taskId}/comments`, { content, userId });
    await get().fetchComments(taskId);
  },

  editComment: async (taskId, commentId, userId, content) => {
    await api.put(`/tasks/${taskId}/comments/${commentId}`, { content, userId });
    await get().fetchComments(taskId);
  },

  deleteComment: async (taskId, commentId, userId) => {
    await api.delete(`/tasks/${taskId}/comments/${commentId}`, { data: { userId } });
    set((state) => ({ comments: state.comments.filter((c) => c.id !== commentId) }));
  },

  clearComments: () => set({ comments: [] }),
}));
