'use client'

import { useUserRole } from '@/hooks/useUserRole'
import { ManagerDashboard } from '@/components/dashboard/ManagerDashboard'
import { DriverDashboard } from '@/components/dashboard/DriverDashboard'
import { DispatcherDashboard } from '@/components/dashboard/DispatcherDashboard'

/**
 * Halaman Overview dengan Role-Based Dashboard
 *
 * @location apps/web/src/app/(dashboard)/overview/page.tsx
 *
 * Displays different dashboard content based on user role:
 * - MANAGER: Fleet management, team performance, financial metrics
 * - DRIVER: Current deliveries, earnings, performance tracking
 * - DISPATCHER: Live tracking, route optimization, dispatch management
 */
export default function OverviewPage() {
  const { role, loading } = useUserRole()

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-xl space-y-6 p-5 lg:p-7">
        <div className="animate-pulse">
          <div className="mb-6 h-10 w-48 rounded-lg bg-slate-200" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-200" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getRoleTitle = (role: string | null) => {
    switch (role) {
      case 'MANAGER':
        return 'Fleet Management Dashboard'
      case 'DRIVER':
        return 'Driver Dashboard'
      case 'DISPATCHER':
        return 'Dispatch Management'
      default:
        return 'Dashboard'
    }
  }

  const getRoleSubtitle = (role: string | null) => {
    switch (role) {
      case 'MANAGER':
        return 'Manage your fleet, monitor team performance, and track financial metrics'
      case 'DRIVER':
        return 'Check your active deliveries, earnings, and performance metrics'
      case 'DISPATCHER':
        return 'Manage shipment assignments, track drivers, and optimize routes'
      default:
        return 'Welcome to your dashboard'
    }
  }

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 p-5 lg:p-7">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 lg:text-3xl">
            {getRoleTitle(role)}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{getRoleSubtitle(role)}</p>
        </div>
        <div className="hidden sm:block">
          <span className="inline-block rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {role}
          </span>
        </div>
      </div>

      {/* ── Role-Based Dashboard Content ──────────────────────────────── */}
      {role === 'MANAGER' && <ManagerDashboard />}
      {role === 'DRIVER' && <DriverDashboard />}
      {role === 'DISPATCHER' && <DispatcherDashboard />}

      {/* ── Fallback for unknown roles ──────────────────────────────────── */}
      {!['MANAGER', 'DRIVER', 'DISPATCHER'].includes(role || '') && (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">Unknown user role: {role}</p>
        </div>
      )}
    </div>
  )
}
