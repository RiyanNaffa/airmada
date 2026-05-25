/**
 * API Route: /api/analytics/export
 *
 * @location apps/web/src/app/api/analytics/export/route.ts
 * TODO: Export laporan CSV/XLSX/PDF
 */
import { NextResponse } from 'next/server'

export async function GET(_req: Request) {
  return NextResponse.json({
    message: 'TODO: implement GET /api/analytics/export',
  })
}
