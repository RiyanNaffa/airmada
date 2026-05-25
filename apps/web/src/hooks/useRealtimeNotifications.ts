/**
 * Subscribe ke Supabase Realtime channel notifikasi user saat ini.
 * Sinkronisasi dengan useNotificationStore.
 *
 * @location apps/web/src/hooks/useRealtimeNotifications.ts
 * TODO: Subscribe ke channel `notifications:{userId}`, update store saat ada INSERT baru
 */
'use client'

import { useEffect } from 'react'

export function useRealtimeNotifications(_userId?: string) {
  useEffect(() => {
    if (!_userId) return
    // TODO: Supabase Realtime subscription untuk notifications
  }, [_userId])
}
