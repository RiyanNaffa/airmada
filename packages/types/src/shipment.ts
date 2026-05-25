export type ShipmentStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETURNED'

export type ShipmentPriority = 'REGULAR' | 'EXPRESS' | 'SAME_DAY' | 'CARGO' | 'ECONOMY'

export interface Shipment {
  id: string
  tracking_code: string
  driver_id?: string
  route_id?: string
  status: ShipmentStatus
  sender_name: string
  sender_address: string
  recipient_name: string
  recipient_address: string
  recipient_lat: number
  recipient_lng: number
  weight_kg: number
  volume_m3: number
  priority: ShipmentPriority
  estimated_delivery?: string
  actual_delivery?: string
  failure_reason?: string
  notes?: string
  created_at: string
  updated_at: string
  warehouse_id: string
}

export interface ShipmentStatusLog {
  id: string
  shipment_id: string
  old_status: ShipmentStatus
  new_status: ShipmentStatus
  changed_by: string
  note?: string
  location_lat?: number
  location_lng?: number
  created_at: string
}