/**
 * Hook: useRealtimeGPS
 *
 * Subscribes to real-time GPS updates via Supabase Realtime
 * Automatically updates when drivers publish new locations
 *
 * @location apps/web/src/hooks/useRealtimeGPS.ts
 *
 * Usage:
 *   const { positions, loading, error } = useRealtimeGPS()
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
  /**
   * Enable automatic subscription
   * @default true
   */
  enabled?: boolean
}

export function useRealtimeGPS(options: UseRealtimeGpsOptions = {}) {
  const { enabled = true } = options
  const [positions, setPositions] = useState<VehiclePosition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const { updatePosition } = useFleetStore()

  useEffect(() => {
    if (!enabled) return

    let mounted = true

    const setupRealtimeSubscription = async () => {
      try {
        // Get auth token and user info from session storage
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

        // Verify user is manager or dispatcher
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

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
          {
            global: {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
            // auth: {
            //   persistSession: false,
            // },
          }
        )
        // supabase.realtime.setAuth(accessToken)

        // Fetch initial data
        await fetchInitialPositions(
          supabase,
          mounted,
          setPositions,
          setError,
          setLoading,
          updatePosition
        )

        // Set up realtime subscription
        const channel = supabase
          .channel('gps_logs_realtime', {
            config: {
              broadcast: { self: false },
              presence: { key: 'user' },
            },
          })
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'gps_logs',
            },
            (payload) => {
              if (!mounted) return

              const newLog = payload.new as any

              // Fetch full vehicle and driver info
              fetchVehicleDetails(supabase, newLog, setPositions, updatePosition)
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'gps_logs',
            },
            (payload) => {
              if (!mounted) return

              const updatedLog = payload.new as any

              // Update position
              fetchVehicleDetails(supabase, updatedLog, setPositions, updatePosition)
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'drivers',
            },
            async (payload) => {
              if (!mounted) return
              const updatedDriver = payload.new as any

              // Jika status berubah menjadi selain ON_DUTY, langsung depak dari peta live
              if (updatedDriver.status !== 'ON_DUTY' && updatedDriver.status !== 'on_duty') {
                setPositions((prev) => prev.filter((p) => p.driver_id !== updatedDriver.id))
              } else {
                // Jika driver kembali ON_DUTY, tarik koordinat terakhirnya agar muncul lagi di peta
                fetchLatestLogForDriver(supabase, updatedDriver.id, setPositions, updatePosition)
              }
            }
          )
          .subscribe((status, err) => {
            console.log('=== DEBUG STATUS REALTIME ===:', status)
            if (err) {
              console.error('=== DETAIL ERROR REALTIME ===:', err)
            }

            if (status === 'SUBSCRIBED') {
              console.log('Subscribed to GPS realtime updates')
              setError(null)
            } else if (status === 'CHANNEL_ERROR') {
              setError('Failed to subscribe to realtime updates')
            } else if (status === 'CLOSED') {
              console.log('Realtime connection closed')
            }
          })

        channelRef.current = channel
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error'
          setError(errorMessage)
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
  }, [enabled, updatePosition])

  return { positions, loading, error }
}

/**
 * Fetch initial GPS positions
 */
async function fetchInitialPositions(
  supabase: SupabaseClient<any, any, any, any, any>,
  mounted: boolean,
  setPositions: (pos: VehiclePosition[]) => void,
  setError: (err: string | null) => void,
  setLoading: (loading: boolean) => void,
  updatePosition: (vehicleId: string, data: any) => void
) {
  try {
    const { data: latestGpsLogs, error: gpsError } = await supabase
      .from('gps_logs')
      .select(
        `
        id,
        vehicle_id,
        driver_id,
        lat,
        lng,
        speed_kmh,
        heading,
        recorded_at,
        drivers:driver_id (
          id,
          user_id,
          status,
          users:users!drivers_user_id_fkey (
            full_name
          )
        ),
        vehicles:vehicle_id (
          plate_number
        )
      `
      )
      .order('recorded_at', { ascending: false })
      .limit(1000)

    if (gpsError) {
      // console.error('🚨 GAGAL AMBIL DATA POSISI AWAL:', gpsError)
      throw gpsError
    }

    if (!mounted) return

    // Get latest position per vehicle
    const vehiclePositions: Record<string, VehiclePosition> = {}

    if (latestGpsLogs && Array.isArray(latestGpsLogs)) {
      for (const log of latestGpsLogs) {
        if (!vehiclePositions[log.vehicle_id]) {
          const vehicle = Array.isArray(log.vehicles) ? log.vehicles[0] : log.vehicles
          const driver = Array.isArray(log.drivers) ? log.drivers[0] : log.drivers
          if (!driver || (driver.status !== 'ON_DUTY' && driver.status !== 'on_duty')) {
            continue
          }
          const driverUser = driver?.users as any
          const driverName = Array.isArray(driverUser)
            ? driverUser[0]?.full_name
            : driverUser?.full_name

          vehiclePositions[log.vehicle_id] = {
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

          // Update fleet store
          updatePosition(log.vehicle_id, {
            vehicle_id: log.vehicle_id,
            plate_number: vehicle?.plate_number || 'Unknown',
            driver_name: driverName || 'Unknown Driver',
            lat: parseFloat(log.lat as any),
            lng: parseFloat(log.lng as any),
            speed_kmh: parseFloat((log.speed_kmh as any) || 0),
            heading: parseFloat((log.heading as any) || 0),
            updated_at: log.recorded_at,
          })
        }
      }
    }

    const positions = Object.values(vehiclePositions)
    setPositions(positions)
    setError(null)
    setLoading(false)
  } catch (err) {
    if (mounted) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
    }
  }
}

/**
 * Fetch vehicle details for a GPS log
 */
async function fetchVehicleDetails(
  supabase: SupabaseClient<any, any, any, any, any>,
  gpsLog: any,
  setPositions: (callback: (prev: VehiclePosition[]) => VehiclePosition[]) => void,
  updatePosition: (vehicleId: string, data: any) => void
) {
  try {
    const { data: log, error } = await supabase
      .from('gps_logs')
      .select(
        `
        vehicle_id,
        driver_id,
        lat,
        lng,
        speed_kmh,
        heading,
        recorded_at,
        drivers:driver_id (
          id,
          user_id,
          status,
          users:users!drivers_user_id_fkey (
            full_name
          )
        ),
        vehicles:vehicle_id (
          plate_number
        )
      `
      )
      .eq('id', gpsLog.id)
      .single()

    if (error || !log) {
      // console.error('🚨 REALTIME MASUK, TAPI GAGAL AMBIL DETAIL RELASI:', error)
      return
    }

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

    // Update state
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

    // Update fleet store
    updatePosition(log.vehicle_id, {
      ...newPosition,
    })
  } catch (err) {
    console.error('Error fetching vehicle details:', err)
  }
}

/**
 * Helper: Ambil log koordinat terakhir saat driver kembali ON_DUTY
 */
async function fetchLatestLogForDriver(
  supabase: SupabaseClient<any, any, any, any, any>,
  driverId: string,
  setPositions: (callback: (prev: VehiclePosition[]) => VehiclePosition[]) => void,
  updatePosition: (vehicleId: string, data: any) => void
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
      .eq('driver_id', driverId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !log) return
    const driver = Array.isArray(log.drivers) ? log.drivers[0] : log.drivers
    if (!driver || (driver.status !== 'ON_DUTY' && driver.status !== 'on_duty')) return

    const vehicle = Array.isArray(log.vehicles) ? log.vehicles[0] : log.vehicles
    const driverUser = driver?.users as any
    const driverName = Array.isArray(driverUser) ? driverUser[0]?.full_name : driverUser?.full_name

    const newPosition = {
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
      const updated = [...prev].filter((p) => p.vehicle_id !== log.vehicle_id)
      updated.push(newPosition)
      return updated
    })

    updatePosition(log.vehicle_id, { ...newPosition, updated_at: log.recorded_at })
  } catch (e) {
    console.error(e)
  }
}
