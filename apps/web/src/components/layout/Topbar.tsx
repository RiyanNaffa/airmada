/**
 * Topbar dashboard — berisi judul halaman, notifikasi bell, dan avatar user.
 *
 * @location apps/web/src/components/layout/Topbar.tsx
 * TODO: Sambungkan NotificationBell dengan useNotificationStore
 */
export function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <span className="font-semibold">Dashboard</span>
      {/* TODO: <NotificationBell /> <UserAvatar /> */}
    </header>
  )
}
