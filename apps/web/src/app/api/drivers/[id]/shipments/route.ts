/**
 * API Route: /api/drivers/[id]/shipments
 *
 * @location apps/web/src/app/api/drivers/[id]/shipments/route.ts
 * TODO: Riwayat pengiriman supir
 */
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<Record<string, string>> }) {
  const p = await params
  return NextResponse.json({
    message: 'TODO: implement GET /api/drivers/[id]/shipments',
    params: p,
  })
}
