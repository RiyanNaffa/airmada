/**
 * Halaman detail rute + map waypoints.
 *
 * @location apps/web/src/app/(dashboard)/routes/[id]/page.tsx
 * TODO: Fetch route + ordered shipments, render Leaflet map dengan polyline
 */
type Props = { params: Promise<{ id: string }> }

export default async function RouteDetailPage({ params }: Props) {
  const { id } = await params
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Route Detail</h1>
      <p className="text-sm text-gray-400">ID: {id} — coming soon</p>
    </div>
  )
}
