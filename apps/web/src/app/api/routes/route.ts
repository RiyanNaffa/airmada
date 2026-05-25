import { NextResponse } from 'next/server'

// Types
interface Coordinate {
  lat: number
  lng: number
  priority?: string
}

interface RouteSegment {
  coords: [number, number][]
  distance: number
  duration: number
  cacheKey: string
}

// Const
const PRIORITY_WEIGHT: Record<string, number> = {
  same_day: 1,
  express: 2,
  regular: 3,
  cargo: 4,
  economy: 5,
}
const ORS_API_KEY = process.env.ORS_API_KEY || '<openrouteservice-key>'
const ORS_MATRIX_URL = 'https://api.openrouteservice.org/v2/matrix/driving-car'
const ORS_DIRECTIONS_URL = 'https://api.openrouteservice.org/v2/directions/driving-car'

async function optimizeRouteWithMatrix(origin: Coordinate, destinations: Coordinate[]) {
  if (!destinations || destinations.length === 0) return { ordered: [], indices: [] }
  if (destinations.length === 1) return { ordered: destinations, indices: [0] } // Tidak perlu optimasi jika hanya 1 tujuan

  const points = [origin, ...destinations]
  const locations = points.map((p) => [p.lng, p.lat])

  const response = await fetch(ORS_MATRIX_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: ORS_API_KEY,
    },
    body: JSON.stringify({
      locations: locations,
      metrics: ['distance', 'duration'],
      resolve_locations: false,
    }),
  })

  if (!response.ok) throw new Error('Gagal memanggil ORS Matrix API')

  const data = await response.json()
  const distances: number[][] = data.distances

  // Algoritma Nearest-Neighbor TSP
  const visited = new Set<number>()
  visited.add(0)

  let currentIndex = 0
  const orderedDestinations: Coordinate[] = []
  const orderedIndices: number[] = []

  while (visited.size < points.length) {
    let nearestIndex = -1
    let minDistance = Infinity
    let currentHighestPriority = Infinity

    // Langkah 1: Cari nilai prioritas tertinggi dari sisa titik yang belum dikunjungi
    for (let i = 1; i < points.length; i++) {
      if (!visited.has(i)) {
        const pWeight = PRIORITY_WEIGHT[points[i].priority || 'REGULAR'] || 99
        if (pWeight < currentHighestPriority) {
          currentHighestPriority = pWeight
        }
      }
    }
    // Langkah 2: Lakukan pencarian titik terdekat HANYA pada kelompok prioritas tertinggi
    for (let i = 1; i < points.length; i++) {
      if (!visited.has(i)) {
        const pWeight = PRIORITY_WEIGHT[points[i].priority || 'REGULAR'] || 99
        if (pWeight === currentHighestPriority) {
          const dist = distances[currentIndex][i]
          if (dist !== null && dist < minDistance) {
            minDistance = dist
            nearestIndex = i
          }
        }
      }
    }

    if (nearestIndex === -1) break

    visited.add(nearestIndex)
    orderedDestinations.push(points[nearestIndex])
    orderedIndices.push(nearestIndex)
    currentIndex = nearestIndex
  }

  return { ordered: orderedDestinations, indices: orderedIndices }
}

async function fetchRoadRoute(waypoints: Coordinate[]) {
  if (waypoints.length < 2) return null

  const fetchPromises = []

  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i]
    const end = waypoints[i + 1]
    const url = `${ORS_DIRECTIONS_URL}?api_key=${ORS_API_KEY}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`

    const request = fetch(url, { signal: AbortSignal.timeout(10000) }).then(async (res) => {
      if (!res.ok) {
        const errorText = await res.text()
        console.error(`ORS Error ${res.status}:`, errorText)
        throw new Error(`Gagal mengambil data segmen jalan (Status: ${res.status})`)
      }
      return res.json()
    })

    fetchPromises.push(request)
  }

  const results = await Promise.all(fetchPromises)
  let allCoords: [number, number][] = []
  let totalDistance = 0
  let totalDuration = 0

  // Simpan koordinat per-segmen beserta cache key untuk digunakan frontend
  const segments: RouteSegment[] = []

  for (let i = 0; i < results.length; i++) {
    const data = results[i]
    if (!data.features || data.features.length === 0) continue

    const route = data.features[0]
    const segmentCoords: [number, number][] = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng]
    )

    // Simpan SEBELUM shift agar koordinat awal segmen tetap ada di cache
    const start = waypoints[i]
    const end = waypoints[i + 1]
    segments.push({
      coords: [...segmentCoords],
      distance: route.properties.summary.distance / 1000,
      duration: route.properties.summary.duration / 60,
      // Key unik berdasarkan koordinat start→end segmen ini
      cacheKey: `${start.lng},${start.lat}|${end.lng},${end.lat}`,
    })

    if (i > 0) segmentCoords.shift() // Hindari duplikat titik sambung

    allCoords = allCoords.concat(segmentCoords)
    totalDistance += route.properties.summary.distance
    totalDuration += route.properties.summary.duration
  }

  return {
    coords: allCoords,
    distance: totalDistance / 1000,
    duration: totalDuration / 60,
    // Data segmen individual — dikembalikan ke frontend untuk di-cache
    segments,
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    // Format param murni: origin=106.8,-6.2 (lng,lat)
    // Format param murni: destinations=106.815,-6.198|106.82,-6.215 (lng,lat)
    // Format param terpisah: priorities=express|regular
    const originParam = searchParams.get('origin')
    const destParam = searchParams.get('destinations')
    const prioritiesParam = searchParams.get('priorities')

    if (!originParam || !destParam) {
      return NextResponse.json({ error: 'Origin dan destinations wajib diisi' }, { status: 400 })
    }

    const [oLng, oLat] = originParam.split(',').map(Number)
    const origin: Coordinate = { lng: oLng, lat: oLat }
    const prioritiesArr = prioritiesParam ? prioritiesParam.split('|') : []

    const destinations: Coordinate[] = destParam.split('|').map((d, index) => {
      // Hanya ekstrak lng dan lat (sudah bersih tanpa string)
      const [lng, lat] = d.split(',')
      return {
        lng: Number(lng),
        lat: Number(lat),
        // Kembalikan nilai properti prioritas melalui array gabungan terpisah
        priority: prioritiesArr[index] || 'REGULAR',
      }
    })

    // Tarik hasil optimasi berjenjang
    const { ordered, indices } = await optimizeRouteWithMatrix(origin, destinations)
    const waypoints = [origin, ...ordered]
    const routeData = await fetchRoadRoute(waypoints)

    if (!routeData) {
      return NextResponse.json({ error: 'Gagal membuat rute' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        coords: routeData.coords,
        distance: routeData.distance,
        duration: routeData.duration,
        orderedIndices: indices,
        // Segmen individual dikembalikan agar frontend bisa cache tanpa fetch ulang
        segments: routeData.segments,
      },
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui'
    console.error('GET /api/routes error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
