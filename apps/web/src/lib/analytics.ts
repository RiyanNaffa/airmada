import { createClient } from '@/lib/supabase/server'

export interface KPIMetrics {
  activeVehicles: number
  onDutyDrivers: number
  pendingShipments: number
  criticalWarnings: number
  totalDistance: number
  averageFuelConsumption: number
  onTimeDeliveryRate: number
  averageDeliveryTime: number
}

export interface TrendData {
  date: string
  deliveries: number
  delivered: number
  failed: number
}

export interface VehicleStatusData {
  name: string
  value: number
  color: string
}

export interface RecentShipment {
  trackingCode: string
  sender: string
  recipient: string
  weight: string
  priority: string
  status: string
  date: string
}

/**
 * Fetch KPI metrics dari Supabase
 */
export async function getKPIMetrics(): Promise<KPIMetrics> {
  const supabase = await createClient()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // 1. Active Vehicles
  const { count: activeVehicles } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // 2. On-Duty Drivers
  const { count: onDutyDrivers } = await supabase
    .from('drivers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'on_duty')

  // 3. Pending Shipments
  const { count: pendingShipments } = await supabase
    .from('shipments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // 4. Critical Warnings (failed shipments)
  const { count: criticalWarnings } = await supabase
    .from('shipments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed')
    .gte('created_at', sevenDaysAgo.toISOString())

  // 5. Total Distance
  const { data: routeData } = await supabase
    .from('routes')
    .select('optimized_distance_km')
    .gt('completed_at', sevenDaysAgo.toISOString())

  const totalDistance =
    routeData?.reduce((sum, route) => sum + (route.optimized_distance_km || 0), 0) || 0

  // 6. Average Fuel Consumption
  const { data: vehicles } = await supabase.from('vehicles').select('id').eq('status', 'active')

  const averageFuelConsumption =
    vehicles && vehicles.length > 0 ? totalDistance / (vehicles.length * 100) : 0.085

  // 7. On-Time Delivery Rate
  const { data: deliveredShipments } = await supabase
    .from('shipments')
    .select('estimated_delivery, actual_delivery, status, created_at')
    .eq('status', 'delivered')
    .gte('created_at', sevenDaysAgo.toISOString())

  let onTimeCount = 0
  if (deliveredShipments) {
    onTimeCount = deliveredShipments.filter(
      (s) => s.actual_delivery && new Date(s.actual_delivery) <= new Date(s.estimated_delivery)
    ).length
  }
  const onTimeDeliveryRate =
    deliveredShipments && deliveredShipments.length > 0
      ? (onTimeCount / deliveredShipments.length) * 100
      : 94.4

  // 8. Average Delivery Time
  const totalDeliveryTime =
    deliveredShipments?.reduce((sum, s) => {
      if (s.actual_delivery && s.created_at) {
        const timeDiff = new Date(s.actual_delivery).getTime() - new Date(s.created_at).getTime()
        return sum + timeDiff / (1000 * 60 * 60)
      }
      return sum
    }, 0) || 0

  const averageDeliveryTime =
    deliveredShipments && deliveredShipments.length > 0
      ? totalDeliveryTime / deliveredShipments.length
      : 8.5

  return {
    activeVehicles: activeVehicles || 0,
    onDutyDrivers: onDutyDrivers || 0,
    pendingShipments: pendingShipments || 0,
    criticalWarnings: criticalWarnings || 0,
    totalDistance: Math.round(totalDistance),
    averageFuelConsumption: parseFloat(averageFuelConsumption.toFixed(3)),
    onTimeDeliveryRate: parseFloat(onTimeDeliveryRate.toFixed(1)),
    averageDeliveryTime: parseFloat(averageDeliveryTime.toFixed(1)),
  }
}

/**
 * Fetch trend data untuk N hari terakhir
 */
export async function getTrendData(days: number = 7): Promise<TrendData[]> {
  const supabase = await createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: shipments } = await supabase
    .from('shipments')
    .select('created_at, status')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  // Group by date
  const trendMap = new Map<string, TrendData>()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = `${date.getDate()}/${date.getMonth() + 1}`.padStart(2, '0')
    trendMap.set(dateStr, { date: dateStr, deliveries: 0, delivered: 0, failed: 0 })
  }

  // Count by date and status
  shipments?.forEach((shipment) => {
    const date = new Date(shipment.created_at)
    const dateStr = `${date.getDate()}/${date.getMonth() + 1}`.padStart(2, '0')
    const entry = trendMap.get(dateStr) || { date: dateStr, deliveries: 0, delivered: 0, failed: 0 }
    entry.deliveries++
    if (shipment.status === 'delivered') entry.delivered++
    if (shipment.status === 'failed') entry.failed++
    trendMap.set(dateStr, entry)
  })

  return Array.from(trendMap.values())
}

/**
 * Fetch vehicle status distribution
 */
export async function getVehicleStatus(): Promise<VehicleStatusData[]> {
  const supabase = await createClient()

  const { data: vehicles } = await supabase.from('vehicles').select('status')

  const statusCount = {
    active: 0,
    idle: 0,
    maintenance: 0,
    offline: 0,
  }

  vehicles?.forEach((v) => {
    if (v.status === 'active') statusCount.active++
    else if (v.status === 'idle') statusCount.idle++
    else if (v.status === 'maintenance') statusCount.maintenance++
    else if (v.status === 'offline') statusCount.offline++
  })

  return [
    { name: 'Active', value: statusCount.active, color: '#10b981' },
    { name: 'Idle', value: statusCount.idle, color: '#6b7280' },
    { name: 'Repair', value: statusCount.maintenance, color: '#ef4444' },
  ].filter((item) => item.value > 0)
}

/**
 * Fetch recent shipments
 */
export async function getRecentShipments(limit: number = 5): Promise<RecentShipment[]> {
  const supabase = await createClient()

  const { data: shipments } = await supabase
    .from('shipments')
    .select('tracking_code, sender_name, recipient_name, weight_kg, priority, status, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  return (
    shipments?.map((shipment) => ({
      trackingCode: shipment.tracking_code,
      sender: shipment.sender_name,
      recipient: shipment.recipient_name,
      weight: `${shipment.weight_kg} kg`,
      priority: formatPriority(shipment.priority),
      status: formatStatus(shipment.status),
      date: new Date(shipment.created_at).toISOString().split('T')[0],
    })) || []
  )
}

/**
 * Format priority text
 */
function formatPriority(priority: string): string {
  const priorityMap: Record<string, string> = {
    regular: 'Low',
    express: 'Medium',
    same_day: 'High',
  }
  return priorityMap[priority] || priority
}

/**
 * Format status text
 */
function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    assigned: 'Assigned',
    pickup: 'Picked Up',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    failed: 'Failed',
    returned: 'Returned',
  }
  return statusMap[status] || status
}
