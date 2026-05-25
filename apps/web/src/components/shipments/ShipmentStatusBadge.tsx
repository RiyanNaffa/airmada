/**
 * Badge warna untuk setiap ShipmentStatus.
 *
 * @location apps/web/src/components/shipments/ShipmentStatusBadge.tsx
 * TODO: Map status → warna: pending=gray, in_transit=blue, delivered=green, failed=red
 */
import type { ShipmentStatus } from '@airmada/types'

type Props = { status: ShipmentStatus }

const COLOR: Record<ShipmentStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  ASSIGNED: 'bg-yellow-100 text-yellow-700',
  PICKED_UP: 'bg-blue-100 text-blue-700',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  RETURNED: 'bg-purple-100 text-purple-700',
}

export function ShipmentStatusBadge({ status }: Props) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLOR[status]}`}>
      {status}
    </span>
  )
}
