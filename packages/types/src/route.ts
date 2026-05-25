export type RouteStatus = 'planned' | 'active' | 'completed' | 'cancelled'

export interface Waypoint {
  lat: number
  lng: number
  shipment_id: string
  order: number
  eta?: string
}

export interface Route {
  id: string
  vehicle_id: string
  driver_id: string
  date: string
  status: RouteStatus
  origin_lat: number
  origin_lng: number
  waypoints: Waypoint[]
  optimized_distance_km?: number
  estimated_duration_min?: number
  started_at?: string
  completed_at?: string
}