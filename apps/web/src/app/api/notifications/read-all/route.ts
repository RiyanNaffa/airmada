/**
 * API Route: /api/notifications/read-all
 *
 * @location apps/web/src/app/api/notifications/read-all/route.ts
 * TODO: Tandai semua notif dibaca
 */
import { NextResponse } from 'next/server'

export async function PATCH(_req: Request) {
  return NextResponse.json({
    message: 'TODO: implement PATCH /api/notifications/read-all',
  })
}
