/**
 * Subscribe ke Supabase Realtime channel 'gps-updates'.
 * Update useFleetStore setiap ada insert baru di gps_logs.
 *
 * @location apps/web/src/hooks/useRealtimeGPS.ts
 *
 * Cara pakai:
 *   useRealtimeGPS()  // panggil di komponen level atas (layout dashboard)
 *
 * TODO: createClient().channel('gps-updates').on('postgres_changes', ...)
 */
'use client'

import { useEffect } from 'react'

export function useRealtimeGPS() {
  useEffect(() => {
    // TODO: setup Supabase Realtime subscription
    // const supabase = createClient()
    // const channel = supabase.channel('gps-updates')
    //   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gps_logs' },
    //     (payload) => useFleetStore.getState().updatePosition(...)
    //   )
    //   .subscribe()
    // return () => { supabase.removeChannel(channel) }
  }, [])
}
