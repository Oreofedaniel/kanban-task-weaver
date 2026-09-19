import { create } from "zustand";
import { api } from "@/lib/api";

export type NotificationType = "mention" | "assignment" | "due-soon" | "status-change";

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  isValid?: boolean;
}

interface RawNotification {
  _id: string; // NOTE: the schema also has a separate random `id` field - only `_id` works with the API
  type: NotificationType;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  isValid?: boolean;
}

const normalize = (n: RawNotification): AppNotification => ({
  id: n._id,
  type: n.type,
  message: n.message,
  link: n.link,
  isRead: !!n.isRead,
  createdAt: n.createdAt,
  isValid: n.isValid,
});

export const timeAgo = (dateString: string) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(dateString).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
};

interface NotificationsState {
  notifications: AppNotification[];
  loading: boolean;
  fetchNotifications: (userId: string, opts?: { silent?: boolean }) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markUnread: (id: string) => Promise<void>;
  markAllRead: (userId: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const patch = (id: string, isRead: boolean) => (state: NotificationsState) => ({
  notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead } : n)),
});

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  notifications: [],
  loading: true,

  fetchNotifications: async (userId, opts) => {
    if (!opts?.silent) set({ loading: true });
    try {
      const { data } = await api.get<RawNotification[]>(`/notifications/user/${userId}`, {
        params: { limit: 50 },
      });
      set({ notifications: data.map(normalize), loading: false });
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      set({ loading: false });
    }
  },

  markRead: async (id) => {
    await api.patch(`/notifications/${id}/read`);
    set(patch(id, true));
  },

  markUnread: async (id) => {
    await api.patch(`/notifications/${id}/unread`);
    set(patch(id, false));
  },

  markAllRead: async (userId) => {
    await api.patch(`/notifications/user/${userId}/mark-all-read`);
    set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, isRead: true })) }));
  },

  remove: async (id) => {
    await api.delete(`/notifications/${id}`);
    set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) }));
  },
}));
