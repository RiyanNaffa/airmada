/**
 * Hook untuk prediksi ETA
 * @location apps/web/src/hooks/useETAPrediction.ts
 */
'use client'

import { useState, useCallback } from 'react'
import { predictETA, PredictETAResponse } from '@/lib/ai-client'

export function useETAPrediction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<PredictETAResponse | null>(null)

  const predict = useCallback(
    async (distance_km: number, stops_remaining: number, traffic_factor = 1.0) => {
      try {
        setLoading(true)
        setError(null)

        const result = await predictETA({
          distance_km,
          stops_remaining,
          traffic_factor,
        })
        setData(result)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Prediksi ETA gagal'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { loading, error, data, predict }
}
