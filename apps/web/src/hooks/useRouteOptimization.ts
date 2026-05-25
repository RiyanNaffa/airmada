/**
 * Hook untuk mengoptimasi rute
 * @location apps/web/src/hooks/useRouteOptimization.ts
 */
'use client'

import { useState, useCallback } from 'react'
import { optimizeRoute, Coordinate, OptimizeRouteResponse } from '@/lib/ai-client'

export function useRouteOptimization() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<OptimizeRouteResponse | null>(null)

  const optimize = useCallback(async (origin: Coordinate, destinations: Coordinate[]) => {
    try {
      setLoading(true)
      setError(null)

      if (!destinations.length) {
        throw new Error('Minimal harus ada 1 destinasi')
      }

      const result = await optimizeRoute({ origin, destinations })
      setData(result)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Optimasi rute gagal'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, data, optimize }
}
