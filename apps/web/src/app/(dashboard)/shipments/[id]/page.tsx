/**
 * Halaman detail paket + timeline status.
 *
 * @location apps/web/src/app/(dashboard)/shipments/[id]/page.tsx
 * TODO: Fetch shipment + status_logs, tampilkan StatusTimeline component
 */
type Props = { params: Promise<{ id: string }> }

export default async function ShipmentDetailPage({ params }: Props) {
  const { id } = await params
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Shipment Detail</h1>
      <p className="text-sm text-gray-400">ID: {id} — coming soon</p>
    </div>
  )
}
