/**
 * API Route: /api/vehicles/[id]
 *
 * @location apps/web/src/app/api/vehicles/[id]/route.ts
 * TODO: Detail, update, soft-delete kendaraan
 */
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<Record<string, string>> }) {
  const p = await params
  return NextResponse.json({
    message: 'TODO: implement GET /api/vehicles/[id]',
    params: p,
  })
}

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  const p = await params
  return NextResponse.json({
    message: 'TODO: implement PATCH /api/vehicles/[id]',
    params: p,
  })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  const p = await params
  return NextResponse.json({
    message: 'TODO: implement DELETE /api/vehicles/[id]',
    params: p,
  })
}
