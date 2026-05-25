/**
 * Card KPI — menampilkan satu metrik (total paket, success rate, dll).
 *
 * @location apps/web/src/components/dashboard/KpiCard.tsx
 * TODO: Props: title, value, delta (perubahan vs kemarin), icon, color
 */
type Props = {
  title: string
  value: string | number
  description?: string
}

export function KpiCard({ title, value, description }: Props) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      {description && <p className="mt-1 text-xs text-gray-400">{description}</p>}
    </div>
  )
}
