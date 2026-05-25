/**
 * Client utilities untuk AI Service
 * @location apps/web/src/lib/ai-client.ts
 */

export interface Coordinate {
  lat: number
  lng: number
  shipment_id?: string
}

export interface OptimizeRouteRequest {
  origin: Coordinate
  destinations: Coordinate[]
}

export interface OptimizeRouteResponse {
  ordered_waypoints: Coordinate[]
  estimated_distance_km: number
  estimated_duration_min: number
}

export interface PredictETARequest {
  distance_km: number
  stops_remaining: number
  traffic_factor?: number
}

export interface PredictETAResponse {
  estimated_minutes: number
  confidence: number
}

export type AnomalyType = 'route_deviation' | 'gps_silent' | 'late_delivery' | 'speed_anomaly'

export interface DetectAnomalyRequest {
  vehicle_id: string
  last_gps_minutes_ago: number
  deviation_km?: number
  eta_overdue_minutes?: number
  speed_kmh?: number
}

export interface AnomalyResult {
  vehicle_id: string
  anomaly_type: AnomalyType
  severity: 'low' | 'medium' | 'high'
  description: string
  confidence: number
}

export interface DetectAnomalyResponse {
  anomalies: AnomalyResult[]
}

/**
 * Optimasi rute menggunakan TSP algorithm
 */
export async function optimizeRoute(req: OptimizeRouteRequest): Promise<OptimizeRouteResponse> {
  const response = await fetch('/api/ai/optimize-route', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to optimize route')
  }

  return response.json()
}

/**
 * Prediksi ETA berdasarkan jarak dan jumlah stops
 */
export async function predictETA(req: PredictETARequest): Promise<PredictETAResponse> {
  const response = await fetch('/api/ai/predict-eta', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to predict ETA')
  }

  return response.json()
}

/**
 * Deteksi anomali pada kendaraan
 */
export async function detectAnomalies(req: DetectAnomalyRequest): Promise<DetectAnomalyResponse> {
  const response = await fetch('/api/ai/detect-anomaly', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to detect anomalies')
  }

  return response.json()
}
