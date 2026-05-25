/**
 * Sidebar navigasi utama dashboard.
 *
 * @location apps/web/src/components/layout/Sidebar.tsx
 * TODO: Tambahkan nav links ke overview, vehicles, drivers, shipments, routes, analytics, ai-chat
 *       Gunakan usePathname() untuk highlight active route.
 */
export function Sidebar() {
  return (
    <aside className="min-h-screen w-64 bg-gray-900 p-4 text-white">
      <p className="mb-6 text-lg font-bold">aiRMADA</p>
      <nav className="space-y-1">
        {/* TODO: NavItem components */}
        <p className="text-xs text-gray-400">Nav — coming soon</p>
      </nav>
    </aside>
  )
}
