# Analytics Dashboard Documentation

## Overview

Analytics Dashboard menyediakan visualisasi real-time dari KPI logistik, tren pengiriman, status kendaraan, dan data pengiriman terbaru. Dashboard ini terintegrasi dengan Supabase database untuk fetch data real-time.

## Fitur Utama

### 1. **KPI Cards**

Menampilkan metrik utama bisnis:

- **Active Vehicles**: Jumlah kendaraan dengan status `active`
- **On-Duty Drivers**: Jumlah driver dengan status `on_duty`
- **Pending Shipments**: Jumlah pengiriman dengan status `pending`
- **Critical Warnings**: Jumlah pengiriman yang failed dalam 7 hari terakhir

### 2. **Daily Delivery Trends**

Chart line menampilkan:

- Total deliveries per hari (7 hari terakhir)
- Delivered vs Failed shipments
- Trend analisis untuk performance monitoring

### 3. **Vehicle Status**

Donut chart menampilkan distribusi status kendaraan:

- Active (Hijau)
- Idle (Abu-abu)
- Repair/Maintenance (Merah)

### 4. **Recent Shipments Table**

Menampilkan 5 pengiriman terbaru dengan detail:

- Tracking code
- Sender & Recipient
- Weight & Priority
- Status & Date

## Architecture

```
Frontend (Next.js)
    ↓
API Routes (/api/analytics/*)
    ↓
Analytics Utilities (/lib/analytics.ts)
    ↓
Supabase Database
```

## API Endpoints

### GET `/api/analytics/kpi`

Fetch KPI metrics dari Supabase.

**Response:**

```json
{
  "activeVehicles": 12,
  "onDutyDrivers": 8,
  "pendingShipments": 15,
  "criticalWarnings": 3,
  "totalDistance": 15420,
  "averageFuelConsumption": 0.085,
  "onTimeDeliveryRate": 94.4,
  "averageDeliveryTime": 8.5
}
```

### GET `/api/analytics/trends?period=7days`

Fetch trend data untuk N hari.

**Query Parameters:**

- `period`: `7days` (default), `30days`

**Response:**

```json
[
  {
    "date": "18/5",
    "deliveries": 45,
    "delivered": 42,
    "failed": 3
  }
]
```

### GET `/api/analytics/vehicle-status`

Fetch vehicle status distribution.

**Response:**

```json
[
  { "name": "Active", "value": 8, "color": "#10b981" },
  { "name": "Idle", "value": 3, "color": "#6b7280" },
  { "name": "Repair", "value": 1, "color": "#ef4444" }
]
```

### GET `/api/analytics/recent-shipments`

Fetch 5 pengiriman terbaru.

**Response:**

```json
[
  {
    "trackingCode": "ARM-2026-03-000123",
    "sender": "PT Maju Jaya",
    "recipient": "CV Sejahtera Abadi",
    "weight": "450 kg",
    "priority": "High",
    "status": "In Transit",
    "date": "2026-03-28"
  }
]
```

## Analytics Utilities (`/lib/analytics.ts`)

Utility functions yang dapat di-import dan di-reuse:

```typescript
import { getKPIMetrics, getTrendData, getVehicleStatus, getRecentShipments } from '@/lib/analytics'

// Contoh usage
const kpiData = await getKPIMetrics()
const trends = await getTrendData(7) // 7 hari
const vehicleStatus = await getVehicleStatus()
const recentShipments = await getRecentShipments(5)
```

## Database Queries

### KPI Metrics

- **Active Vehicles**: `SELECT COUNT(*) FROM vehicles WHERE status = 'active'`
- **On-Duty Drivers**: `SELECT COUNT(*) FROM drivers WHERE status = 'on_duty'`
- **Pending Shipments**: `SELECT COUNT(*) FROM shipments WHERE status = 'pending'`
- **Critical Warnings**: `SELECT COUNT(*) FROM shipments WHERE status = 'failed' AND created_at >= NOW() - INTERVAL 7 days`

### On-Time Delivery Rate

Hitung persentase pengiriman yang tepat waktu:

```sql
SELECT
  COUNT(CASE WHEN actual_delivery <= estimated_delivery THEN 1 END) * 100.0 / COUNT(*)
FROM shipments
WHERE status = 'delivered' AND created_at >= NOW() - INTERVAL 7 days
```

### Average Delivery Time

Hitung rata-rata waktu pengiriman dalam jam:

```sql
SELECT
  AVG(EXTRACT(EPOCH FROM (actual_delivery - created_at)) / 3600)
FROM shipments
WHERE status = 'delivered' AND created_at >= NOW() - INTERVAL 7 days
```

## Data Refresh

Dashboard menggunakan client-side fetching via `useEffect` hook. Data di-refresh setiap kali halaman di-mount.

Untuk real-time updates, Anda dapat:

1. Implementasi Supabase Realtime subscriptions
2. Setup polling interval (e.g., setiap 5 menit)
3. Gunakan React Query atau SWR untuk data synchronization

Contoh dengan polling:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchAnalyticsData()
  }, 300000) // 5 menit

  return () => clearInterval(interval)
}, [])
```

## Error Handling

Setiap endpoint meng-return error message dengan HTTP status 500 jika ada masalah:

```json
{
  "error": "Failed to fetch KPI data"
}
```

Frontend menampilkan error card berwarna merah dengan pesan error.

## Performance Optimization

### Current Optimizations:

- ✅ Menggunakan Supabase `count: 'exact'` option untuk efisiensi
- ✅ Filtering by date range untuk reduce query size
- ✅ Separate API endpoints untuk modular caching

### Future Optimizations:

- [ ] Implementasi database views untuk complex queries
- [ ] Add caching layer (Redis/Memcached)
- [ ] Batch queries dengan Promise.all()
- [ ] Supabase Realtime subscriptions untuk live updates

## Troubleshooting

### Dashboard menampilkan "Loading analytics data..."

- Cek Supabase connection di `.env.local`
- Verify API endpoint responses di browser DevTools
- Check Supabase RLS policies

### Data tidak di-update

- Clear browser cache
- Verify Supabase database memiliki data terbaru
- Check API response time di Network tab

### KPI values tidak sesuai

- Verify Supabase shipment status enum values
- Check date filters (timezone issues)
- Review database migrations
