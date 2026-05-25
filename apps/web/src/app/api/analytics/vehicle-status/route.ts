import { NextResponse } from 'next/server'
import { getVehicleStatus } from '@/lib/analytics'

export async function GET() {
  try {
    const vehicleStatusData = await getVehicleStatus()
    return NextResponse.json(vehicleStatusData)
  } catch (error) {
    console.error('Analytics vehicle status error:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicle status' }, { status: 500 })
  }
}
