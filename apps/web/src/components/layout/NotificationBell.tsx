/**
 * Bell icon dengan badge unread count — subscribe ke Supabase Realtime.
 *
 * @location apps/web/src/components/layout/NotificationBell.tsx
 * TODO: useNotificationStore untuk unread_count, useRealtimeNotifications hook
 */
export function NotificationBell() {
  return (
    <button className="relative p-2" aria-label="Notifikasi">
      {/* TODO: Lucide BellIcon + badge */}
      <span className="text-gray-500">🔔</span>
    </button>
  )
}
