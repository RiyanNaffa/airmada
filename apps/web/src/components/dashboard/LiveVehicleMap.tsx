/**
 * Component: LiveVehicleMap
 * @location apps/web/src/components/dashboard/LiveVehicleMap.tsx
 */
'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Truck, MapPin, Clock } from 'lucide-react'

// (Interface dan fungsi createVehicleIcon / createSelectedVehicleIcon tetap sama seperti kode Anda)
interface VehiclePosition {
  vehicle_id: string
  driver_id: string
  plate_number: string
  driver_name: string
  lat: number
  lng: number
  speed_kmh: number
  heading: number
  recorded_at: string
}

interface LiveVehicleMapProps {
  positions: VehiclePosition[]
  selectedVehicleId?: string
  onVehicleSelect?: (vehicleId: string) => void
  height?: string
}

const createVehicleIcon = () => {
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white shadow-lg border-2 border-white"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="7" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/><path d="M2 10h20"/></svg></div>`,
    className: 'vehicle-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

const createSelectedVehicleIcon = () => {
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-xl border-3 border-white"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="7" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/><path d="M2 10h20"/></svg></div>`,
    className: 'vehicle-marker selected',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  })
}

export default function LiveVehicleMap({
  positions,
  selectedVehicleId,
  onVehicleSelect,
  height = 'h-[500px]',
}: LiveVehicleMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  // SOLUSI: Simpan status penyesuaian peta pertama kali
  const isInitialFitRef = useRef(true)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapRef.current = L.map(containerRef.current).setView([-6.2088, 106.8456], 11) // Default Jakarta center

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // Efek khusus fokus mengikuti driver yang dipilih manager
  useEffect(() => {
    if (!mapRef.current || !selectedVehicleId) return
    const activeVehicle = positions.find((p) => p.vehicle_id === selectedVehicleId)
    if (activeVehicle) {
      mapRef.current.setView([activeVehicle.lat, activeVehicle.lng], 15, { animate: true })
    }
  }, [selectedVehicleId, positions])

  // Sinkronisasi Marker Realtime
  useEffect(() => {
    if (!mapRef.current) return

    const currentVehicleIds = new Set(positions.map((p) => p.vehicle_id))
    const markersToRemove: string[] = []

    markersRef.current.forEach((marker, vehicleId) => {
      if (!currentVehicleIds.has(vehicleId)) {
        mapRef.current?.removeLayer(marker)
        markersToRemove.push(vehicleId)
      }
    })
    markersToRemove.forEach((id) => markersRef.current.delete(id))

    positions.forEach((position) => {
      const isSelected = position.vehicle_id === selectedVehicleId
      const icon = isSelected ? createSelectedVehicleIcon() : createVehicleIcon()
      const popupContent = `
        <div class="p-2 min-w-[180px]">
          <div class="font-bold text-slate-800">${position.plate_number}</div>
          <div class="text-xs text-slate-600 mt-0.5">Driver: ${position.driver_name}</div>
          <div class="text-xs text-slate-600">Kecepatan: ${position.speed_kmh.toFixed(1)} km/h</div>
          <div class="text-[10px] text-slate-400 mt-1">Update: ${new Date(position.recorded_at).toLocaleTimeString()}</div>
        </div>
      `

      if (markersRef.current.has(position.vehicle_id)) {
        const marker = markersRef.current.get(position.vehicle_id)!
        marker.setLatLng([position.lat, position.lng])
        marker.setIcon(icon)
        marker.getPopup()?.setContent(popupContent)
      } else {
        const marker = L.marker([position.lat, position.lng], { icon })
          .bindPopup(popupContent)
          .on('click', () => {
            onVehicleSelect?.(position.vehicle_id)
          })
          .addTo(mapRef.current!)

        markersRef.current.set(position.vehicle_id, marker)
      }
    })

    // SOLUSI: fitBounds HANYA dieksekusi pertama kali data termuat, bukan setiap pergerakan GPS
    if (positions.length > 0 && mapRef.current && isInitialFitRef.current) {
      const bounds = L.latLngBounds(positions.map((p) => [p.lat, p.lng]))
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      isInitialFitRef.current = false
    }
  }, [positions, selectedVehicleId, onVehicleSelect])

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className={`${height} rounded-2xl border border-slate-200 shadow-lg`}
      />

      {/* Daftar list di bawah peta tetap seperti kode asli Anda */}
      {positions.length > 0 && (
        <div className="grid gap-2">
          {positions.map((position) => (
            <button
              key={position.vehicle_id}
              onClick={() => onVehicleSelect?.(position.vehicle_id)}
              className={`flex items-center gap-3 rounded-lg p-3 text-left transition-all ${
                selectedVehicleId === position.vehicle_id
                  ? 'border border-blue-300 bg-blue-50'
                  : 'border border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <Truck size={18} className="text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800">{position.plate_number}</p>
                <p className="truncate text-xs text-slate-500">{position.driver_name}</p>
              </div>
              <div className="flex items-center gap-2 text-right">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {position.speed_kmh.toFixed(1)} km/h
                  </p>
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock size={12} /> {new Date(position.recorded_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {positions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg bg-slate-50 p-8 text-center">
          <MapPin className="mb-2 text-slate-400" size={32} />
          <p className="text-slate-600">Tidak ada kendaraan aktif</p>
        </div>
      )}
    </div>
  )
}
