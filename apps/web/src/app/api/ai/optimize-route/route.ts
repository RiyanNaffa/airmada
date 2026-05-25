/**
 * API Route: /api/ai/optimize-route
 *
 * @location apps/web/src/app/api/ai/optimize-route/route.ts
 * Proxy untuk memanggil AI service untuk optimasi rute (TSP)
 */
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validasi input
    if (!body.origin || !body.destinations || !Array.isArray(body.destinations)) {
      return NextResponse.json({ error: 'Missing or invalid origin/destinations' }, { status: 400 })
    }

    // Call AI Service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000'
    const response = await fetch(`${aiServiceUrl}/optimize-route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.AI_SERVICE_SECRET || '',
      },
      body: JSON.stringify({
        origin: body.origin,
        destinations: body.destinations,
      }),
    })

    if (!response.ok) {
      throw new Error(`AI Service error: ${response.statusText}`)
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Route optimization error:', error)
    return NextResponse.json({ error: 'Failed to optimize route' }, { status: 500 })
  }
}
