import { create } from 'zustand'
import type { Notification } from '@airmada/types'

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  addNotification: (n: Notification) => void
  markRead: (id: string) => void
  markAllRead: () => void
  setNotifications: (ns: Notification[]) => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (n) =>
    set((state) => ({
      notifications: [n, ...state.notifications],
      unreadCount: state.unreadCount + (n.is_read ? 0 : 1),
    })),
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),
  setNotifications: (ns) =>
    set({
      notifications: ns,
      unreadCount: ns.filter((n) => !n.is_read).length,
    }),
}))
