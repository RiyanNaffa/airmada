/**
 * API Route: /api/analytics/dashboard
 *
 * @location apps/web/src/app/api/analytics/dashboard/route.ts
 * TODO: KPI utama dari analytics_snapshots
 */
import { NextResponse } from 'next/server'

export async function GET(_req: Request) {
  try {
    // TODO: Fetch dari Supabase atau AI service
    const kpiData = {
      totalShipments: 1250,
      deliveredShipments: 1180,
      onTimeDeliveryRate: 94.4,
      averageDeliveryTime: 8.5,
      totalDistance: 15420,
      averageFuelConsumption: 0.085,
      activeVehicles: 25,
      driverUtilization: 87.5,
    }

    return NextResponse.json(kpiData)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch KPI data' }, { status: 500 })
  }
}
