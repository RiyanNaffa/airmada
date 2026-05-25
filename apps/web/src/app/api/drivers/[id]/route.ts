/**
 * API Route: /api/drivers/[id]
 *
 * @location apps/web/src/app/api/drivers/[id]/route.ts
 * TODO: Detail + update supir
 */
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<Record<string, string>> }) {
  const p = await params
  return NextResponse.json({
    message: 'TODO: implement GET /api/drivers/[id]',
    params: p,
  })
}

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  const p = await params
  return NextResponse.json({
    message: 'TODO: implement PATCH /api/drivers/[id]',
    params: p,
  })
}
