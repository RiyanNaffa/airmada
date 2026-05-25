/**
 * Hook untuk deteksi anomali
 * @location apps/web/src/hooks/useAnomalyDetection.ts
 */
'use client'

import { useState, useCallback } from 'react'
import { detectAnomalies, DetectAnomalyResponse, AnomalyResult } from '@/lib/ai-client'

export function useAnomalyDetection() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [anomalies, setAnomalies] = useState<AnomalyResult[]>([])

  const detect = useCallback(
    async (
      vehicle_id: string,
      last_gps_minutes_ago: number,
      options?: {
        deviation_km?: number
        eta_overdue_minutes?: number
        speed_kmh?: number
      }
    ) => {
      try {
        setLoading(true)
        setError(null)

        const result: DetectAnomalyResponse = await detectAnomalies({
          vehicle_id,
          last_gps_minutes_ago,
          ...options,
        })

        setAnomalies(result.anomalies)
        return result.anomalies
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Deteksi anomali gagal'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Helper untuk mendapatkan anomali dengan severity tertentu
  const getByType = useCallback(
    (type: string) => anomalies.filter((a) => a.anomaly_type === type),
    [anomalies]
  )

  const getBySeverity = useCallback(
    (severity: 'low' | 'medium' | 'high') => anomalies.filter((a) => a.severity === severity),
    [anomalies]
  )

  const hasHighSeverity = anomalies.some((a) => a.severity === 'high')

  return {
    loading,
    error,
    anomalies,
    detect,
    getByType,
    getBySeverity,
    hasHighSeverity,
  }
}
