import { NextResponse } from 'next/server'
import { getKPIMetrics } from '@/lib/analytics'

export async function GET() {
  try {
    const kpiData = await getKPIMetrics()
    return NextResponse.json(kpiData)
  } catch (error) {
    console.error('Analytics KPI error:', error)
    return NextResponse.json({ error: 'Failed to fetch KPI data' }, { status: 500 })
  }
}
