/**
 * Enhanced Dispatcher Dashboard dengan Route Optimization
 * @location apps/web/src/components/dashboard/DispatcherDashboardEnhanced.tsx
 */
'use client'

import { useState } from 'react'
import { RadioTower, Zap, Users, TrendingUp, Sparkles } from 'lucide-react'
import { useRouteOptimization } from '@/hooks/useRouteOptimization'
import { RouteOptimizationResult } from './RouteOptimizationResult'
import { Coordinate } from '@/lib/ai-client'

export function DispatcherDashboardEnhanced() {
  const [showOptimizationResult, setShowOptimizationResult] = useState(false)
  const { optimize, data: optimizedRoute, loading: optimizing, error } = useRouteOptimization()

  // Dummy shipments untuk demo
  const pendingShipments = [
    {
      id: 'ARM-000130',
      priority: 'High',
      pickup: 'CBD',
      deadline: '16:30',
      lat: -6.1751,
      lng: 106.8228,
    },
    {
      id: 'ARM-000131',
      priority: 'High',
      pickup: 'South',
      deadline: '17:00',
      lat: -6.2155,
      lng: 106.8743,
    },
    {
      id: 'ARM-000132',
      priority: 'Medium',
      pickup: 'East',
      deadline: '18:30',
      lat: -6.1888,
      lng: 106.8899,
    },
  ]

  const warehouseLocation: Coordinate = {
    lat: -6.2088,
    lng: 106.8456,
    shipment_id: 'warehouse',
  }

  const handleOptimizeRoute = async () => {
    try {
      const destinations: Coordinate[] = pendingShipments.map((s) => ({
        lat: s.lat,
        lng: s.lng,
        shipment_id: s.id,
      }))

      await optimize(warehouseLocation, destinations)
      setShowOptimizationResult(true)
    } catch (err) {
      console.error('Optimization failed:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Dispatcher KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DispatcherKPICard
          label="Active Shipments"
          value={42}
          delta="+8"
          icon={<RadioTower size={20} className="text-white" />}
          iconBg="bg-sky-500"
        />
        <DispatcherKPICard
          label="Assigned Drivers"
          value={18}
          delta="+2"
          icon={<Users size={20} className="text-white" />}
          iconBg="bg-emerald-500"
        />
        <DispatcherKPICard
          label="Dispatch Efficiency"
          value={94}
          unit="%"
          delta="+3%"
          icon={<Zap size={20} className="text-white" />}
          iconBg="bg-violet-500"
        />
        <DispatcherKPICard
          label="Avg Response Time"
          value={2.3}
          unit="min"
          delta="-0.5"
          icon={<TrendingUp size={20} className="text-white" />}
          iconBg="bg-orange-500"
        />
      </div>

      {/* Live Dispatch Map & Management */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Real-time Tracking */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="font-semibold text-slate-800">Live Fleet Tracking</h3>
          <p className="mt-1 text-xs text-slate-400">Real-time vehicle & driver locations</p>

          <div className="mt-4 flex h-64 items-center justify-center rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="text-center">
              <p className="mb-2 text-sm text-slate-500">📍 GPS Map will load here</p>
              <p className="text-xs text-slate-400">Integrate with your GPS service</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-emerald-50 p-3">
              <p className="text-xs font-medium text-emerald-600">ON TIME</p>
              <p className="mt-1 text-lg font-bold text-emerald-700">35</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-xs font-medium text-amber-600">AT RISK</p>
              <p className="mt-1 text-lg font-bold text-amber-700">5</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-xs font-medium text-red-600">DELAYED</p>
              <p className="mt-1 text-lg font-bold text-red-700">2</p>
            </div>
          </div>
        </div>

        {/* Quick Dispatch with AI Optimization */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800">Pending Assignments</h3>
          <p className="mt-1 text-xs text-slate-400">Awaiting dispatch</p>

          <div className="mt-4 max-h-48 space-y-2 overflow-y-auto">
            {pendingShipments.map((shipment) => (
              <div
                key={shipment.id}
                className="flex cursor-pointer items-start justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs font-bold text-slate-700">{shipment.id}</p>
                  <p className="mt-1 text-xs text-slate-500">{shipment.pickup}</p>
                </div>
                <div className="ml-2 shrink-0 text-right">
                  <span
                    className={`mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      shipment.priority === 'High'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {shipment.priority}
                  </span>
                  <p className="text-xs font-semibold text-slate-600">{shipment.deadline}</p>
                </div>
              </div>
            ))}
          </div>

          {/* AI Route Optimization Button */}
          <button
            onClick={handleOptimizeRoute}
            disabled={optimizing}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:bg-slate-400"
          >
            <Sparkles size={16} />
            {optimizing ? 'Optimizing...' : 'AI Optimize Route'}
          </button>
        </div>
      </div>

      {/* Route Optimization Result */}
      {showOptimizationResult && optimizedRoute && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <h3 className="font-semibold text-blue-900">🎯 Optimized Route Ready</h3>
          <p className="mt-1 text-xs text-blue-700">
            Route optimization complete — ready to assign to driver
          </p>
          <div className="mt-4">
            <RouteOptimizationResult result={optimizedRoute} />
          </div>
          <button
            onClick={() => setShowOptimizationResult(false)}
            className="mt-3 w-full rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200"
          >
            Assign This Route
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-800">⚠️ {error}</p>
        </div>
      )}

      {/* Rest of original dashboard components */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800">Available Drivers</h3>
          <p className="mt-1 text-xs text-slate-400">Ready for assignment</p>

          <div className="mt-4 space-y-2">
            {[
              { name: 'Budi Santoso', vehicle: 'TR-0145', location: 'CBD', available: true },
              { name: 'Ahmad Ridho', vehicle: 'TR-0203', location: 'South', available: true },
              { name: 'Siti Nurhaliza', vehicle: 'TR-0156', location: 'East', available: false },
            ].map((driver) => (
              <div
                key={driver.name}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{driver.name}</p>
                  <p className="text-xs text-slate-500">
                    {driver.vehicle} • {driver.location}
                  </p>
                </div>
                <div
                  className={`h-3 w-3 shrink-0 rounded-full ${
                    driver.available ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800">Performance Metrics</h3>
          <p className="mt-1 text-xs text-slate-400">Team statistics</p>

          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-slate-600">On-Time Delivery Rate</span>
                <span className="text-sm font-bold text-slate-800">94.4%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-11/12 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper component for KPI cards
function DispatcherKPICard({
  label,
  value,
  unit = '',
  delta = '',
  icon,
  iconBg,
}: {
  label: string
  value: number
  unit?: string
  delta?: string
  icon: React.ReactNode
  iconBg: string
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">
            {value}
            {unit && <span className="text-sm font-normal text-slate-500">{unit}</span>}
          </p>
          {delta && <p className="mt-1 text-xs font-semibold text-emerald-600">{delta}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
