import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import { Shipment } from '@/types'

interface RouteSegment {
  coords: [number, number][]
  distance: number
  duration: number
  cacheKey: string
}

interface RoutesMapProps {
  shipments: Shipment[]
  origin: {
    lat: number
    lng: number
    id: string
  }
  selectedShipment: Shipment | null
  onShipmentSelect?: (shipment: Shipment) => void
  onRouteOptimized?: (orderedShipmentIds: string[]) => void
  onRouteCalculated?: (distance: number, duration: number) => void
  /**
   * Naikkan nilai ini (misal: refreshKey + 1) dari parent untuk memaksa
   * cache dihapus dan semua rute di-fetch ulang dari ORS.
   */
  refreshKey?: number
}

export default function RoutesMap({
  shipments,
  origin,
  selectedShipment,
  onShipmentSelect,
  onRouteOptimized,
  onRouteCalculated,
  refreshKey = 0,
}: RoutesMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const mainPolylineRef = useRef<L.Polyline | null>(null)
  const selectedPolylineRef = useRef<L.Polyline | null>(null)

  /**
   * Cache koordinat segmen jalan.
   * Key: "startLng,startLat|endLng,endLat"
   * Value: array koordinat [lat, lng] untuk L.polyline
   *
   * Diisi setelah main route fetch berhasil (dari field `segments` response).
   * Highlight effect membaca cache ini sehingga tidak perlu fetch ulang.
   * Cache dikosongkan setiap kali shipments/origin berubah atau refreshKey naik.
   */
  const segmentCacheRef = useRef<Record<string, [number, number][]>>({})

  const [isFetchingRoute, setIsFetchingRoute] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Pin sizes: 1.5x bigger on mobile
  const originIconSize = isMobile ? 60 : 40
  const originIconAnchor = isMobile ? 30 : 20
  const shipmentIconSize = isMobile ? 54 : 36
  const shipmentIconAnchor = isMobile ? 27 : 18

  // ── Inisiasi peta + marker ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([origin.lat, origin.lng], 12)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)
    }

    const map = mapRef.current

    // Hapus marker lama
    markersRef.current.forEach((marker) => map.removeLayer(marker))
    markersRef.current.clear()

    // Marker origin
    const originIcon = L.divIcon({
      html: `
        <div style="
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white; border-radius: 50%;
          width: ${originIconSize}px; height: ${originIconSize}px;
          display: flex; align-items: center; justify-content: center;
          font-weight: bold; font-size: ${isMobile ? 24 : 18}px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          border: 2px solid white;
        ">🚚</div>
      `,
      className: '',
      iconSize: [originIconSize, originIconSize],
      iconAnchor: [originIconAnchor, originIconAnchor],
    })

    const originMarker = L.marker([origin.lat, origin.lng], { icon: originIcon })
      .addTo(map)
      .bindPopup(`<b>${origin.id}</b>`)
    markersRef.current.set('origin', originMarker)

    // Marker tiap shipment
    const priorityColors: Record<string, string> = {
      same_day: '#dc2626',
      express: '#f97316',
      regular: '#3b82f6',
      cargo: '#6366f1',
      economy: '#6b7280',
    }

    shipments.forEach((shipment, index) => {
      const color = priorityColors[shipment.priority] ?? '#6b7280'

      const icon = L.divIcon({
        html: `
          <div style="
            background: ${color}; color: white;
            border-radius: 50%; width: ${shipmentIconSize}px; height: ${shipmentIconSize}px;
            display: flex; align-items: center; justify-content: center;
            font-weight: bold; font-size: ${isMobile ? 18 : 15}px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
          ">${index + 1}</div>
        `,
        className: '',
        iconSize: [shipmentIconSize, shipmentIconSize],
        iconAnchor: [shipmentIconAnchor, shipmentIconAnchor],
      })

      const statusLabel =
        shipment.status === 'DELIVERED'
          ? 'Terkirim'
          : shipment.status === 'IN_TRANSIT'
            ? 'Dalam Perjalanan'
            : shipment.status === 'PICKED_UP'
              ? 'Pengambilan'
              : 'Pending'

      const marker = L.marker([shipment.recipient_lat, shipment.recipient_lng], { icon })
        .addTo(map)
        .bindPopup(
          `
          <div style="min-width:200px">
            <b>${shipment.recipient_name}</b><br/>
            ${shipment.recipient_address}<br/>
            <hr style="margin:8px 0">
            <small><b>Status:</b> ${statusLabel}</small><br/>
            <small><b>Berat:</b> ${shipment.weight_kg} kg</small><br/>
            <small><b>Tracking:</b> ${shipment.tracking_code}</small>
          </div>
        `
        )
        .on('click', () => {
          onShipmentSelect?.(shipment)
        })

      markersRef.current.set(shipment.id, marker)
    })

    // Fit bounds ke semua marker
    if (shipments.length > 0) {
      const bounds = L.latLngBounds([[origin.lat, origin.lng]])
      shipments.forEach((s) => bounds.extend([s.recipient_lat, s.recipient_lng]))
      map.fitBounds(bounds, { padding: [60, 60] })
    }
  }, [shipments, origin, isMobile])

  // ── Gambar rute utama + isi cache segmen ────────────────────────────────────
  // Effect ini di-trigger ulang jika shipments/origin berubah ATAU refreshKey naik.
  // Setiap kali berjalan, cache dikosongkan dahulu agar data tidak stale.
  useEffect(() => {
    const map = mapRef.current
    if (!map || shipments.length === 0) return

    // Hapus polyline lama
    if (mainPolylineRef.current) {
      map.removeLayer(mainPolylineRef.current)
      mainPolylineRef.current = null
    }

    // Kosongkan cache — akan diisi ulang dari response fetch ini
    segmentCacheRef.current = {}

    setIsFetchingRoute(true)

    const originParam = `${origin.lng},${origin.lat}`
    const destParam = shipments.map((s) => `${s.recipient_lng},${s.recipient_lat}`).join('|')
    const prioritiesParam = shipments.map((s) => s.priority).join('|')

    fetch(
      `/api/routes?origin=${originParam}&destinations=${destParam}&priorities=${prioritiesParam}`
    )
      .then((res) => res.json())
      .then((result) => {
        setIsFetchingRoute(false)
        if (!mapRef.current) return

        if (result.success && result.data) {
          // Kirim statistik jarak dan durasi ke parent
          if (onRouteCalculated) {
            onRouteCalculated(result.data.distance || 0, Math.round(result.data.duration || 0))
          }

          // Kirim urutan paket yang sudah dioptimalkan ke parent
          if (onRouteOptimized && result.data.orderedIndices) {
            const orderedIds = result.data.orderedIndices.map(
              (idx: number) => shipments[idx - 1].id
            )
            onRouteOptimized(orderedIds)
          }

          // ── POPULASI CACHE ──────────────────────────────────────────────────
          // Response sekarang menyertakan `segments` per-segmen dengan koordinat
          // lengkap dan cacheKey uniknya. Simpan ke ref agar highlight effect
          // bisa menggunakannya tanpa fetch tambahan ke ORS.
          if (Array.isArray(result.data.segments)) {
            result.data.segments.forEach((seg: RouteSegment) => {
              segmentCacheRef.current[seg.cacheKey] = seg.coords
            })
          }
        }

        const coords =
          result.success && result.data?.coords
            ? result.data.coords
            : [
                [origin.lat, origin.lng],
                ...shipments.map((s) => [s.recipient_lat, s.recipient_lng]),
              ]

        mainPolylineRef.current = L.polyline(coords, {
          color: '#3b82f6',
          weight: 3,
          opacity: 0.75,
          dashArray: '8 6',
        }).addTo(mapRef.current)
      })
      .catch((err) => {
        console.error('Fetch route error:', err)
        setIsFetchingRoute(false)
      })
    // refreshKey diikutsertakan agar tombol "Optimasi Rute" di parent bisa
    // memaksa re-fetch dan invalidasi cache secara manual.
  }, [shipments, origin, refreshKey])

  // ── Highlight segmen menuju shipment yang dipilih ───────────────────────────
  // Tidak melakukan fetch ke ORS jika segmen sudah tersedia di cache.
  // Fetch hanya terjadi sebagai fallback jika cache belum siap (race condition
  // saat main route masih loading atau segmen tidak ada di response).
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedShipment || shipments.length === 0) return

    // Hapus highlight lama sebelum menggambar yang baru
    if (selectedPolylineRef.current) {
      map.removeLayer(selectedPolylineRef.current)
      selectedPolylineRef.current = null
    }

    const currentIndex = shipments.findIndex((s) => s.id === selectedShipment.id)
    const startPoint =
      currentIndex > 0
        ? {
            lat: shipments[currentIndex - 1].recipient_lat,
            lng: shipments[currentIndex - 1].recipient_lng,
          }
        : { lat: origin.lat, lng: origin.lng }

    const cacheKey = `${startPoint.lng},${startPoint.lat}|${selectedShipment.recipient_lng},${selectedShipment.recipient_lat}`

    // ── CACHE HIT: gambar langsung tanpa fetch ──────────────────────────────
    if (segmentCacheRef.current[cacheKey]) {
      selectedPolylineRef.current = L.polyline(segmentCacheRef.current[cacheKey], {
        color: '#3b82f6',
        weight: 10,
        opacity: 1,
      }).addTo(map)

      return () => {
        if (selectedPolylineRef.current && mapRef.current) {
          mapRef.current.removeLayer(selectedPolylineRef.current)
          selectedPolylineRef.current = null
        }
      }
    }

    // ── CACHE MISS: fetch sebagai fallback ──────────────────────────────────
    // Terjadi jika main route masih loading atau cache tidak mengandung segmen ini.
    // Hasil fetch disimpan ke cache agar pemilihan ulang shipment yang sama tidak
    // memicu fetch lagi.
    const controller = new AbortController()

    fetch(
      `/api/routes?origin=${startPoint.lng},${startPoint.lat}&destinations=${selectedShipment.recipient_lng},${selectedShipment.recipient_lat}&priorities=${selectedShipment.priority}`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((result) => {
        if (!mapRef.current) return

        if (selectedPolylineRef.current) {
          mapRef.current.removeLayer(selectedPolylineRef.current)
          selectedPolylineRef.current = null
        }

        if (result.success && result.data?.coords) {
          // Simpan ke cache agar kunjungan berikutnya gratis
          segmentCacheRef.current[cacheKey] = result.data.coords

          selectedPolylineRef.current = L.polyline(result.data.coords, {
            color: '#3b82f6',
            weight: 10,
            opacity: 1,
          }).addTo(mapRef.current)
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Fetch segment route error:', err)
        }
      })

    return () => {
      controller.abort()
      if (selectedPolylineRef.current && mapRef.current) {
        mapRef.current.removeLayer(selectedPolylineRef.current)
        selectedPolylineRef.current = null
      }
    }
  }, [selectedShipment, shipments, origin])

  return (
    <>
      {/* Loading indicator */}
      {isFetchingRoute && (
        <div className="pointer-events-none absolute top-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-md">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-orange-500" />
            Memuat rute jalan...
          </div>
        </div>
      )}

      <div id="map" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
    </>
  )
}
