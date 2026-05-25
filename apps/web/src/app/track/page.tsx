'use client'

import { useState } from 'react'
import { MapPin, Clock, TrendingUp, AlertCircle, X } from 'lucide-react'
import { useETAPrediction } from '@/hooks/useETAPrediction'
import { PredictETAResponse } from '@/lib/ai-client'

// Sample shipment data for demo
const SAMPLE_SHIPMENT = {
  id: 'ARM-2026-05-000001',
  sender: 'PT Maju Jaya',
  recipient: 'CV Sejahtera Abadi',
  weight: '450 kg',
  volume: '2.5 m³',
  status: 'In Transit',
  priority: 'High',
  current_location: 'Jakarta - Bogor Highway',
  current_speed: 65,
  distance_km: 42.5,
  stops_remaining: 3,
  created_at: '2026-05-22 08:00',
  timeline: [
    { label: 'Pending', time: '2026-05-22 08:00', done: true },
    { label: 'Picked Up', time: '2026-05-22 10:30', done: true },
    { label: 'In Transit', time: '2026-05-22 14:00', done: true, current: true },
    { label: 'Out for Delivery', done: false },
    { label: 'Delivered', done: false },
  ],
}

const StatusBadge = ({ text }: { text: string }) => {
  const color =
    text === 'Delivered'
      ? 'bg-emerald-50 text-emerald-600'
      : text === 'Pending'
        ? 'bg-yellow-50 text-yellow-600'
        : text === 'In Transit'
          ? 'bg-blue-50 text-blue-600'
          : 'bg-slate-100 text-slate-600'

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${color}`}>
      {text}
    </span>
  )
}

export default function TrackingPage() {
  const { predict, loading, error } = useETAPrediction()
  const [etaResult, setEtaResult] = useState<PredictETAResponse | null>(null)
  const [showETA, setShowETA] = useState(false)

  const handlePredictETA = async () => {
    setShowETA(true)
    const result = await predict(
      SAMPLE_SHIPMENT.distance_km,
      SAMPLE_SHIPMENT.stops_remaining,
      SAMPLE_SHIPMENT.current_speed / 35 // traffic factor based on current speed vs average
    )
    setEtaResult(result)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* HEADER */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-screen-lg space-y-4 px-6 py-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Shipment Tracking</h1>
            <p className="mt-1 text-slate-600">
              Track your package in real-time with AI-powered ETA
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-lg space-y-6 px-6 py-8">
        {/* SHIPMENT INFO CARD */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Shipment ID</p>
              <h2 className="text-2xl font-bold text-slate-900">{SAMPLE_SHIPMENT.id}</h2>
            </div>
            <StatusBadge text={SAMPLE_SHIPMENT.status} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* FROM */}
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-blue-600" />
                <p className="text-sm font-medium text-blue-600">From</p>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-800">{SAMPLE_SHIPMENT.sender}</p>
              <p className="text-xs text-slate-600">Sender</p>
            </div>

            {/* TO */}
            <div className="rounded-lg bg-emerald-50 p-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-emerald-600" />
                <p className="text-sm font-medium text-emerald-600">To</p>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-800">
                {SAMPLE_SHIPMENT.recipient}
              </p>
              <p className="text-xs text-slate-600">Recipient</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">Weight</p>
              <p className="text-lg font-semibold text-slate-800">{SAMPLE_SHIPMENT.weight}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Volume</p>
              <p className="text-lg font-semibold text-slate-800">{SAMPLE_SHIPMENT.volume}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Distance</p>
              <p className="text-lg font-semibold text-slate-800">
                {SAMPLE_SHIPMENT.distance_km} km
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Priority</p>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  SAMPLE_SHIPMENT.priority === 'High'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-blue-50 text-blue-600'
                }`}
              >
                {SAMPLE_SHIPMENT.priority}
              </span>
            </div>
          </div>
        </div>

        {/* CURRENT LOCATION */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Current Location</h3>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {SAMPLE_SHIPMENT.current_location}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Speed: {SAMPLE_SHIPMENT.current_speed} km/h • Stops remaining:{' '}
                {SAMPLE_SHIPMENT.stops_remaining}
              </p>
            </div>

            {/* PREDICT ETA BUTTON */}
            <button
              onClick={handlePredictETA}
              disabled={loading}
              className="flex flex-shrink-0 items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-600 disabled:opacity-50"
            >
              <TrendingUp size={16} />
              {loading ? 'Predicting...' : 'Predict ETA'}
            </button>
          </div>
        </div>

        {/* ETA PREDICTION RESULT */}
        {showETA && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                  <Clock size={20} className="text-orange-500" />
                  ETA Prediction
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowETA(false)
                  setEtaResult(null)
                }}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
                  <p className="text-sm text-slate-500">Calculating estimated arrival...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="mt-0.5 text-red-600" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {etaResult && !loading && (
              <div className="space-y-4">
                {/* ETA DISPLAY */}
                <div className="rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50 p-6">
                  <p className="text-sm font-medium text-orange-600">Estimated Arrival</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900">
                      {etaResult.estimated_minutes}
                    </span>
                    <span className="text-lg text-slate-600">minutes</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Expected delivery: ~
                    {new Date(
                      Date.now() + etaResult.estimated_minutes * 60000
                    ).toLocaleTimeString()}
                  </p>
                  {etaResult.confidence && (
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex-1 overflow-hidden rounded-full bg-white/50">
                        <div
                          className="h-2 bg-gradient-to-r from-orange-400 to-yellow-400"
                          style={{ width: `${etaResult.confidence * 100}%` }}
                        />
                      </div>
                      <p className="text-xs font-semibold text-slate-600">
                        {Math.round(etaResult.confidence * 100)}% Confidence
                      </p>
                    </div>
                  )}
                </div>

                {/* DELIVERY TIMELINE */}
                <div>
                  <h4 className="mb-4 text-sm font-semibold text-slate-800">Delivery Timeline</h4>
                  <div className="space-y-3">
                    {SAMPLE_SHIPMENT.timeline.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        {/* Timeline marker */}
                        <div className="relative mt-1 flex flex-col items-center">
                          <div
                            className={`h-3 w-3 rounded-full ${
                              step.done
                                ? 'bg-emerald-500'
                                : step.current
                                  ? 'bg-orange-500'
                                  : 'bg-slate-300'
                            }`}
                          />
                          {idx < SAMPLE_SHIPMENT.timeline.length - 1 && (
                            <div className="mt-1 h-6 w-0.5 bg-slate-200" />
                          )}
                        </div>

                        {/* Timeline content */}
                        <div className="pb-2">
                          <p
                            className={`text-sm font-semibold ${
                              step.done ? 'text-slate-700' : 'text-slate-600'
                            }`}
                          >
                            {step.label}
                          </p>
                          {step.time && <p className="text-xs text-slate-500">{step.time}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* METRICS */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-xs text-blue-600">Distance</p>
                    <p className="mt-1 text-lg font-semibold text-slate-800">
                      {SAMPLE_SHIPMENT.distance_km} km
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-4">
                    <p className="text-xs text-purple-600">Stops</p>
                    <p className="mt-1 text-lg font-semibold text-slate-800">
                      {SAMPLE_SHIPMENT.stops_remaining} remaining
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TIMELINE PREVIEW */}
        {!showETA && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-800">Shipment Timeline</h3>
            <div className="space-y-3">
              {SAMPLE_SHIPMENT.timeline.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  {/* Timeline marker */}
                  <div className="relative mt-1 flex flex-col items-center">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        step.done
                          ? 'bg-emerald-500'
                          : step.current
                            ? 'bg-orange-500'
                            : 'bg-slate-300'
                      }`}
                    />
                    {idx < SAMPLE_SHIPMENT.timeline.length - 1 && (
                      <div className="mt-1 h-6 w-0.5 bg-slate-200" />
                    )}
                  </div>

                  {/* Timeline content */}
                  <div className="pb-2">
                    <p
                      className={`text-sm font-semibold ${step.done ? 'text-slate-700' : 'text-slate-600'}`}
                    >
                      {step.label}
                    </p>
                    {step.time && <p className="text-xs text-slate-500">{step.time}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
