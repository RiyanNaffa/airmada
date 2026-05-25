import { NextResponse } from 'next/server'
import { getRecentShipments } from '@/lib/analytics'

export async function GET() {
  try {
    const recentShipments = await getRecentShipments(5)
    return NextResponse.json(recentShipments)
  } catch (error) {
    console.error('Analytics recent shipments error:', error)
    return NextResponse.json({ error: 'Failed to fetch recent shipments' }, { status: 500 })
  }
}
