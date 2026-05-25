'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  Clock,
  Gauge,
  Package,
  AlertCircle,
  Zap,
  RefreshCw,
  Loader2,
  Map as MapIcon,
} from 'lucide-react'
import { Shipment, ShipmentPriority, Location } from '@/types'
import { mockShipments } from '@/mocks'
import { mockWarehouses } from '@/mocks'
import { useUserProfile } from '@/hooks/useUserProfile'

const FALLBACK_ORIGIN: Location = {
  lat: Number(mockWarehouses[0].lat),
  lng: Number(mockWarehouses[0].long),
  id: mockWarehouses[0].name,
}

const RoutesMap = dynamic(() => import('../../../components/dashboard/RoutesMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-orange-400"></div>
        <p className="mt-4 text-gray-600">Memuat peta...</p>
      </div>
    </div>
  ),
})

function getPriorityConfig(priority: ShipmentPriority) {
  const config: Record<
    ShipmentPriority,
    { color: string; label: string; icon: React.ReactNode; badge: string }
  > = {
    SAME_DAY: {
      color: 'text-red-600 bg-red-50',
      label: 'Hari Ini',
      icon: <Zap size={16} />,
      badge: 'bg-red-100 text-red-700',
    },
    EXPRESS: {
      color: 'text-orange-600 bg-orange-50',
      label: 'Express',
      icon: <AlertCircle size={16} />,
      badge: 'bg-orange-100 text-orange-700',
    },
    REGULAR: {
      color: 'text-blue-600 bg-blue-50',
      label: 'Regular',
      icon: <Package size={16} />,
      badge: 'bg-blue-100 text-blue-700',
    },
    CARGO: {
      color: 'text-indigo-600 bg-indigo-50',
      label: 'Cargo',
      icon: <Package size={16} />,
      badge: 'bg-indigo-100 text-indigo-700',
    },
    ECONOMY: {
      color: 'text-gray-600 bg-gray-50',
      label: 'Economy',
      icon: <Package size={16} />,
      badge: 'bg-gray-100 text-gray-700',
    },
  }
  return config[priority] || config.REGULAR
}

export default function MapsPage() {
  const { user, loading: isUserLoading } = useUserProfile()

  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [sortedShipments, setSortedShipments] = useState<Shipment[]>([])
  const [driverOrigin, setDriverOrigin] = useState(FALLBACK_ORIGIN)
  const [routeStarted, setRouteStarted] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [routeStats, setRouteStats] = useState({ distance: 0, duration: 0 })
  const [routeRefreshKey, setRouteRefreshKey] = useState(0)

  // State untuk Popup URL Google Maps
  const [mapsUrl, setMapsUrl] = useState<string | null>(null)

  useEffect(() => {
    if (isUserLoading || !user?.user?.warehouse_id) return
    const userWarehouseId = user.user.warehouse_id
    const filtered = mockShipments.filter(
      (shipment) => String(shipment.warehouse_id) === String(userWarehouseId)
    )
    setSortedShipments(filtered)
    if (filtered.length > 0) setSelectedShipment(filtered[0])

    const userWarehouse = mockWarehouses.find((w) => String(w.id) === String(userWarehouseId))
    if (userWarehouse) {
      setDriverOrigin({
        lat: Number(userWarehouse.lat),
        lng: Number(userWarehouse.long),
        id: userWarehouse.name,
      })
    }
  }, [user, isUserLoading])

  const generateGoogleMapsUrl = (
    shipmentsList: Shipment[],
    originCoords: { lat: number; lng: number }
  ) => {
    if (shipmentsList.length === 0) return null

    const baseUrl = 'https://www.google.com/maps/dir/?api=1'
    const originStr = `${originCoords.lat},${originCoords.lng}`

    const destObj = shipmentsList[shipmentsList.length - 1]
    const destStr = `${destObj.recipient_lat},${destObj.recipient_lng}`

    let waypointsParam = ''
    if (shipmentsList.length > 1) {
      const waypointsList = shipmentsList
        .slice(0, -1)
        .slice(0, 9)
        .map((s) => `${s.recipient_lat},${s.recipient_lng}`)
        .join('|')

      waypointsParam = `&waypoints=${encodeURIComponent(waypointsList)}`
    }

    return `${baseUrl}&origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destStr)}${waypointsParam}&travelmode=driving&dir_action=navigate`
  }

  const handleStartRoute = () => {
    setIsLoadingLocation(true)
    setLocationError(null)

    if (!user?.user?.warehouse_id) {
      setLocationError('Gagal mendeteksi data warehouse pada profil Anda')
      setIsLoadingLocation(false)
      return
    }

    const userWarehouse = mockWarehouses.find(
      (w) => String(w.id) === String(user.user.warehouse_id)
    )
    if (!userWarehouse) {
      setLocationError('Detail koordinat untuk warehouse Anda tidak ditemukan')
      setIsLoadingLocation(false)
      return
    }
    const origin = { lat: Number(userWarehouse.lat), lng: Number(userWarehouse.long) }
    setDriverOrigin({ ...origin, id: userWarehouse.name })
    setRouteStarted(true)

    const url = generateGoogleMapsUrl(sortedShipments, origin)
    if (url) {
      setMapsUrl(url)
    }
    setIsLoadingLocation(false)
  }

  // Modifikasi pada handler ini untuk menyusun URL Google Maps
  const handleRouteOptimized = (orderedIds: string[]) => {
    setSortedShipments((prev) => {
      const currentOrder = prev.map((s) => s.id).join(',')
      const newOrderIds = orderedIds.join(',')
      if (currentOrder === newOrderIds) return prev

      return [...prev].sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id))
    })
  }

  const handleRefreshRoute = () => {
    setRouteRefreshKey((k) => k + 1)
  }

  const totalWeight = sortedShipments.reduce((sum, s) => sum + s.weight_kg, 0)

  if (isUserLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <p className="text-sm font-medium text-gray-500">Menyelaraskan data gudang...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-full overflow-hidden bg-white">
      {/* --- POPUP GOOGLE MAPS --- */}
      {mapsUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="animate-in zoom-in-95 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600">
                <MapIcon size={24} />
                <h3 className="text-lg font-bold text-gray-900">Navigasi Tersedia</h3>
              </div>
              <button
                onClick={() => setMapsUrl(null)}
                className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <p className="mb-2 text-sm text-gray-600">
              Urutan pengiriman berhasil dioptimalkan! Buka di Google Maps untuk panduan belokan
              demi belokan (turn-by-turn).
            </p>

            {sortedShipments.length > 10 && (
              <p className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-2 text-xs text-orange-600">
                Catatan: Google Maps hanya mendukung maksimal 9 titik perantara (waypoints). Rute
                Anda memiliki {sortedShipments.length - 1} titik, sebagian titik mungkin terpotong
                di aplikasi Maps.
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setMapsUrl(null)}
                className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 active:scale-95"
              >
                Tutup
              </button>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMapsUrl(null)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95"
              >
                Buka Maps
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="relative flex-1">
        <RoutesMap
          shipments={sortedShipments}
          origin={driverOrigin}
          selectedShipment={selectedShipment}
          onShipmentSelect={setSelectedShipment}
          onRouteOptimized={handleRouteOptimized}
          onRouteCalculated={(dist, dur) => setRouteStats({ distance: dist, duration: dur })}
          refreshKey={routeRefreshKey}
        />

        <div className="absolute bottom-6 left-6 z-10 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-x-8">
              <div className="flex items-center gap-2 text-gray-600">
                <Gauge size={16} />
                <span className="text-sm">Total Jarak</span>
              </div>
              <p className="font-bold text-gray-900">{routeStats.distance.toFixed(1)} km</p>
            </div>
            <div className="flex items-center justify-between gap-x-8">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={16} />
                <span className="text-sm">Est. Durasi</span>
              </div>
              <p className="font-bold text-gray-900">{routeStats.duration} menit</p>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between gap-x-8">
                <div className="flex items-center gap-2 text-gray-600">
                  <Package size={16} />
                  <span className="text-sm">Total Beban</span>
                </div>
                <p className="font-bold text-gray-900">{totalWeight} kg</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden w-full max-w-sm flex-col overflow-hidden border-l border-gray-200 bg-white sm:flex">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Rute Perjalanan</h2>
          <p className="mt-1 text-sm text-gray-500">{sortedShipments.length} paket dioptimalkan</p>
        </div>

        <div className="border-b border-gray-200 bg-blue-50 px-6 py-3">
          <div className="flex items-start gap-3">
            <div
              className={`mt-1 h-3 w-3 shrink-0 rounded-full ${routeStarted ? 'animate-pulse bg-green-600' : 'bg-blue-600'}`}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">Titik Awal (Gudang)</p>
              <p className="truncate text-xs text-gray-600">{driverOrigin.id}</p>
              {routeStarted && (
                <p className="mt-1 text-xs text-green-600">
                  {driverOrigin.lat.toFixed(4)}, {driverOrigin.lng.toFixed(4)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2 p-4">
            {sortedShipments.map((shipment, index) => {
              const priorityConfig = getPriorityConfig(shipment.priority)
              const isSelected = selectedShipment?.id === shipment.id
              return (
                <button
                  key={shipment.id}
                  onClick={() => setSelectedShipment(shipment)}
                  className={`w-full rounded-lg border-2 p-3 text-left transition-all ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${priorityConfig.badge}`}
                      >
                        {priorityConfig.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{shipment.tracking_code}</span>
                  </div>
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {shipment.recipient_name}
                  </p>
                  <p className="mb-2 truncate text-xs text-gray-600">
                    {shipment.recipient_address}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <span
                        className={`h-2 w-2 rounded-full ${shipment.status === 'DELIVERED' ? 'bg-green-600' : shipment.status === 'IN_TRANSIT' ? 'bg-blue-600' : shipment.status === 'PICKED_UP' ? 'bg-orange-600' : 'bg-gray-400'}`}
                      />
                      <span className="text-gray-600">
                        {shipment.status === 'DELIVERED'
                          ? 'Terkirim'
                          : shipment.status === 'IN_TRANSIT'
                            ? 'Dalam Perjalanan'
                            : shipment.status === 'PICKED_UP'
                              ? 'Pengambilan'
                              : 'Pending'}
                      </span>
                    </span>
                    <span className="text-xs font-medium text-gray-700">
                      {shipment.weight_kg} kg
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2 border-t border-gray-200 p-4">
          {locationError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs text-red-700">{locationError}</p>
            </div>
          )}
          <button
            onClick={handleStartRoute}
            disabled={isLoadingLocation || routeStarted}
            className={`w-full rounded-lg px-4 py-2.5 font-medium text-white transition-colors ${routeStarted ? 'bg-green-600 hover:bg-green-700' : isLoadingLocation ? 'cursor-not-allowed bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'}`}
          >
            {isLoadingLocation
              ? 'Mendapatkan Lokasi...'
              : routeStarted
                ? '✓ Rute Dimulai'
                : 'Mulai Rute'}
          </button>
          <button
            onClick={handleRefreshRoute}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 active:scale-95"
          >
            <RefreshCw size={15} /> Optimasi Rute
          </button>
        </div>
      </div>
    </div>
  )
}
