/**
 * Timeline vertikal perubahan status paket.
 *
 * @location apps/web/src/components/shipments/StatusTimeline.tsx
 * TODO: Terima props logs: ShipmentStatusLog[], render step-by-step dengan timestamp
 */
import type { ShipmentStatusLog } from '@airmada/types'

type Props = { logs: ShipmentStatusLog[] }

export function StatusTimeline({ logs }: Props) {
  return (
    <ol className="space-y-3">
      {logs.map((log) => (
        <li key={log.id} className="flex gap-3 text-sm">
          <span className="text-gray-400">{new Date(log.created_at).toLocaleString('id-ID')}</span>
          <span>
            {log.old_status} → <strong>{log.new_status}</strong>
          </span>
        </li>
      ))}
      {logs.length === 0 && <p className="text-gray-400">Belum ada riwayat status.</p>}
    </ol>
  )
}
