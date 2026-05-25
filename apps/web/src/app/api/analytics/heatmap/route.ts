/**
 * API Route: /api/analytics/heatmap
 *
 * @location apps/web/src/app/api/analytics/heatmap/route.ts
 * TODO: Data heatmap untuk Leaflet layer
 */
import { NextResponse } from 'next/server'

export async function GET(_req: Request) {
  return NextResponse.json({
    message: 'TODO: implement GET /api/analytics/heatmap',
  })
}
