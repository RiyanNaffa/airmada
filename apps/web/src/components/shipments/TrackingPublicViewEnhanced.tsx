/**
 * Enhanced Tracking View dengan ETA Prediction
 * @location apps/web/src/components/shipments/TrackingPublicViewEnhanced.tsx
 */
'use client'

import { useState, useEffect } from 'react'
import { useETAPrediction } from '@/hooks/useETAPrediction'
import { MapPin, Clock, Truck, AlertCircle, CheckCircle } from 'lucide-react'

interface ShipmentData {
  tracking_code: string
  sender: string
  recipient: string
  weight: string
  priority: string
  status: string
  date: string
  current_location: string
  remaining_distance_km: number
  remaining_stops: number
  current_speed_kmh: number
  traffic_factor: number
}

export function TrackingPublicViewEnhanced() {
  const [shipment, setShipment] = useState<ShipmentData | null>(null)
  const [showEtaPrediction, setShowEtaPrediction] = useState(false)
  const { predict, data: etaPrediction, loading: predictingEta, error } = useETAPrediction()

  // Demo shipment data
  useEffect(() => {
    const demoShipment: ShipmentData = {
      tracking_code: 'ARM-2026-03-000127',
      sender: 'Supplier Komputer Mega',
      recipient: 'PT Digital Indonesia',
      weight: '320 kg',
      priority: 'High',
      status: 'Out for Delivery',
      date: '2026-03-27',
      current_location: 'Jakarta - Kuningan',
      remaining_distance_km: 45.5,
      remaining_stops: 3,
      current_speed_kmh: 65,
      traffic_factor: 1.2,
    }
    setShipment(demoShipment)
  }, [])

  const handlePredictEta = async () => {
    if (!shipment) return

    try {
      await predict(
        shipment.remaining_distance_km,
        shipment.remaining_stops,
        shipment.traffic_factor
      )
      setShowEtaPrediction(true)
    } catch (err) {
      console.error('ETA prediction failed:', err)
    }
  }

  if (!shipment) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
            <p className="text-sm text-slate-500">Loading shipment...</p>
          </div>
        </div>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    'Out for Delivery': 'bg-blue-50 text-blue-700 border-blue-200',
    Delivered: 'bg-green-50 text-green-700 border-green-200',
    'In Transit': 'bg-amber-50 text-amber-700 border-amber-200',
    Pending: 'bg-slate-50 text-slate-700 border-slate-200',
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Tracking Number</p>
            <p className="mt-1 font-mono text-lg font-bold text-slate-800">
              {shipment.tracking_code}
            </p>
          </div>
          <div
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${statusColors[shipment.status] || statusColors['In Transit']}`}
          >
            {shipment.status}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500">From</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{shipment.sender}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">To</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{shipment.recipient}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Weight</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{shipment.weight}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Priority</p>
            <span
              className={`mt-1 inline-block rounded px-2 py-1 text-xs font-semibold ${
                shipment.priority === 'High'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {shipment.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Current Status & Location */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-800">Current Status</h3>

        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <MapPin size={16} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">Current Location</p>
              <p className="mt-0.5 text-sm text-slate-600">{shipment.current_location}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
              <Truck size={16} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">Current Speed</p>
              <p className="mt-0.5 text-sm text-slate-600">{shipment.current_speed_kmh} km/h</p>
            </div>
          </div>
        </div>
      </div>

      {/* ETA Prediction Section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Estimated Arrival</h3>
          {!showEtaPrediction && (
            <button
              onClick={handlePredictEta}
              disabled={predictingEta}
              className="rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:bg-slate-400"
            >
              {predictingEta ? 'Calculating...' : 'Predict ETA'}
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">⚠️ {error}</p>
          </div>
        )}

        {showEtaPrediction && etaPrediction ? (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <Clock size={20} className="mt-0.5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm text-green-700">Estimated Time Until Delivery</p>
                  <p className="mt-1 text-3xl font-bold text-green-900">
                    {Math.floor(etaPrediction.estimated_minutes / 60)}h{' '}
                    {etaPrediction.estimated_minutes % 60}m
                  </p>
                  <p className="mt-1 text-xs text-green-600">
                    Confidence: {Math.round(etaPrediction.confidence * 100)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-600">Remaining Distance</p>
                <p className="mt-1 text-lg font-bold text-slate-800">
                  {shipment.remaining_distance_km} km
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-600">Remaining Stops</p>
                <p className="mt-1 text-lg font-bold text-slate-800">{shipment.remaining_stops}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-600">Current Speed</p>
                <p className="mt-1 text-lg font-bold text-slate-800">
                  {shipment.current_speed_kmh} km/h
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-600">Traffic Factor</p>
                <p className="mt-1 text-lg font-bold text-slate-800">
                  {shipment.traffic_factor.toFixed(1)}x
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-medium text-amber-700">💡 Tip</p>
              <p className="mt-1 text-xs text-amber-700">
                ETA is based on current distance, stops, and traffic conditions. It may vary based
                on real-time updates.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-8">
            <div className="text-center">
              <Clock size={24} className="mx-auto mb-2 text-slate-400" />
              <p className="text-sm text-slate-500">
                Click "Predict ETA" to see estimated arrival time
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Timeline */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-800">Delivery Timeline</h3>

        <div className="mt-4 space-y-3">
          {[
            {
              time: '2026-03-27 10:00',
              status: 'Picked up',
              location: 'Supplier Komputer Mega',
              completed: true,
            },
            {
              time: '2026-03-27 14:30',
              status: 'In transit',
              location: 'Jakarta Selatan',
              completed: true,
            },
            {
              time: '2026-03-27 16:00',
              status: 'Out for delivery',
              location: 'Jakarta - Kuningan',
              completed: true,
            },
            {
              time: '2026-03-27 ~17:15',
              status: 'Delivered',
              location: 'PT Digital Indonesia',
              completed: false,
            },
          ].map((event, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    event.completed ? 'bg-emerald-100' : 'bg-slate-100'
                  }`}
                >
                  {event.completed ? (
                    <CheckCircle size={16} className="text-emerald-600" />
                  ) : (
                    <AlertCircle size={16} className="text-slate-400" />
                  )}
                </div>
                {idx < 3 && <div className="mt-1 h-8 w-0.5 bg-slate-200" />}
              </div>
              <div className="flex-1 pb-3">
                <p className="text-sm font-medium text-slate-800">{event.status}</p>
                <p className="text-xs text-slate-500">{event.location}</p>
                <p className="mt-1 text-xs text-slate-400">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
