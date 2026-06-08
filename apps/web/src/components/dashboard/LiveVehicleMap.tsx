/**
 * Component: LiveVehicleMap
 *
 * Displays live vehicle positions on a Leaflet map
 * Shows real-time GPS coordinates from drivers
 *
 * @location apps/web/src/components/dashboard/LiveVehicleMap.tsx
 */
'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
// import 'leaflet/dist/leaflet.css'
import { Truck, MapPin, Clock } from 'lucide-react'

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

// Custom icons
const createVehicleIcon = () => {
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white shadow-lg border-2 border-white">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="6" width="20" height="12" rx="2"/>
          <circle cx="7" cy="17" r="1.5"/>
          <circle cx="17" cy="17" r="1.5"/>
          <path d="M2 10h20"/>
        </svg>
      </div>
    `,
    className: 'vehicle-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

const createSelectedVehicleIcon = () => {
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-xl border-3 border-white">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="6" width="20" height="12" rx="2"/>
          <circle cx="7" cy="17" r="1.5"/>
          <circle cx="17" cy="17" r="1.5"/>
          <path d="M2 10h20"/>
        </svg>
      </div>
    `,
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

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapRef.current = L.map(containerRef.current).setView([0, 0], 13)

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current)

    setTimeout(() => {
      mapRef.current?.invalidateSize()
    }, 1000)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // Update markers on position changes
  useEffect(() => {
    if (!mapRef.current) return

    const validPositions = positions.filter(
      (p) =>
        p &&
        typeof p.lat === 'number' &&
        typeof p.lng === 'number' &&
        !isNaN(p.lat) &&
        !isNaN(p.lng)
    )

    // Remove markers not in current positions
    const currentVehicleIds = new Set(validPositions.map((p) => p.vehicle_id))
    const markersToRemove: string[] = []

    markersRef.current.forEach((marker, vehicleId) => {
      if (!currentVehicleIds.has(vehicleId)) {
        mapRef.current?.removeLayer(marker)
        markersToRemove.push(vehicleId)
      }
    })

    markersToRemove.forEach((id) => markersRef.current.delete(id))

    // Update or create markers
    validPositions.forEach((position) => {
      const isSelected = position.vehicle_id === selectedVehicleId
      const icon = isSelected ? createSelectedVehicleIcon() : createVehicleIcon()
      const popupContent = `
        <div class="p-3 min-w-[250px]">
          <div class="font-bold text-slate-800">${position.plate_number}</div>
          <div class="text-sm text-slate-600">Driver: ${position.driver_name}</div>
          <div class="text-sm text-slate-600">Speed: ${position.speed_kmh.toFixed(1)} km/h</div>
          <div class="flex items-center gap-2 text-xs text-slate-500 mt-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"></circle>
              <path d="M12 1v6m0 6v6"></path>
            </svg>
            <span>${new Date(position.recorded_at).toLocaleTimeString()}</span>
          </div>
        </div>
      `

      if (markersRef.current.has(position.vehicle_id)) {
        // Update existing marker
        const marker = markersRef.current.get(position.vehicle_id)!
        marker.setLatLng([position.lat, position.lng])
        marker.setIcon(icon)
        marker.getPopup()?.setContent(popupContent)
      } else {
        // Create new marker
        const marker = L.marker([position.lat, position.lng], { icon })
          .bindPopup(popupContent)
          .on('click', () => {
            onVehicleSelect?.(position.vehicle_id)
          })
          .addTo(mapRef.current!)

        markersRef.current.set(position.vehicle_id, marker)
      }
    })

    // Auto-fit bounds if there are positions
    if (validPositions.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(validPositions.map((p) => [p.lat, p.lng]))
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      setTimeout(() => {
        mapRef.current?.invalidateSize()
      }, 50)
    }
  }, [positions, selectedVehicleId, onVehicleSelect])

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className={`${height} relative block w-full rounded-2xl border border-slate-200 bg-slate-50 shadow-lg`}
        style={{ height: '450px', minHeight: '450px' }}
      />

      {/* Vehicle List */}
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
                    <Clock size={12} />
                    {new Date(position.recorded_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {positions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg bg-slate-50 p-8 text-center">
          <MapPin className="mb-2 text-slate-400" size={32} />
          <p className="text-slate-600">No active vehicles</p>
          <p className="text-xs text-slate-500">Vehicles will appear when drivers go online</p>
        </div>
      )}
    </div>
  )
}
