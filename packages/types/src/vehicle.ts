export type VehicleType = 'MOTOR' | 'VAN' | 'PICKUP' | 'SMALL_TRUCK' | 'LARGE_TRUCK';
export type VehicleStatus = 'IDLE' | 'ACTIVE' | 'BROKEN_EN_ROUTE' | 'MAINTENANCE' | 'OFFLINE';
export type VehicleFuel = 'GAS' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';

export interface Vehicle {
  id: string
  plate_number: string
  type: VehicleType
  capacity_kg: number
  capacity_m3: number
  status: VehicleStatus
  fuel_type: VehicleFuel
  year: number
  notes?: string
  created_at: string
  last_maintenance?: string
  updated_at: string
}