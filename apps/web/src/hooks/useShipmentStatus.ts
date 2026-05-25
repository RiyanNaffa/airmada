/**
 * Hook untuk update status paket dari sisi driver (mobile-friendly).
 * Mengelola loading state, validasi FSM, dan optimistic update.
 *
 * @location apps/web/src/hooks/useShipmentStatus.ts
 * TODO: PATCH /api/shipments/:id/status, handle error FSM (422)
 */
import { useState } from 'react'
import type { ShipmentStatus } from '@airmada/types'

export function useShipmentStatus(_shipmentId: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function updateStatus(_status: ShipmentStatus, _note?: string) {
    setLoading(true)
    setError(null)
    try {
      // TODO: fetch PATCH /api/shipments/${shipmentId}/status
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return { updateStatus, loading, error }
}
