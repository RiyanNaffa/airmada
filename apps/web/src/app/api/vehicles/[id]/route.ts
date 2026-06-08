/**
 * API Route: /api/vehicles/[id]
 *
 * @location apps/web/src/app/api/vehicles/[id]/route.ts
 * Detail, update, soft-delete kendaraan
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateVehicleSchema } from '@/lib/validators/vehicle.schema'

export async function GET(_req: Request, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single()

    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'Kendaraan tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /api/vehicles/[id] error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch vehicle' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const { id } = await params
    const body = await req.json()

    // Validate input (partial update)
    const partialData = CreateVehicleSchema.partial().parse(body)

    const supabase = await createClient()

    // Update vehicle
    const { data, error } = await supabase
      .from('vehicles')
      .update({
        ...partialData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()

    if (error) throw error
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Kendaraan tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('PATCH /api/vehicles/[id] error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal mengupdate kendaraan' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Soft delete by setting status to offline or delete from database
    const { data, error } = await supabase.from('vehicles').delete().eq('id', id).select()

    if (error) throw error
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Kendaraan tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Kendaraan berhasil dihapus' })
  } catch (error) {
    console.error('DELETE /api/vehicles/[id] error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal menghapus kendaraan' },
      { status: 500 }
    )
  }
}
