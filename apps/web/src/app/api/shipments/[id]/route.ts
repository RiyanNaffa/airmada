/**
 * API Route: /api/shipments/[id]
 *
 * @location apps/web/src/app/api/shipments/[id]/route.ts
 * TODO: Detail + hapus paket
 */
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<Record<string, string>> }) {
  const p = await params
  return NextResponse.json({
    message: 'TODO: implement GET /api/shipments/[id]',
    params: p,
  })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  const p = await params
  return NextResponse.json({
    message: 'TODO: implement DELETE /api/shipments/[id]',
    params: p,
  })
}
