/**
 * API Route: /api/vehicles/[id]/gps
 *
 * @location apps/web/src/app/api/vehicles/[id]/gps/route.ts
 * TODO: Riwayat GPS kendaraan
 */
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<Record<string, string>> }) {
  const p = await params
  return NextResponse.json({
    message: 'TODO: implement GET /api/vehicles/[id]/gps',
    params: p,
  })
}
