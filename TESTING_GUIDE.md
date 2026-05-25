## Testing Panduan Implementasi AI Service

### Prasyarat

- ✅ Python 3.9+
- ✅ Node.js 18+
- ✅ AI Service sudah berjalan di `http://localhost:8000`
- ✅ Web app sudah berjalan di `http://localhost:3000`

---

## Bagian 1: Verifikasi Backend AI Service

### Step 1: Start AI Service

```bash
cd apps/ai-service

# Install dependencies
pip install -r requirements-dev.txt

# Run server
python -m uvicorn app.main:app --reload --port 8000
```

Expected output:

```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Step 2: Test Health Check

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{ "status": "ok", "service": "airmada-ai" }
```

### Step 3: Test Route Optimization Endpoint

```bash
curl -X POST http://localhost:8000/optimize-route \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-secret-change-in-production" \
  -d '{
    "origin": {"lat": -6.2088, "lng": 106.8456},
    "destinations": [
      {"lat": -6.1751, "lng": 106.8228, "shipment_id": "SHP001"},
      {"lat": -6.2155, "lng": 106.8743, "shipment_id": "SHP002"}
    ]
  }'
```

Expected response:

```json
{
  "ordered_waypoints": [...],
  "estimated_distance_km": 12.5,
  "estimated_duration_min": 45
}
```

### Step 4: Test ETA Prediction Endpoint

```bash
curl -X POST http://localhost:8000/predict-eta \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-secret-change-in-production" \
  -d '{
    "distance_km": 45.5,
    "stops_remaining": 3,
    "traffic_factor": 1.2
  }'
```

Expected response:

```json
{
  "estimated_minutes": 125,
  "confidence": 0.8
}
```

### Step 5: Test Anomaly Detection Endpoint

```bash
curl -X POST http://localhost:8000/detect-anomaly \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-secret-change-in-production" \
  -d '{
    "vehicle_id": "VEH001",
    "last_gps_minutes_ago": 5,
    "deviation_km": 2.5,
    "eta_overdue_minutes": 15,
    "speed_kmh": 120
  }'
```

Expected response:

```json
{
  "anomalies": [
    {
      "vehicle_id": "VEH001",
      "anomaly_type": "route_deviation",
      "severity": "medium",
      "description": "Kendaraan menyimpang 2.5 km dari rute",
      "confidence": 0.95
    },
    {
      "vehicle_id": "VEH001",
      "anomaly_type": "late_delivery",
      "severity": "medium",
      "description": "Terlambat 15 menit dari estimasi",
      "confidence": 0.9
    },
    {
      "vehicle_id": "VEH001",
      "anomaly_type": "speed_anomaly",
      "severity": "high",
      "description": "Kendaraan melaju dengan kecepatan 120.0 km/h",
      "confidence": 0.85
    }
  ]
}
```

---

## Bagian 2: Verifikasi Frontend API Routes

### Step 1: Ensure Web App is Running

```bash
cd apps/web
npm run dev
```

Expected output:

```
Local:        http://localhost:3000
```

### Step 2: Test Frontend Route Optimization API

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

Expected: Same response as backend (proxied through frontend)

### Step 3: Test Frontend ETA Prediction API

```bash
curl -X POST http://localhost:3000/api/ai/predict-eta \
  -H "Content-Type: application/json" \
  -d '{
    "distance_km": 45.5,
    "stops_remaining": 3
  }'
```

### Step 4: Test Frontend Anomaly Detection API

```bash
curl -X POST http://localhost:3000/api/ai/detect-anomaly \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": "VEH001",
    "last_gps_minutes_ago": 5
  }'
```

---

## Bagian 3: Test React Components

### Option A: Manual Component Testing

1. **Create a test page** (temporary):

```typescript
// apps/web/src/app/(dashboard)/ai-test/page.tsx

import { AIIntegrationDemo } from '@/components/dashboard/AIIntegrationDemo'

export default function AITestPage() {
  return (
    <div className="container mx-auto p-6">
      <AIIntegrationDemo />
    </div>
  )
}
```

2. **Visit the page**:
   - Open browser: `http://localhost:3000/ai-test`
   - Click "Coba Optimasi Rute" button
   - Click "Coba Prediksi ETA" button
   - Click "Coba Deteksi Anomali" button

3. **Verify results**:
   - Route optimization shows ordered waypoints
   - ETA prediction shows estimated minutes
   - Anomaly detection shows alerts (if any)

### Option B: Automated Testing with Playwright

```typescript
// apps/web/tests/e2e/ai-service.spec.ts

import { test, expect } from '@playwright/test'

test('Route Optimization', async ({ page }) => {
  await page.goto('http://localhost:3000/ai-test')

  await page.click('button:has-text("Coba Optimasi Rute")')
  await page.waitForTimeout(2000)

  const result = await page.locator('[class*="RouteOptimization"]')
  await expect(result).toBeVisible()
})

test('ETA Prediction', async ({ page }) => {
  await page.goto('http://localhost:3000/ai-test')

  await page.click('button:has-text("Coba Prediksi ETA")')
  await page.waitForTimeout(2000)

  const result = await page.locator('text=menit')
  await expect(result).toBeVisible()
})

test('Anomaly Detection', async ({ page }) => {
  await page.goto('http://localhost:3000/ai-test')

  await page.click('button:has-text("Coba Deteksi Anomali")')
  await page.waitForTimeout(2000)

  const result = await page.locator('[class*="AnomalyAlerts"]')
  await expect(result).toBeVisible()
})
```

---

## Bagian 4: End-to-End Testing

### Test Scenario 1: Route Optimization Workflow

```typescript
import { optimizeRoute } from '@/lib/ai-client'

async function testRouteOptimization() {
  try {
    const result = await optimizeRoute({
      origin: { lat: -6.2088, lng: 106.8456 },
      destinations: [
        { lat: -6.1751, lng: 106.8228, shipment_id: 'SHP001' },
        { lat: -6.2155, lng: 106.8743, shipment_id: 'SHP002' },
        { lat: -6.1888, lng: 106.8899, shipment_id: 'SHP003' },
      ],
    })

    console.log('✓ Route optimized')
    console.log(`  Distance: ${result.estimated_distance_km} km`)
    console.log(`  Duration: ${result.estimated_duration_min} min`)
    console.log(`  Waypoints: ${result.ordered_waypoints.length}`)

    return result.ordered_waypoints.length === 3
  } catch (error) {
    console.error('✗ Route optimization failed:', error)
    return false
  }
}
```

### Test Scenario 2: ETA Prediction Workflow

```typescript
import { predictETA } from '@/lib/ai-client'

async function testETAPrediction() {
  try {
    const result = await predictETA({
      distance_km: 45.5,
      stops_remaining: 3,
      traffic_factor: 1.2,
    })

    console.log('✓ ETA predicted')
    console.log(`  Minutes: ${result.estimated_minutes}`)
    console.log(`  Confidence: ${Math.round(result.confidence * 100)}%`)

    return result.estimated_minutes > 0
  } catch (error) {
    console.error('✗ ETA prediction failed:', error)
    return false
  }
}
```

### Test Scenario 3: Anomaly Detection Workflow

```typescript
import { detectAnomalies } from '@/lib/ai-client'

async function testAnomalyDetection() {
  try {
    const result = await detectAnomalies({
      vehicle_id: 'VEH001',
      last_gps_minutes_ago: 30,
      deviation_km: 5.0,
      eta_overdue_minutes: 20,
      speed_kmh: 140,
    })

    console.log('✓ Anomalies detected')
    console.log(`  Total: ${result.anomalies.length}`)
    result.anomalies.forEach((a) => {
      console.log(`  - ${a.anomaly_type}: ${a.severity}`)
    })

    return result.anomalies.length > 0
  } catch (error) {
    console.error('✗ Anomaly detection failed:', error)
    return false
  }
}
```

---

## Bagian 5: Running All Tests

### Quick Test Script

```bash
#!/bin/bash
cd apps/web

echo "🧪 Running AI Service Integration Tests"
echo "========================================"

# Test 1
npm run test -- --testNamePattern="Route Optimization"

# Test 2
npm run test -- --testNamePattern="ETA Prediction"

# Test 3
npm run test -- --testNamePattern="Anomaly Detection"

echo "✅ All tests completed"
```

### Comprehensive Testing

```bash
# Backend tests
cd apps/ai-service
python -m pytest tests/ -v

# Frontend tests
cd apps/web
npm run test
npm run test:e2e
npm run build  # Verify build succeeds
```

---

## Troubleshooting Test Failures

### Issue: "AI Service error: 401 Unauthorized"

**Solution**: Verify `AI_SERVICE_SECRET` in `.env.local`

```bash
AI_SERVICE_SECRET=dev-secret-change-in-production
```

### Issue: "Failed to fetch"

**Solution**: Ensure AI Service is running

```bash
# Check if running
curl http://localhost:8000/health

# If not running, start it:
cd apps/ai-service && python -m uvicorn app.main:app --reload
```

### Issue: Route optimization returns empty array

**Solution**: Verify destination coordinates are valid

- Latitude must be between -90 and 90
- Longitude must be between -180 and 180
- Jakarta coordinates: lat: -6.2088, lng: 106.8456

### Issue: ETA returns unrealistic time

**Solution**: Check input parameters

- distance_km should be > 0
- stops_remaining should be >= 0
- traffic_factor should be around 1.0 (normal) or > 1.0 (congested)

### Issue: Anomaly detection returns empty

**Solution**: Threshold not met. Try:

- last_gps_minutes_ago > 15 (for GPS Silent)
- deviation_km > 2.0 (for Route Deviation)
- eta_overdue_minutes > 10 (for Late Delivery)
- speed_kmh > 80 (for Speed Anomaly)

---

## Success Criteria

✅ All tests should pass if:

1. Backend returns 200 status code
2. Frontend proxies requests correctly
3. Response data matches expected schema
4. Components render without errors
5. No console errors or warnings

---

## Next Steps After Testing

1. ✅ Integrate into DispatcherDashboard
2. ✅ Add real-time monitoring to fleet dashboard
3. ✅ Show ETA in shipment tracking
4. ✅ Setup alerts for anomalies
5. ✅ Add analytics/metrics collection

---

For questions or issues, refer to:

- `AI_INTEGRATION_GUIDE.md` - Complete integration guide
- `INTEGRATION_CHECKLIST.md` - Feature checklist
- `apps/ai-service/` - Backend code
- `apps/web/src/lib/ai-client.ts` - Frontend utilities
