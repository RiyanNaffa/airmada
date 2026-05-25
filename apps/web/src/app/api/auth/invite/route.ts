/**
 * API Route: /api/auth/invite
 *
 * @location apps/web/src/app/api/auth/invite/route.ts
 * TODO: Invite user baru (manager only)
 */
import { NextResponse } from 'next/server'

export async function POST(_req: Request) {
  return NextResponse.json({
    message: 'TODO: implement POST /api/auth/invite',
  })
}
