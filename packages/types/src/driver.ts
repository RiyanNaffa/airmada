export type DriverStatus = 'AVAILABLE' | 'ON_DUTY' | 'OFFLINE' | 'SUSPENDED'

export interface Driver {
  id: string
  user_id: string
  vehicle_id?: string
  license_number: string
  license_expiry: string
  status: DriverStatus
  total_deliveries: number
  rating: number
}