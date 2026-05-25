/**
 * API Route: /api/ai/predict-eta
 *
 * @location apps/web/src/app/api/ai/predict-eta/route.ts
 * Proxy untuk memanggil AI service untuk prediksi ETA
 */
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validasi input
    if (body.distance_km === undefined || body.stops_remaining === undefined) {
      return NextResponse.json({ error: 'Missing distance_km or stops_remaining' }, { status: 400 })
    }

    // Call AI Service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000'
    const response = await fetch(`${aiServiceUrl}/predict-eta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.AI_SERVICE_SECRET || '',
      },
      body: JSON.stringify({
        distance_km: body.distance_km,
        stops_remaining: body.stops_remaining,
        traffic_factor: body.traffic_factor || 1.0,
      }),
    })

    if (!response.ok) {
      throw new Error(`AI Service error: ${response.statusText}`)
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('ETA prediction error:', error)
    return NextResponse.json({ error: 'Failed to predict ETA' }, { status: 500 })
  }
}
