/**
 * API Route: /api/shipments
 *
 * @location apps/web/src/app/api/shipments/route.ts
 * TODO: List + create paket
 */
import { NextResponse } from 'next/server'

export async function GET(_req: Request) {
  return NextResponse.json({
    message: 'TODO: implement GET /api/shipments',
  })
}

export async function POST(_req: Request) {
  return NextResponse.json({
    message: 'TODO: implement POST /api/shipments',
  })
}
