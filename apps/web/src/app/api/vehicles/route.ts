/**
 * API Route: /api/vehicles
 *
 * @location apps/web/src/app/api/vehicles/route.ts
 * List + create kendaraan dengan Supabase
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateVehicleSchema } from '@/lib/validators/vehicle.schema'

export async function GET(_req: Request) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /api/vehicles error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch vehicles' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate input
    const validatedData = CreateVehicleSchema.parse(body)

    const supabase = await createClient()

    // Insert vehicle
    const { data, error } = await supabase
      .from('vehicles')
      .insert([
        {
          plate_number: validatedData.plate_number,
          type: validatedData.type,
          capacity_kg: validatedData.capacity_kg,
          capacity_m3: validatedData.capacity_volume_m3,
          fuel_type: validatedData.fuel_type,
          year: validatedData.year,
          notes: validatedData.notes || null,
          status: 'IDLE',
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json(data?.[0], { status: 201 })
  } catch (error) {
    console.error('POST /api/vehicles error:', error)

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate')) {
        return NextResponse.json({ error: 'Nomor plat sudah terdaftar' }, { status: 409 })
      }
      if (error.message.includes('validation')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    return NextResponse.json({ error: 'Gagal menambah kendaraan' }, { status: 500 })
  }
}
