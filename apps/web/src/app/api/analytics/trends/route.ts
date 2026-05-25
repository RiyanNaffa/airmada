import { NextResponse } from 'next/server'
import { getTrendData } from '@/lib/analytics'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7days'

    const daysBack = period === '7days' ? 7 : period === '30days' ? 30 : 7
    const trendData = await getTrendData(daysBack)

    return NextResponse.json(trendData)
  } catch (error) {
    console.error('Analytics trends error:', error)
    return NextResponse.json({ error: 'Failed to fetch trend data' }, { status: 500 })
  }
}
