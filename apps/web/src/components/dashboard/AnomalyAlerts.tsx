/**
 * Komponen untuk menampilkan anomali yang terdeteksi
 * @location apps/web/src/components/dashboard/AnomalyAlerts.tsx
 */
'use client'

import { useEffect } from 'react'
import { useAnomalyDetection } from '@/hooks/useAnomalyDetection'
import { AnomalyResult } from '@/lib/ai-client'

const severityColors: Record<string, string> = {
  low: 'bg-blue-50 border-blue-200 text-blue-800',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  high: 'bg-red-50 border-red-200 text-red-800',
}

const severityBadges: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
}

const anomalyIcons: Record<string, string> = {
  gps_silent: '📍',
  route_deviation: '🛣️',
  late_delivery: '⏱️',
  speed_anomaly: '⚡',
}

interface AnomalyAlertsProps {
  vehicleId: string
  lastGpsMinutesAgo: number
  deviation_km?: number
  eta_overdue_minutes?: number
  speed_kmh?: number
  onAnomalyDetected?: (anomalies: AnomalyResult[]) => void
}

export function AnomalyAlerts({
  vehicleId,
  lastGpsMinutesAgo,
  deviation_km,
  eta_overdue_minutes,
  speed_kmh,
  onAnomalyDetected,
}: AnomalyAlertsProps) {
  const { anomalies, loading, error, detect } = useAnomalyDetection()

  useEffect(() => {
    const detectAnomalies = async () => {
      try {
        const result = await detect(vehicleId, lastGpsMinutesAgo, {
          deviation_km,
          eta_overdue_minutes,
          speed_kmh,
        })
        onAnomalyDetected?.(result)
      } catch (err) {
        console.error('Failed to detect anomalies:', err)
      }
    }

    detectAnomalies()
  }, [
    vehicleId,
    lastGpsMinutesAgo,
    deviation_km,
    eta_overdue_minutes,
    speed_kmh,
    detect,
    onAnomalyDetected,
  ])

  if (loading) {
    return (
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-sm text-gray-500">Menganalisis kendaraan...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    )
  }

  if (anomalies.length === 0) {
    return (
      <div className="rounded-lg bg-green-50 p-4">
        <p className="text-sm text-green-800">✓ Tidak ada anomali yang terdeteksi</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {anomalies.map((anomaly, idx) => (
        <div
          key={idx}
          className={`rounded-lg border-2 px-4 py-3 ${severityColors[anomaly.severity]}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-2">
              <span className="text-lg">{anomalyIcons[anomaly.anomaly_type]}</span>
              <div>
                <p className="font-semibold capitalize">{anomaly.anomaly_type.replace('_', ' ')}</p>
                <p className="text-sm">{anomaly.description}</p>
              </div>
            </div>
            <div className="flex gap-2 text-right">
              <span
                className={`rounded px-2 py-1 text-xs font-semibold ${severityBadges[anomaly.severity]}`}
              >
                {anomaly.severity.toUpperCase()}
              </span>
              <span className="text-xs opacity-75">{Math.round(anomaly.confidence * 100)}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
