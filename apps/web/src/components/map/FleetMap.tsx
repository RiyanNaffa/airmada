/**
 * Peta armada live menggunakan Leaflet + OpenStreetMap.
 * WAJIB di-import dengan dynamic() karena Leaflet butuh window object.
 *
 * @location apps/web/src/components/map/FleetMap.tsx
 *
 * Cara pakai di page:
 *   const FleetMap = dynamic(() => import('@/components/map/FleetMap'), { ssr: false })
 *
 * TODO: Subscribe useRealtimeGPS, render VehicleMarker per kendaraan aktif
 */
'use client'

export default function FleetMap() {
  return (
    <div className="flex h-96 w-full items-center justify-center rounded-lg bg-gray-200">
      <p className="text-sm text-gray-400">Leaflet Map — coming soon</p>
    </div>
  )
}
