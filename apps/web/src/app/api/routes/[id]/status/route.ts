/**
 * API Route: /api/routes/[id]/status
 *
 * @location apps/web/src/app/api/routes/[id]/status/route.ts
 * TODO: Start / complete / cancel rute
 */
import { NextResponse } from 'next/server'

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  const p = await params
  return NextResponse.json({
    message: 'TODO: implement PATCH /api/routes/[id]/status',
    params: p,
  })
}
