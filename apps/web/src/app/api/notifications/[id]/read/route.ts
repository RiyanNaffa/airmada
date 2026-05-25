/**
 * API Route: /api/notifications/[id]/read
 *
 * @location apps/web/src/app/api/notifications/[id]/read/route.ts
 * TODO: Tandai satu notif dibaca
 */
import { NextResponse } from 'next/server'

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  const p = await params
  return NextResponse.json({
    message: 'TODO: implement PATCH /api/notifications/[id]/read',
    params: p,
  })
}
