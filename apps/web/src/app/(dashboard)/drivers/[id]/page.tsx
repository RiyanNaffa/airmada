/**
 * Halaman detail supir.
 *
 * @location apps/web/src/app/(dashboard)/drivers/[id]/page.tsx
 * TODO: Fetch data supir + statistik performa dari API
 */
type Props = { params: Promise<{ id: string }> }

export default async function DriverDetailPage({ params }: Props) {
  const { id } = await params
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Driver Detail</h1>
      <p className="text-sm text-gray-400">ID: {id} — coming soon</p>
    </div>
  )
}
