/**
 * API Route: /api/routes/[id]/reoptimize
 *
 * @location apps/web/src/app/api/routes/[id]/reoptimize/route.ts
 * TODO: Re-run AI optimasi rute
 */
import { NextResponse } from 'next/server'

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  const p = await params
  return NextResponse.json({
    message: 'TODO: implement PATCH /api/routes/[id]/reoptimize',
    params: p,
  })
}
