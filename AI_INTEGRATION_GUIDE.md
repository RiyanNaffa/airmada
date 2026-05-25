# AI Service Integration Guide

## Ringkasan

Sistem aiRMADA sekarang memiliki integrasi lengkap dengan AI Service backend untuk:

- ✅ Optimasi Rute (TSP Algorithm)
- ✅ Prediksi ETA (Distance + Stops + Traffic)
- ✅ Deteksi Anomali (GPS Silent, Route Deviation, Late Delivery, Speed Anomaly)

## Arsitektur

```
Frontend (Next.js)
  ↓
API Routes (/api/ai/*)
  ↓
AI Service (FastAPI Python)
  ↓
Business Logic (Optimization, Detection)
```

## Quick Start

### 1. Optimasi Rute

```typescript
import { useRouteOptimization } from '@/hooks/useRouteOptimization'

function MyComponent() {
  const { optimize, data, loading, error } = useRouteOptimization()

  const handleOptimize = async () => {
    const result = await optimize(
      { lat: -6.2088, lng: 106.8456 }, // origin
      [
        { lat: -6.1751, lng: 106.8228, shipment_id: 'SHP001' },
        { lat: -6.2155, lng: 106.8743, shipment_id: 'SHP002' },
      ] // destinations
    )
    console.log(result.ordered_waypoints)
    console.log(`Jarak: ${result.estimated_distance_km} km`)
    console.log(`Durasi: ${result.estimated_duration_min} menit`)
  }

  return <button onClick={handleOptimize}>{loading ? 'Loading...' : 'Optimasi'}</button>
}
```

### 2. Prediksi ETA

```typescript
import { useETAPrediction } from '@/hooks/useETAPrediction'

function MyComponent() {
  const { predict, data, loading, error } = useETAPrediction()

  const handlePredict = async () => {
    const result = await predict(
      45.5,  // distance_km
      3,     // stops_remaining
      1.2    // traffic_factor (optional, default: 1.0)
    )
    console.log(`ETA: ${result.estimated_minutes} menit`)
    console.log(`Confidence: ${result.confidence * 100}%`)
  }

  return <button onClick={handlePredict}>{loading ? 'Loading...' : 'Prediksi ETA'}</button>
}
```

### 3. Deteksi Anomali

```typescript
import { useAnomalyDetection } from '@/hooks/useAnomalyDetection'

function MyComponent() {
  const { detect, anomalies, loading, error } = useAnomalyDetection()

  const handleDetect = async () => {
    await detect('VEH001', 5, {
      deviation_km: 2.5,
      eta_overdue_minutes: 15,
      speed_kmh: 120,
    })
  }

  return (
    <div>
      <button onClick={handleDetect}>{loading ? 'Loading...' : 'Deteksi'}</button>
      {anomalies.map((anomaly) => (
        <div key={anomaly.anomaly_type}>
          {anomaly.description} - {anomaly.severity}
        </div>
      ))}
    </div>
  )
}
```

## File Structure

```
apps/web/src/
├── app/api/ai/
│   ├── optimize-route/route.ts     ✓ Implemented
│   ├── predict-eta/route.ts        ✓ Implemented
│   └── detect-anomaly/route.ts     ✓ Implemented
├── lib/
│   └── ai-client.ts                ✓ Client utilities
├── hooks/
│   ├── useRouteOptimization.ts     ✓ Route optimization hook
│   ├── useETAPrediction.ts         ✓ ETA prediction hook
│   └── useAnomalyDetection.ts      ✓ Anomaly detection hook
└── components/dashboard/
    ├── AnomalyAlerts.tsx           ✓ Anomaly display component
    ├── RouteOptimizationResult.tsx ✓ Route result display component
    └── AIIntegrationDemo.tsx       ✓ Demo page
```

## Environment Configuration

Pastikan file `.env.local` sudah memiliki:

```
# AI Service Configuration
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_SECRET=your-secret-key-here
```

## Integrasi ke Existing Components

### Di DispatcherDashboard

```typescript
import { useRouteOptimization } from '@/hooks/useRouteOptimization'
import { RouteOptimizationResult } from '@/components/dashboard/RouteOptimizationResult'

export function DispatcherDashboard() {
  const { optimize, data } = useRouteOptimization()

  const handleDispatchOptimal = async () => {
    const shipments = getSelectedShipments()
    const result = await optimize(warehouseLocation, shipments)
    assignOptimalRoute(result)
  }

  return (
    <div>
      <button onClick={handleDispatchOptimal}>Dispatch Optimal Route</button>
      {data && <RouteOptimizationResult result={data} />}
    </div>
  )
}
```

### Di Vehicle Monitoring

```typescript
import { useAnomalyDetection } from '@/hooks/useAnomalyDetection'
import { AnomalyAlerts } from '@/components/dashboard/AnomalyAlerts'

export function VehicleMonitoring({ vehicleId }) {
  const { anomalies } = useAnomalyDetection()

  return (
    <AnomalyAlerts
      vehicleId={vehicleId}
      lastGpsMinutesAgo={lastUpdate}
      deviation_km={routeDeviation}
      eta_overdue_minutes={delayMinutes}
      speed_kmh={currentSpeed}
    />
  )
}
```

### Di Shipment Tracking

```typescript
import { useETAPrediction } from '@/hooks/useETAPrediction'

export function ShipmentTracking({ shipment }) {
  const { predict, data } = useETAPrediction()

  useEffect(() => {
    predict(
      shipment.remaining_distance_km,
      shipment.remaining_stops,
      shipment.traffic_factor
    )
  }, [shipment])

  return (
    <div>
      {data && (
        <p>Estimasi tiba: {formatTime(data.estimated_minutes)}</p>
      )}
    </div>
  )
}
```

## API Endpoints

### POST /api/ai/optimize-route

**Request:**

```json
{
  "origin": { "lat": -6.2088, "lng": 106.8456 },
  "destinations": [{ "lat": -6.1751, "lng": 106.8228, "shipment_id": "SHP001" }]
}
```

**Response:**

```json
{
  "ordered_waypoints": [...],
  "estimated_distance_km": 12.5,
  "estimated_duration_min": 45
}
```

### POST /api/ai/predict-eta

**Request:**

```json
{
  "distance_km": 45.5,
  "stops_remaining": 3,
  "traffic_factor": 1.2
}
```

**Response:**

```json
{
  "estimated_minutes": 125,
  "confidence": 0.8
}
```

### POST /api/ai/detect-anomaly

**Request:**

```json
{
  "vehicle_id": "VEH001",
  "last_gps_minutes_ago": 5,
  "deviation_km": 2.5,
  "eta_overdue_minutes": 15,
  "speed_kmh": 120
}
```

**Response:**

```json
{
  "anomalies": [
    {
      "vehicle_id": "VEH001",
      "anomaly_type": "route_deviation",
      "severity": "medium",
      "description": "Kendaraan menyimpang 2.5 km dari rute",
      "confidence": 0.95
    }
  ]
}
```

## Testing

### Test Route Optimization

```bash
curl -X POST http://localhost:3000/api/ai/optimize-route \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"lat": -6.2088, "lng": 106.8456},
    "destinations": [
      {"lat": -6.1751, "lng": 106.8228, "shipment_id": "SHP001"},
      {"lat": -6.2155, "lng": 106.8743, "shipment_id": "SHP002"}
    ]
  }'
```

### Test ETA Prediction

```bash
curl -X POST http://localhost:3000/api/ai/predict-eta \
  -H "Content-Type: application/json" \
  -d '{
    "distance_km": 45.5,
    "stops_remaining": 3,
    "traffic_factor": 1.2
  }'
```

### Test Anomaly Detection

```bash
curl -X POST http://localhost:3000/api/ai/detect-anomaly \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": "VEH001",
    "last_gps_minutes_ago": 5,
    "deviation_km": 2.5,
    "eta_overdue_minutes": 15,
    "speed_kmh": 120
  }'
```

## Next Steps

1. ✓ Backend AI Service sudah berfungsi
2. ✓ Frontend API routes sudah implemented
3. ✓ Client utilities dan hooks sudah tersedia
4. ✓ UI Components untuk displaying results sudah siap
5. TODO: Integrasikan ke DispatcherDashboard untuk route optimization
6. TODO: Integrasikan ke VehicleMonitoring untuk anomaly detection
7. TODO: Integrasikan ke ShipmentTracking untuk ETA display
8. TODO: Setup real-time updates (WebSocket/polling)

## Troubleshooting

### "Failed to optimize route" error

- Pastikan AI Service berjalan di `AI_SERVICE_URL`
- Cek `AI_SERVICE_SECRET` di environment
- Periksa format input (origin & destinations harus punya lat/lng)

### ETA prediction selalu return sama

- Traffic factor mungkin tidak di-update
- Distance atau stops mungkin tidak berubah
- Cek apakah real-time data ter-update

### Anomaly detection tidak mendeteksi apa-apa

- Threshold mungkin terlalu tinggi, cek `anomaly_constants.py` di backend
- Pastikan data yang dikirim dalam range yang wajar
- Confidence score menunjukkan seberapa yakin deteksi itu

## Support

Untuk pertanyaan atau issue, cek:

- Backend implementation: `apps/ai-service/app/models/`
- Frontend integration: `apps/web/src/lib/ai-client.ts`
- Component examples: `apps/web/src/components/dashboard/AIIntegrationDemo.tsx`
