/**
 * API Route: /api/vehicles
 *
 * @location apps/web/src/app/api/vehicles/route.ts
 * TODO: List + create kendaraan
 */
import { NextResponse } from 'next/server'

export async function GET(_req: Request) {
  return NextResponse.json({
    message: 'TODO: implement GET /api/vehicles',
  })
}

export async function POST(_req: Request) {
  return NextResponse.json({
    message: 'TODO: implement POST /api/vehicles',
  })
}
