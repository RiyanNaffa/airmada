/**
 * API Route: /api/shipments/[id]/assign
 *
 * @location apps/web/src/app/api/shipments/[id]/assign/route.ts
 * TODO: Assign paket ke driver + route
 */
import { NextResponse } from 'next/server'

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  const p = await params
  return NextResponse.json({
    message: 'TODO: implement PATCH /api/shipments/[id]/assign',
    params: p,
  })
}
