/**
 * Komponen untuk menampilkan hasil optimasi rute
 * @location apps/web/src/components/dashboard/RouteOptimizationResult.tsx
 */
'use client'

import { MapPin, Route } from 'lucide-react'
import { OptimizeRouteResponse } from '@/lib/ai-client'

interface RouteOptimizationResultProps {
  result: OptimizeRouteResponse
}

export function RouteOptimizationResult({ result }: RouteOptimizationResultProps) {
  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-blue-700">
            <Route size={16} />
            Total Distance
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {result.estimated_distance_km} km
          </p>
          <p className="mt-1 text-xs text-blue-600">optimized route</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-purple-700">
            <MapPin size={16} />
            Estimated Time
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {Math.round(result.estimated_duration_min / 60)}h {result.estimated_duration_min % 60}m
          </p>
          <p className="mt-1 text-xs text-purple-600">
            {result.estimated_duration_min} minutes total
          </p>
        </div>
      </div>

      {/* Waypoints List */}
      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
            ✓
          </span>
          Delivery Sequence
        </h4>

        <div className="space-y-2">
          {result.ordered_waypoints.map((waypoint, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
            >
              {/* Step Number */}
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-bold text-white">
                {idx + 1}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {waypoint.shipment_id
                    ? `Shipment #${waypoint.shipment_id}`
                    : idx === 0
                      ? 'Warehouse (Start)'
                      : `Destination ${idx}`}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  📍 {waypoint.lat.toFixed(4)}, {waypoint.lng.toFixed(4)}
                </p>
              </div>

              {/* Distance to next */}
              {idx < result.ordered_waypoints.length - 1 && (
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs font-medium text-slate-400">Next →</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border-l-4 border-orange-400 bg-orange-50 p-4">
        <p className="text-sm text-orange-900">
          <span className="font-semibold">💡 Optimized with TSP Algorithm</span> - This route is
          calculated to minimize travel distance and time for maximum efficiency.
        </p>
      </div>

      {/* Action Button */}
      <button className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-lg active:scale-[0.98]">
        📍 Assign This Route to Driver
      </button>
    </div>
  )
}
