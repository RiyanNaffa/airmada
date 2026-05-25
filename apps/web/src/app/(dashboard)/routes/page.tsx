'use client'

import { useState, useRef } from 'react'
import { MapPin, Truck, Zap, X } from 'lucide-react'
import { useRouteOptimization } from '@/hooks/useRouteOptimization'
import { RouteOptimizationResult } from '@/components/dashboard/RouteOptimizationResult'

// Sample pending shipments for route optimization demo
const SAMPLE_SHIPMENTS = [
  { lat: -6.2088, lng: 106.8456 },
  { lat: -6.5959, lng: 106.789 },
  { lat: -6.4025, lng: 106.7941 },
  { lat: -6.178, lng: 106.6304 },
  { lat: -6.2349, lng: 106.9896 },
]

const WAREHOUSE = { lat: -6.1751, lng: 106.8249 } // Jakarta Pusat

export default function RoutesPage() {
  const { optimize, loading, error, data } = useRouteOptimization()
  const [showOptimization, setShowOptimization] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  const handleOptimizeRoute = async () => {
    setShowOptimization(true)
    // Scroll ke result panel setelah render
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
    await optimize(WAREHOUSE, SAMPLE_SHIPMENTS)
  }

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 p-6">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Live Route Monitoring</h1>
          <p className="text-sm text-slate-500">Real-time tracking and AI-optimized routes</p>
        </div>

        <div className="rounded-full bg-orange-500 px-4 py-2 text-xs text-white shadow">
          ✨ AI-Optimized
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ================= MAP ================= */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow lg:col-span-2">
          {/* GRID BACKGROUND */}
          <div className="absolute inset-0 bg-[linear-gradient(#ffffff10_1px,transparent_1px),linear-gradient(to_right,#ffffff10_1px,transparent_1px)] bg-[size:40px_40px] opacity-10" />

          <div className="relative h-[420px]">
            {/* WAREHOUSE */}
            <div className="absolute top-[55%] left-[8%] flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow">
                <MapPin size={18} />
              </div>
              <div className="mt-2 rounded-full bg-white px-3 py-1 text-xs whitespace-nowrap shadow">
                Warehouse
              </div>
            </div>

            {/* CUSTOMER A */}
            <div className="absolute top-[15%] left-[45%] flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-blue-500 shadow" />
              <div className="mt-2 rounded-full bg-white px-3 py-1 text-xs whitespace-nowrap shadow">
                Customer A
              </div>
            </div>

            {/* VEHICLE */}
            <div className="absolute top-[40%] left-[60%] z-20 flex flex-col items-center">
              <div className="relative">
                <div className="absolute h-16 w-16 animate-ping rounded-full border-4 border-orange-400" />
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow">
                  <Truck size={16} />
                </div>
              </div>

              <div className="mt-2 rounded-full bg-orange-500 px-3 py-1 text-xs whitespace-nowrap text-white shadow">
                Current Location
              </div>
            </div>

            {/* CUSTOMER B */}
            <div className="absolute top-[45%] left-[75%] flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-slate-400" />
              <div className="mt-2 rounded-full bg-white px-3 py-1 text-xs whitespace-nowrap shadow">
                Customer B
              </div>
            </div>

            {/* CUSTOMER C */}
            <div className="absolute top-[65%] left-[85%] flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-slate-400" />
              <div className="mt-2 rounded-full bg-white px-3 py-1 text-xs whitespace-nowrap shadow">
                Customer C
              </div>
            </div>

            {/* ROUTE LINE */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              <path
                d="M120 280 C 300 250, 500 300, 800 260"
                stroke="#fb923c"
                strokeWidth="3"
                strokeDasharray="6 6"
                fill="none"
              />
            </svg>

            {/* LEGEND */}
            <div className="absolute bottom-6 left-6 space-y-2 rounded-xl bg-white p-4 text-xs text-slate-700 shadow">
              <p className="font-semibold">Legend</p>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Starting Point
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Completed
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Vehicle
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                Pending
              </div>
            </div>
          </div>
        </div>

        {/* ================= SIDE PANEL ================= */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Active Routes</h2>
            <p className="text-sm text-slate-500">3 routes in progress</p>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow">
            {/* HEADER */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-white">
                  <Truck size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">B 1234 XYZ</p>
                  <p className="text-xs text-slate-500">ANDI</p>
                </div>
              </div>

              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-600">
                Active
              </span>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs text-blue-600">Distance</p>
                <p className="text-sm font-semibold text-slate-800">45.3 km</p>
              </div>

              <div className="rounded-lg bg-purple-50 p-3">
                <p className="text-xs text-purple-600">Duration</p>
                <p className="text-sm font-semibold text-slate-800">68 min</p>
              </div>
            </div>

            {/* NEXT STOP */}
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <p className="text-xs font-medium text-orange-600">Next Stop</p>
              <p className="text-sm text-slate-800">Customer B - Bekasi</p>
              <p className="mt-1 text-xs text-orange-600">ETA: 10:45</p>
            </div>

            {/* AI OPTIMIZE BUTTON - NEW */}
            <button
              onClick={handleOptimizeRoute}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-600 disabled:opacity-50"
            >
              <Zap size={16} />
              {loading ? 'Optimizing...' : 'AI Optimize Route'}
            </button>
          </div>
        </div>
      </div>

      {/* ================= OPTIMIZATION RESULT - NEW ================= */}
      {showOptimization && (
        <div ref={resultRef} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
                <p className="text-sm text-slate-500">Calculating optimal route...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">Error occurred</p>
              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
          )}

          {data && !loading && <RouteOptimizationResult result={data} />}
        </div>
      )}
    </div>
  )
}
