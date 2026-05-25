/**
 * API Route: /api/gps/live
 *
 * @location apps/web/src/app/api/gps/live/route.ts
 * TODO: Posisi terkini semua kendaraan aktif
 */
import { NextResponse } from 'next/server'

export async function GET(_req: Request) {
  return NextResponse.json({
    message: 'TODO: implement GET /api/gps/live',
  })
}
