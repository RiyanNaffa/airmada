/**
 * API Route: /api/notifications
 *
 * @location apps/web/src/app/api/notifications/route.ts
 * TODO: List notifikasi user
 */
import { NextResponse } from 'next/server'

export async function GET(_req: Request) {
  return NextResponse.json({
    message: 'TODO: implement GET /api/notifications',
  })
}
