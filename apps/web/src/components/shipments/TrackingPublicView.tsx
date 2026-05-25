/**
 * View publik tracking paket — tidak butuh login.
 *
 * @location apps/web/src/components/shipments/TrackingPublicView.tsx
 * TODO: Terima tracking_code dari URL query, fetch GET /api/shipments/track/:code
 */
export function TrackingPublicView() {
  return (
    <div className="mx-auto max-w-lg p-6">
      <h2 className="mb-4 text-xl font-bold">Lacak Paket</h2>
      <p className="text-sm text-gray-400">Coming soon</p>
    </div>
  )
}
