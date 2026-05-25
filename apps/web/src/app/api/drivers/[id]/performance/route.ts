/**
 * API Route: /api/drivers/[id]/performance
 *
 * @location apps/web/src/app/api/drivers/[id]/performance/route.ts
 * TODO: Analytics performa supir
 */
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<Record<string, string>> }) {
  const p = await params
  return NextResponse.json({
    message: 'TODO: implement GET /api/drivers/[id]/performance',
    params: p,
  })
}
