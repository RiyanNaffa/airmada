/**
 * API Route: /api/gps/log
 *
 * @location apps/web/src/app/api/gps/log/route.ts
 * TODO: Driver kirim koordinat GPS
 */
import { NextResponse } from 'next/server'

export async function POST(_req: Request) {
  return NextResponse.json({
    message: 'TODO: implement POST /api/gps/log',
  })
}
