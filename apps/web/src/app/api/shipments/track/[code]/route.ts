/**
 * API Route: /api/shipments/track/[code]
 *
 * @location apps/web/src/app/api/shipments/track/[code]/route.ts
 * TODO: Public tracking via kode (no auth)
 */
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<Record<string, string>> }) {
  const p = await params
  return NextResponse.json({
    message: 'TODO: implement GET /api/shipments/track/[code]',
    params: p,
  })
}
