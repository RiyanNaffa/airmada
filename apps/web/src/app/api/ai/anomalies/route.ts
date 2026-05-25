/**
 * API Route: /api/ai/anomalies
 *
 * @location apps/web/src/app/api/ai/anomalies/route.ts
 * TODO: List anomali terdeteksi hari ini
 */
import { NextResponse } from 'next/server'

export async function GET(_req: Request) {
  return NextResponse.json({
    message: 'TODO: implement GET /api/ai/anomalies',
  })
}
