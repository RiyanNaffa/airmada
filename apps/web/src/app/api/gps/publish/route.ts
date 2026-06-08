/**
 * API Route: POST /api/gps/publish
 *
 * Used by DRIVER to publish their current location
 * Stores GPS coordinates in gps_logs table
 *
 * @location apps/web/src/app/api/gps/publish/route.ts
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface PublishGpsRequest {
  lat: number
  lng: number
  speed_kmh?: number
  heading?: number
}

export async function POST(req: NextRequest) {
  try {
    const body: PublishGpsRequest = await req.json()

    // Validate input
    if (!body.lat || !body.lng || typeof body.lat !== 'number' || typeof body.lng !== 'number') {
      return NextResponse.json({ error: 'Invalid lat/lng coordinates' }, { status: 400 })
    }

    // Get user from authorization header or session
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

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Failed to authenticate user' }, { status: 401 })
    }

    // Get driver info for this user
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('id, vehicle_id')
      .eq('user_id', user.id)
      .single()

    if (driverError || !driver) {
      return NextResponse.json(
        { error: 'User is not a driver or driver record not found' },
        { status: 403 }
      )
    }

    // Insert GPS log
    const { data, error } = await supabase
      .from('gps_logs')
      .insert({
        driver_id: driver.id,
        vehicle_id: driver.vehicle_id,
        lat: parseFloat(String(body.lat)),
        lng: parseFloat(String(body.lng)),
        speed_kmh: body.speed_kmh ? parseFloat(String(body.speed_kmh)) : 0,
        heading: body.heading ? parseFloat(String(body.heading)) : 0,
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting GPS log:', error)
      return NextResponse.json({ error: 'Failed to store GPS coordinates' }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        message: 'GPS coordinates published successfully',
        data,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in POST /api/gps/publish:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
