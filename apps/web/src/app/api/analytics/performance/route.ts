/**
 * API Route: /api/analytics/performance
 *
 * @location apps/web/src/app/api/analytics/performance/route.ts
 * TODO: Tren performa dalam rentang waktu
 */
import { NextResponse } from 'next/server'

export async function GET(_req: Request) {
  try {
    const performanceData = [
      { name: 'Tepat Waktu', value: 1155, color: '#10b981' },
      { name: 'Terlambat', value: 58, color: '#ef4444' },
      { name: 'Dalam Transit', value: 37, color: '#f59e0b' },
    ]

    return NextResponse.json(performanceData)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 })
  }
}
