/**
 * API Route: /api/shipments/[id]/status
 *
 * @location apps/web/src/app/api/shipments/[id]/status/route.ts
 * TODO: Update status paket (FSM)
 */
import { NextResponse } from 'next/server'

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  const p = await params
  return NextResponse.json({
    message: 'TODO: implement PATCH /api/shipments/[id]/status',
    params: p,
  })
}
