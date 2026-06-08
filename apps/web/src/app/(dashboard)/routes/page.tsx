'use client'

import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
import { MapPin, Truck, Zap, X, AlertCircle } from 'lucide-react'
import { useRouteOptimization } from '@/hooks/useRouteOptimization'
import { useRealtimeGPS } from '@/hooks/useRealtimeGPS'
import { RouteOptimizationResult } from '@/components/dashboard/RouteOptimizationResult'
import dynamic from 'next/dynamic'

const LiveVehicleMap = dynamic(() => import('@/components/dashboard/LiveVehicleMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[450px] w-full animate-pulse flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-sm text-slate-400">
      <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      Memuat peta pemantauan...
    </div>
  ),
})

export default function RoutesPage() {
  const {
    optimize,
    loading: optimizing,
    error: optimizeError,
    data: optimizeData,
  } = useRouteOptimization()
  const { positions, loading, error: gpsError } = useRealtimeGPS({ enabled: true })

  const [showOptimization, setShowOptimization] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>()

  // Sample pending shipments for route optimization demo
  const SAMPLE_SHIPMENTS = [
    { lat: -6.2088, lng: 106.8456 },
    { lat: -6.5959, lng: 106.789 },
    { lat: -6.4025, lng: 106.7941 },
    { lat: -6.178, lng: 106.6304 },
    { lat: -6.2349, lng: 106.9896 },
  ]

  const WAREHOUSE = { lat: -6.1751, lng: 106.8249 } // Jakarta Pusat

  const handleOptimizeRoute = async () => {
    setShowOptimization(true)
    await optimize(WAREHOUSE, SAMPLE_SHIPMENTS)
  }

  const selectedVehicle = positions.find((p) => p.vehicle_id === selectedVehicleId)

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 p-6">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Live Route Monitoring</h1>
          <p className="text-sm text-slate-500">Real-time tracking via Supabase Realtime</p>
        </div>

        <div className="flex items-center gap-2">
          {loading && (
            <div className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-2 text-xs font-medium text-blue-700">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              Syncing...
            </div>
          )}
          {!loading && positions.length > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-2 text-xs font-medium text-green-700">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              {positions.length} active
            </div>
          )}
        </div>
      </div>

      {/* STATUS INDICATORS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Active Vehicles</p>
          <p className="text-2xl font-bold text-slate-800">{positions.length}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Average Speed</p>
          <p className="text-2xl font-bold text-slate-800">
            {positions.length > 0
              ? Math.round(positions.reduce((acc, p) => acc + p.speed_kmh, 0) / positions.length)
              : 0}{' '}
            km/h
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Status</p>
          <p
            className={`text-lg font-bold ${positions.length > 0 ? 'text-green-600' : 'text-slate-500'}`}
          >
            {positions.length > 0 ? '🟢 Live' : '🔴 Offline'}
          </p>
        </div>
      </div>

      {/* ERROR MESSAGES */}
      {gpsError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 flex-shrink-0 text-red-600" size={18} />
          <div>
            <p className="text-sm font-medium text-red-800">GPS Service Error</p>
            <p className="mt-1 text-sm text-red-700">{gpsError}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* MAP */}
        <div className="lg:col-span-2">
          <LiveVehicleMap
            positions={positions}
            selectedVehicleId={selectedVehicleId}
            onVehicleSelect={setSelectedVehicleId}
            height="h-[450px]"
          />
        </div>

        {/* SIDE PANEL */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Route Controls</h2>
            <p className="text-sm text-slate-500">
              {selectedVehicle
                ? `${selectedVehicle.plate_number} - ${selectedVehicle.driver_name}`
                : 'Select a vehicle'}
            </p>
          </div>

          {selectedVehicle && (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow">
              {/* HEADER */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-white">
                    <Truck size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {selectedVehicle.plate_number}
                    </p>
                    <p className="text-xs text-slate-500">{selectedVehicle.driver_name}</p>
                  </div>
                </div>

                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-600">
                  Active
                </span>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-xs text-blue-600">Speed</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedVehicle.speed_kmh.toFixed(1)} km/h
                  </p>
                </div>

                <div className="rounded-lg bg-purple-50 p-3">
                  <p className="text-xs text-purple-600">Heading</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedVehicle.heading.toFixed(0)}°
                  </p>
                </div>

                <div className="rounded-lg bg-green-50 p-3">
                  <p className="text-xs text-green-600">Latitude</p>
                  <p className="font-mono text-xs text-slate-800">
                    {selectedVehicle.lat.toFixed(6)}
                  </p>
                </div>

                <div className="rounded-lg bg-green-50 p-3">
                  <p className="text-xs text-green-600">Longitude</p>
                  <p className="font-mono text-xs text-slate-800">
                    {selectedVehicle.lng.toFixed(6)}
                  </p>
                </div>
              </div>

              {/* LAST UPDATE */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-600">Last Updated</p>
                <p className="text-sm font-medium text-slate-800">
                  {new Date(selectedVehicle.recorded_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {!selectedVehicle && (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
              <MapPin className="mx-auto mb-2 text-slate-400" size={24} />
              <p className="text-sm text-slate-600">Select a vehicle on the map to view details</p>
            </div>
          )}

          {/* AI OPTIMIZE BUTTON */}
          <button
            onClick={handleOptimizeRoute}
            disabled={optimizing}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-600 disabled:opacity-50"
          >
            <Zap size={16} />
            {optimizing ? 'Optimizing...' : 'AI Optimize Route'}
          </button>
        </div>
      </div>

      {/* OPTIMIZATION RESULT */}
      {showOptimization && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                <Zap size={20} className="text-orange-500" />
                Route Optimization Result
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {SAMPLE_SHIPMENTS.length} shipments optimized
              </p>
            </div>
            <button
              onClick={() => setShowOptimization(false)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          {optimizing && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
                <p className="text-sm text-slate-500">Calculating optimal route...</p>
              </div>
            </div>
          )}

          {optimizeError && (
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">Error occurred</p>
              <p className="mt-1 text-sm text-red-600">{optimizeError}</p>
            </div>
          )}

          {optimizeData && !optimizing && <RouteOptimizationResult result={optimizeData} />}
        </div>
      )}
    </div>
  )
}
