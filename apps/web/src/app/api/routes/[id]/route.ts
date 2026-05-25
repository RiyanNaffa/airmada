/**
 * API Route: /api/routes/[id]
 *
 * @location apps/web/src/app/api/routes/[id]/route.ts
 * TODO: Detail rute + shipments
 */
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<Record<string, string>> }) {
  const p = await params
  return NextResponse.json({
    message: 'TODO: implement GET /api/routes/[id]',
    params: p,
  })
}
