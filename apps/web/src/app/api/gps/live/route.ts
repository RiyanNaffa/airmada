/**
 * API Route: GET /api/gps/live
 *
 * Fetch latest GPS positions of all active vehicles
 * Used by MANAGER/DISPATCHER to monitor driver locations
 *
 * @location apps/web/src/app/api/gps/live/route.ts
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

export async function GET(req: NextRequest) {
  try {
    // Get user from authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - missing Bearer token' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    // Verify user is manager or dispatcher
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Failed to authenticate user' }, { status: 401 })
    }

    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (
      userDataError ||
      !userData ||
      (userData.role !== 'manager' && userData.role !== 'dispatcher')
    ) {
      return NextResponse.json(
        { error: 'Forbidden - only managers and dispatchers can view live positions' },
        { status: 403 }
      )
    }

    // Fetch latest GPS position for each active vehicle
    // Group by vehicle_id and get the most recent record
    const { data: latestGpsLogs, error: gpsError } = await supabase
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
          users:user_id (
            full_name
          ),
          vehicle_id
        ),
        vehicles:vehicle_id (
          plate_number
        )
      `
      )
      .order('recorded_at', { ascending: false })
      .limit(1000) // Get recent records to filter unique vehicles

    if (gpsError) {
      console.error('Error fetching GPS logs:', gpsError)
      return NextResponse.json({ error: 'Failed to fetch GPS data' }, { status: 500 })
    }

    // Map results and get latest position per vehicle
    const vehiclePositions: Record<string, VehiclePosition> = {}

    if (latestGpsLogs && Array.isArray(latestGpsLogs)) {
      for (const log of latestGpsLogs) {
        if (!vehiclePositions[log.vehicle_id]) {
          const vehicle = Array.isArray(log.vehicles) ? log.vehicles[0] : log.vehicles
          const driver = Array.isArray(log.drivers) ? log.drivers[0] : log.drivers
          const driverUser = driver?.users as any
          const driverName = Array.isArray(driverUser)
            ? driverUser[0]?.full_name
            : driverUser?.full_name

          vehiclePositions[log.vehicle_id] = {
            vehicle_id: log.vehicle_id,
            driver_id: log.driver_id,
            plate_number: vehicle?.plate_number || 'Unknown',
            driver_name: driverName || 'Unknown Driver',
            lat: parseFloat(log.lat),
            lng: parseFloat(log.lng),
            speed_kmh: parseFloat(log.speed_kmh || 0),
            heading: parseFloat(log.heading || 0),
            recorded_at: log.recorded_at,
          }
        }
      }
    }

    const positions = Object.values(vehiclePositions)

    return NextResponse.json(
      {
        success: true,
        count: positions.length,
        data: positions,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in GET /api/gps/live:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
