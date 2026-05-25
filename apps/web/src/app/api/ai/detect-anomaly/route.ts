/**
 * API Route: /api/ai/detect-anomaly
 * Proxy untuk memanggil AI service untuk deteksi anomali
 */
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validasi input
    if (!body.vehicle_id || body.last_gps_minutes_ago === undefined) {
      return NextResponse.json(
        { error: 'Missing vehicle_id or last_gps_minutes_ago' },
        { status: 400 }
      )
    }

    // Call AI Service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000'
    const response = await fetch(`${aiServiceUrl}/detect-anomaly`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.AI_SERVICE_SECRET || '',
      },
      body: JSON.stringify({
        vehicle_id: body.vehicle_id,
        last_gps_minutes_ago: body.last_gps_minutes_ago,
        deviation_km: body.deviation_km,
        eta_overdue_minutes: body.eta_overdue_minutes,
        speed_kmh: body.speed_kmh,
      }),
    })

    if (!response.ok) {
      throw new Error(`AI Service error: ${response.statusText}`)
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Anomaly detection error:', error)
    return NextResponse.json({ error: 'Failed to detect anomalies' }, { status: 500 })
  }
}
