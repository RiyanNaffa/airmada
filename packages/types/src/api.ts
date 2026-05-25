export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface ApiError {
  error: string
  code?: string
  details?: unknown
}

export interface GpsLog {
  id: number
  vehicle_id: string
  driver_id: string
  lat: number
  lng: number
  speed_kmh: number
  heading: number
  recorded_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'alert' | 'info' | 'warning' | 'success'
  title: string
  message: string
  related_entity?: string
  related_id?: string
  is_read: boolean
  created_at: string
}