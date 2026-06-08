/**
 * Hook: useRealtimeGPS
 * * Subscribes to real-time GPS updates via Supabase Realtime safely.
 * Only shows drivers who are currently ON_DUTY.
 * * @location apps/web/src/hooks/useRealtimeGPS.ts
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import { useFleetStore } from '@/store/useFleetStore'
import { createClient } from '@supabase/supabase-js'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'

interface VehiclePosition {
  vehicle_id: string
  driver_id: string
  plate_number: string
  driver_name: string
  lat: number
  lng: number
  speed_kmh: number
  heading: number
  recorded_at: string
}

interface UseRealtimeGpsOptions {
  enabled?: boolean
}

export function useRealtimeGPS(options: UseRealtimeGpsOptions = {}) {
  const { enabled = true } = options
  const [positions, setPositions] = useState<VehiclePosition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // SOLUSI: Amankan fungsi store menggunakan Ref agar tidak memicu re-subscribe terus-menerus
  const { updatePosition } = useFleetStore()
  const updatePositionRef = useRef(updatePosition)

  useEffect(() => {
    updatePositionRef.current = updatePosition
  }, [updatePosition])

  useEffect(() => {
    if (!enabled) return

    let mounted = true

    const setupRealtimeSubscription = async () => {
      try {
        let accessToken: string | null = null
        let currentUserId: string | null = null
        let userRole: string | null = null

        try {
          const sessionData = sessionStorage.getItem('user_session')
          if (sessionData) {
            const session = JSON.parse(sessionData)
            accessToken = session.access_token
            currentUserId = session.user?.id
            userRole = session.user?.role
          }
        } catch (error) {
          console.warn('Failed to parse session data:', error)
        }

        if (!accessToken || !currentUserId) {
          setError('Not authenticated')
          setLoading(false)
          return
        }

        if (
          !userRole ||
          (userRole !== 'MANAGER' &&
            userRole !== 'DISPATCHER' &&
            userRole !== 'manager' &&
            userRole !== 'dispatcher')
        ) {
          setError('Forbidden - only managers and dispatchers can view live positions')
          setLoading(false)
          return
        }

        // Buat client standar tanpa menaruh token di global headers
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
          { auth: { persistSession: false } }
        )

        // SOLUSI UTAMA: Set session secara eksplisit agar WebSocket terautentikasi dan menembus RLS
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: '',
        })

        // Ambil data awal (Hanya yang berstatus ON_DUTY)
        await fetchInitialPositions(
          supabase,
          mounted,
          setPositions,
          setError,
          setLoading,
          updatePositionRef
        )

        // Daftarkan channel realtime
        const channel = supabase
          .channel('gps_logs_realtime_stream')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'gps_logs' },
            (payload) => {
              if (!mounted) return
              fetchVehicleDetails(supabase, payload.new, setPositions, updatePositionRef)
            }
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'gps_logs' },
            (payload) => {
              if (!mounted) return
              fetchVehicleDetails(supabase, payload.new, setPositions, updatePositionRef)
            }
          )
          // Dengarkan juga perubahan tabel drivers (jika driver logout/off-duty langsung hilangkan dari peta)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'drivers' },
            (payload) => {
              if (!mounted) return
              const updatedDriver = payload.new as any
              if (updatedDriver.status !== 'ON_DUTY' && updatedDriver.status !== 'on_duty') {
                setPositions((prev) => prev.filter((p) => p.driver_id !== updatedDriver.id))
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('✓ [REALTIME] Berhasil terhubung & terautentikasi dengan RLS')
              setError(null)
            } else if (status === 'CHANNEL_ERROR') {
              setError('Gagal berlangganan update realtime. Periksa RLS Supabase.')
            }
          })

        channelRef.current = channel
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error')
          setLoading(false)
        }
      }
    }

    setupRealtimeSubscription()

    return () => {
      mounted = false
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
    }
  }, [enabled]) // Bersih dari dependency updatePosition yang merusak siklus subscription

  return { positions, loading, error }
}

async function fetchInitialPositions(
  supabase: SupabaseClient,
  mounted: boolean,
  setPositions: (pos: VehiclePosition[]) => void,
  setError: (err: string | null) => void,
  setLoading: (loading: boolean) => void,
  updatePositionRef: React.MutableRefObject<(vehicleId: string, data: any) => void>
) {
  try {
    const { data: latestGpsLogs, error: gpsError } = await supabase
      .from('gps_logs')
      .select(
        `
        id, vehicle_id, driver_id, lat, lng, speed_kmh, heading, recorded_at,
        drivers:driver_id ( id, user_id, status, users:user_id ( full_name ) ),
        vehicles:vehicle_id ( plate_number )
      `
      )
      .order('recorded_at', { ascending: false })
      .limit(500)

    if (gpsError) throw gpsError
    if (!mounted) return

    const vehiclePositions: Record<string, VehiclePosition> = {}

    if (latestGpsLogs && Array.isArray(latestGpsLogs)) {
      for (const log of latestGpsLogs) {
        if (!vehiclePositions[log.vehicle_id]) {
          const vehicle = Array.isArray(log.vehicles) ? log.vehicles[0] : log.vehicles
          const driver = Array.isArray(log.drivers) ? log.drivers[0] : log.drivers

          if (!driver || (driver.status !== 'ON_DUTY' && driver.status !== 'on_duty')) continue

          const driverUser = driver?.users as any
          const driverName = Array.isArray(driverUser)
            ? driverUser[0]?.full_name
            : driverUser?.full_name

          const posData = {
            vehicle_id: log.vehicle_id,
            driver_id: log.driver_id,
            plate_number: vehicle?.plate_number || 'Unknown',
            driver_name: driverName || 'Unknown Driver',
            lat: parseFloat(log.lat as any),
            lng: parseFloat(log.lng as any),
            speed_kmh: parseFloat((log.speed_kmh as any) || 0),
            heading: parseFloat((log.heading as any) || 0),
            recorded_at: log.recorded_at,
          }

          vehiclePositions[log.vehicle_id] = posData
          updatePositionRef.current(log.vehicle_id, { ...posData, updated_at: log.recorded_at })
        }
      }
    }

    setPositions(Object.values(vehiclePositions))
    setError(null)
    setLoading(false)
  } catch (err) {
    if (mounted) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }
}

async function fetchVehicleDetails(
  supabase: SupabaseClient,
  gpsLog: any,
  setPositions: (callback: (prev: VehiclePosition[]) => VehiclePosition[]) => void,
  updatePositionRef: React.MutableRefObject<(vehicleId: string, data: any) => void>
) {
  try {
    const { data: log, error } = await supabase
      .from('gps_logs')
      .select(
        `
        id, vehicle_id, driver_id, lat, lng, speed_kmh, heading, recorded_at,
        drivers:driver_id ( id, user_id, status, users:user_id ( full_name ) ),
        vehicles:vehicle_id ( plate_number )
      `
      )
      .eq('id', gpsLog.id)
      .single()

    if (error || !log) return

    const vehicle = Array.isArray(log.vehicles) ? log.vehicles[0] : log.vehicles
    const driver = Array.isArray(log.drivers) ? log.drivers[0] : log.drivers

    if (!driver || (driver.status !== 'ON_DUTY' && driver.status !== 'on_duty')) {
      setPositions((prev) => prev.filter((p) => p.vehicle_id !== log.vehicle_id))
      return
    }

    const driverUser = driver?.users as any
    const driverName = Array.isArray(driverUser) ? driverUser[0]?.full_name : driverUser?.full_name

    const newPosition: VehiclePosition = {
      vehicle_id: log.vehicle_id,
      driver_id: log.driver_id,
      plate_number: vehicle?.plate_number || 'Unknown',
      driver_name: driverName || 'Unknown Driver',
      lat: parseFloat(log.lat as any),
      lng: parseFloat(log.lng as any),
      speed_kmh: parseFloat((log.speed_kmh as any) || 0),
      heading: parseFloat((log.heading as any) || 0),
      recorded_at: log.recorded_at,
    }

    setPositions((prev) => {
      const updated = [...prev]
      const index = updated.findIndex((p) => p.vehicle_id === log.vehicle_id)
      if (index >= 0) {
        updated[index] = newPosition
      } else {
        updated.push(newPosition)
      }
      return updated
    })

    updatePositionRef.current(log.vehicle_id, { ...newPosition, updated_at: log.recorded_at })
  } catch (err) {
    console.error('Error fetching vehicle details realtime:', err)
  }
}
