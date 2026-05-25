/**
 * Example integration page untuk AI Service features
 * @location apps/web/src/components/dashboard/AIIntegrationDemo.tsx
 *
 * Halaman ini mendemonstrasikan penggunaan ketiga fitur AI:
 * 1. Route Optimization (TSP)
 * 2. ETA Prediction
 * 3. Anomaly Detection
 */
'use client'

import { useState } from 'react'
import { useRouteOptimization } from '@/hooks/useRouteOptimization'
import { useETAPrediction } from '@/hooks/useETAPrediction'
import { useAnomalyDetection } from '@/hooks/useAnomalyDetection'
import { Coordinate } from '@/lib/ai-client'
import { RouteOptimizationResult } from './RouteOptimizationResult'
import { AnomalyAlerts } from './AnomalyAlerts'

export function AIIntegrationDemo() {
  const {
    optimize: optimizeRoute,
    loading: optimizingRoute,
    data: _optimizedRoute,
  } = useRouteOptimization()
  const { predict: predictEta, loading: predictingEta, data: etaPrediction } = useETAPrediction()
  const { anomalies, loading: detectingAnomalies, detect: detectAnomalies } = useAnomalyDetection()

  const [selectedRoute, setSelectedRoute] = useState<typeof _optimizedRoute | null>(null)

  // Demo: Optimize Route
  const handleOptimizeRoute = async () => {
    try {
      const origin: Coordinate = {
        lat: -6.2088,
        lng: 106.8456,
        shipment_id: 'origin',
      }

      const destinations: Coordinate[] = [
        {
          lat: -6.1751,
          lng: 106.8228,
          shipment_id: 'SHP001',
        },
        {
          lat: -6.2155,
          lng: 106.8743,
          shipment_id: 'SHP002',
        },
        {
          lat: -6.1888,
          lng: 106.8899,
          shipment_id: 'SHP003',
        },
      ]

      const result = await optimizeRoute(origin, destinations)
      setSelectedRoute(result)
    } catch (err) {
      console.error('Optimization failed:', err)
    }
  }

  // Demo: Predict ETA
  const handlePredictEta = async () => {
    try {
      await predictEta(45.5, 3, 1.2)
    } catch (err) {
      console.error('ETA prediction failed:', err)
    }
  }

  // Demo: Detect Anomalies
  const handleDetectAnomalies = async () => {
    try {
      await detectAnomalies('VEH001', 5, {
        deviation_km: 2.5,
        eta_overdue_minutes: 15,
        speed_kmh: 120,
      })
    } catch (err) {
      console.error('Anomaly detection failed:', err)
    }
  }

  return (
    <div className="space-y-6 rounded-lg bg-white p-6">
      <h2 className="text-2xl font-bold text-gray-900">Demo Integrasi AI Service</h2>

      {/* Route Optimization Demo */}
      <section className="space-y-3 rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900">1. Optimasi Rute (TSP)</h3>
        <p className="text-sm text-gray-600">
          Mengoptimalkan rute pengiriman untuk meminimalkan jarak dan waktu tempuh.
        </p>

        <button
          onClick={handleOptimizeRoute}
          disabled={optimizingRoute}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
        >
          {optimizingRoute ? 'Mengoptimalkan...' : 'Coba Optimasi Rute'}
        </button>

        {selectedRoute && <RouteOptimizationResult result={selectedRoute} />}
      </section>

      {/* ETA Prediction Demo */}
      <section className="space-y-3 rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900">2. Prediksi ETA</h3>
        <p className="text-sm text-gray-600">
          Memprediksi waktu tiba berdasarkan jarak, stops, dan kondisi lalu lintas.
        </p>

        <button
          onClick={handlePredictEta}
          disabled={predictingEta}
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:bg-gray-400"
        >
          {predictingEta ? 'Memprediksi...' : 'Coba Prediksi ETA'}
        </button>

        {etaPrediction && (
          <div className="rounded bg-green-50 p-4">
            <p className="text-sm text-gray-600">
              Estimasi waktu tiba:{' '}
              <span className="font-bold">{etaPrediction.estimated_minutes} menit</span>
            </p>
            <p className="text-xs text-gray-500">
              Confidence: {Math.round(etaPrediction.confidence * 100)}%
            </p>
          </div>
        )}
      </section>

      {/* Anomaly Detection Demo */}
      <section className="space-y-3 rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900">3. Deteksi Anomali</h3>
        <p className="text-sm text-gray-600">
          Mendeteksi anomali pada kendaraan (GPS silent, route deviation, dll).
        </p>

        <button
          onClick={handleDetectAnomalies}
          disabled={detectingAnomalies}
          className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 disabled:bg-gray-400"
        >
          {detectingAnomalies ? 'Mendeteksi...' : 'Coba Deteksi Anomali'}
        </button>

        {anomalies.length > 0 || detectingAnomalies ? (
          <AnomalyAlerts
            vehicleId="VEH001"
            lastGpsMinutesAgo={5}
            deviation_km={2.5}
            eta_overdue_minutes={15}
            speed_kmh={120}
          />
        ) : null}
      </section>

      {/* Integration Guide */}
      <section className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h3 className="font-semibold text-amber-900">📚 Panduan Integrasi</h3>
        <ul className="space-y-2 text-sm text-amber-800">
          <li>
            ✓ Import hooks dari{' '}
            <code className="bg-white px-1">@/hooks/useRoute* , useETA*, useAnomaly*</code>
          </li>
          <li>
            ✓ Import utility dari <code className="bg-white px-1">@/lib/ai-client.ts</code>
          </li>
          <li>
            ✓ Import komponen UI dari <code className="bg-white px-1">@/components/dashboard/</code>
          </li>
          <li>
            ✓ Pastikan environment variables sudah setting:{' '}
            <code className="bg-white px-1">AI_SERVICE_URL</code>,{' '}
            <code className="bg-white px-1">AI_SERVICE_SECRET</code>
          </li>
        </ul>
      </section>
    </div>
  )
}
