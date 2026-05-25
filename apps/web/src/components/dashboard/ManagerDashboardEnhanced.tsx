/**
 * Enhanced Manager Dashboard dengan Anomaly Detection
 * @location apps/web/src/components/dashboard/ManagerDashboardEnhanced.tsx
 */
'use client'

import { useState } from 'react'
import { Truck, Users, Package, AlertTriangle, AlertCircle } from 'lucide-react'
import { useAnomalyDetection } from '@/hooks/useAnomalyDetection'
import { AnomalyAlerts } from './AnomalyAlerts'

interface MonitoredVehicle {
  id: string
  name: string
  status: 'active' | 'idle' | 'offline'
  lastGpsMinutesAgo: number
  speed_kmh: number
  deviation_km: number
  eta_overdue_minutes: number
}

export function ManagerDashboardEnhanced() {
  const [selectedVehicle, setSelectedVehicle] = useState<MonitoredVehicle | null>(null)
  const {
    anomalies,
    loading: detectingAnomalies,
    detect,
    hasHighSeverity: _hasHighSeverity,
  } = useAnomalyDetection()

  // Demo vehicles
  const monitoredVehicles: MonitoredVehicle[] = [
    {
      id: 'VEH001',
      name: 'Truck Alpha',
      status: 'active',
      lastGpsMinutesAgo: 2,
      speed_kmh: 75,
      deviation_km: 0.5,
      eta_overdue_minutes: 0,
    },
    {
      id: 'VEH002',
      name: 'Truck Beta',
      status: 'active',
      lastGpsMinutesAgo: 5,
      speed_kmh: 120,
      deviation_km: 3.5,
      eta_overdue_minutes: 15,
    },
    {
      id: 'VEH003',
      name: 'Truck Gamma',
      status: 'idle',
      lastGpsMinutesAgo: 45,
      speed_kmh: 0,
      deviation_km: 0,
      eta_overdue_minutes: 0,
    },
  ]

  const handleDetectAnomalies = async (vehicle: MonitoredVehicle) => {
    setSelectedVehicle(vehicle)
    await detect(vehicle.id, vehicle.lastGpsMinutesAgo, {
      deviation_km: vehicle.deviation_km,
      eta_overdue_minutes: vehicle.eta_overdue_minutes,
      speed_kmh: vehicle.speed_kmh,
    })
  }

  // Count stats
  const activeVehicles = monitoredVehicles.filter((v) => v.status === 'active').length
  const vehiclesWithHighAnomalies = anomalies.filter((a) => a.severity === 'high').length

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Active Vehicles"
          value={activeVehicles}
          delta="+2"
          icon={<Truck size={20} className="text-white" />}
          iconBg="bg-emerald-500"
        />
        <KpiCard
          label="On-Duty Drivers"
          value={8}
          delta="+1"
          icon={<Users size={20} className="text-white" />}
          iconBg="bg-sky-500"
        />
        <KpiCard
          label="Pending Shipments"
          value={15}
          delta="-3"
          icon={<Package size={20} className="text-white" />}
          iconBg="bg-violet-500"
        />
        <KpiCard
          label="Critical Alerts"
          value={vehiclesWithHighAnomalies}
          delta={vehiclesWithHighAnomalies > 0 ? '⚠️' : '✓'}
          icon={<AlertTriangle size={20} className="text-white" />}
          iconBg={vehiclesWithHighAnomalies > 0 ? 'bg-red-500' : 'bg-emerald-500'}
        />
      </div>

      {/* Vehicle Monitoring with Anomaly Detection */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Vehicle List */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-1">
          <h3 className="font-semibold text-slate-800">Vehicle Fleet</h3>
          <p className="mt-1 text-xs text-slate-400">Click to analyze anomalies</p>

          <div className="mt-4 space-y-2">
            {monitoredVehicles.map((vehicle) => {
              const hasAnomalies =
                anomalies.length > 0 &&
                anomalies.some((a) => a.vehicle_id === vehicle.id && a.severity === 'high')
              return (
                <button
                  key={vehicle.id}
                  onClick={() => handleDetectAnomalies(vehicle)}
                  className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                    selectedVehicle?.id === vehicle.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  } ${hasAnomalies ? 'ring-2 ring-red-200' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-700">{vehicle.name}</p>
                      <p className="text-xs text-slate-500">{vehicle.id}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            vehicle.status === 'active'
                              ? 'bg-emerald-500'
                              : vehicle.status === 'idle'
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                          }`}
                        />
                        <span className="text-xs text-slate-600 capitalize">{vehicle.status}</span>
                      </div>
                    </div>
                    {hasAnomalies && <AlertCircle size={16} className="shrink-0 text-red-500" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Anomaly Details */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="font-semibold text-slate-800">Anomaly Analysis</h3>
          <p className="mt-1 text-xs text-slate-400">
            {selectedVehicle
              ? `Analysis for ${selectedVehicle.name}`
              : 'Select a vehicle to analyze'}
          </p>

          <div className="mt-4">
            {detectingAnomalies ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
                  <p className="text-sm text-slate-500">Analyzing vehicle...</p>
                </div>
              </div>
            ) : selectedVehicle ? (
              <div className="space-y-3">
                {anomalies.length === 0 ? (
                  <div className="rounded-lg bg-emerald-50 p-4">
                    <p className="text-sm font-medium text-emerald-800">✓ No anomalies detected</p>
                    <p className="text-xs text-emerald-700">Vehicle operating normally</p>
                  </div>
                ) : (
                  <>
                    <AnomalyAlerts
                      vehicleId={selectedVehicle.id}
                      lastGpsMinutesAgo={selectedVehicle.lastGpsMinutesAgo}
                      deviation_km={selectedVehicle.deviation_km}
                      eta_overdue_minutes={selectedVehicle.eta_overdue_minutes}
                      speed_kmh={selectedVehicle.speed_kmh}
                    />
                  </>
                )}

                {/* Vehicle Details */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded bg-slate-50 p-3">
                    <p className="text-xs text-slate-600">Speed</p>
                    <p className="mt-1 font-bold text-slate-800">
                      {selectedVehicle.speed_kmh} km/h
                    </p>
                  </div>
                  <div className="rounded bg-slate-50 p-3">
                    <p className="text-xs text-slate-600">GPS Last Update</p>
                    <p className="mt-1 font-bold text-slate-800">
                      {selectedVehicle.lastGpsMinutesAgo} min
                    </p>
                  </div>
                  <div className="rounded bg-slate-50 p-3">
                    <p className="text-xs text-slate-600">Route Deviation</p>
                    <p className="mt-1 font-bold text-slate-800">
                      {selectedVehicle.deviation_km.toFixed(1)} km
                    </p>
                  </div>
                  <div className="rounded bg-slate-50 p-3">
                    <p className="text-xs text-slate-600">ETA Status</p>
                    <p className="mt-1 font-bold text-slate-800">
                      {selectedVehicle.eta_overdue_minutes > 0
                        ? `+${selectedVehicle.eta_overdue_minutes} min`
                        : 'On Time'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-8">
                <p className="text-sm text-slate-400">Select a vehicle to view analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800">Fleet Summary</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryStat label="Total Vehicles" value={monitoredVehicles.length} />
          <SummaryStat label="Active" value={activeVehicles} color="emerald" />
          <SummaryStat
            label="With Anomalies"
            value={anomalies.length > 0 ? anomalies.filter((a) => a.severity === 'high').length : 0}
            color={vehiclesWithHighAnomalies > 0 ? 'red' : 'emerald'}
          />
          <SummaryStat label="Avg Detection" value={anomalies.length} />
        </div>
      </div>
    </div>
  )
}

// Helper Components
function KpiCard({
  label,
  value,
  delta,
  icon,
  iconBg,
}: {
  label: string
  value: number
  delta: string
  icon: React.ReactNode
  iconBg: string
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
          <p className="mt-1 text-xs font-semibold text-slate-600">{delta}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function SummaryStat({
  label,
  value,
  color = 'slate',
}: {
  label: string
  value: number
  color?: string
}) {
  const colorClasses: Record<string, string> = {
    slate: 'bg-slate-50 text-slate-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
  }

  return (
    <div className={`rounded-lg ${colorClasses[color]} p-3`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  )
}
