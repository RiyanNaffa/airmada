/**
 * Alert card untuk satu anomali terdeteksi.
 *
 * @location apps/web/src/components/ai/AnomalyAlert.tsx
 * TODO: Props: AnomalyItem, warna border berdasarkan severity
 */
// import type { AnomalyItem } from '@airmada/types'

// type Props = { anomaly: AnomalyItem }

// export function AnomalyAlert({ anomaly }: Props) {
//   const border = { high: 'border-red-400', medium: 'border-yellow-400', low: 'border-blue-300' }
//   return (
//     <div className={`border-l-4 ${border[anomaly.severity]} rounded-r-xl bg-white p-4`}>
//       <p className="text-sm font-semibold">{anomaly.type.replace('_', ' ').toUpperCase()}</p>
//       <p className="mt-1 text-sm text-gray-600">{anomaly.description}</p>
//     </div>
//   )
// }
