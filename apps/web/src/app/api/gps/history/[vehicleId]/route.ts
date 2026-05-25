/**
 * API Route: /api/gps/history/[vehicleId]
 *
 * @location apps/web/src/app/api/gps/history/[vehicleId]/route.ts
 * TODO: Riwayat GPS untuk playback
 */
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<Record<string, string>> }) {
  const p = await params
  return NextResponse.json({
    message: 'TODO: implement GET /api/gps/history/[vehicleId]',
    params: p,
  })
}
