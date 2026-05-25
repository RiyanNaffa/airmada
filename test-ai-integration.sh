#!/bin/bash
# Test script untuk AI Service integration
# Usage: bash test-ai-integration.sh

echo "🧪 Testing aiRMADA AI Service Integration"
echo "=========================================="
echo ""

API_URL="${1:-http://localhost:3000}"
AI_SECRET="dev-secret-change-in-production"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Route Optimization
echo "📍 Test 1: Route Optimization"
echo "----"
curl -X POST "$API_URL/api/ai/optimize-route" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"lat": -6.2088, "lng": 106.8456},
    "destinations": [
      {"lat": -6.1751, "lng": 106.8228, "shipment_id": "SHP001"},
      {"lat": -6.2155, "lng": 106.8743, "shipment_id": "SHP002"},
      {"lat": -6.1888, "lng": 106.8899, "shipment_id": "SHP003"}
    ]
  }' -s | jq .

echo ""
echo "✓ Route Optimization test complete"
echo ""

# Test 2: ETA Prediction
echo "⏱️  Test 2: ETA Prediction"
echo "----"
curl -X POST "$API_URL/api/ai/predict-eta" \
  -H "Content-Type: application/json" \
  -d '{
    "distance_km": 45.5,
    "stops_remaining": 3,
    "traffic_factor": 1.2
  }' -s | jq .

echo ""
echo "✓ ETA Prediction test complete"
echo ""

# Test 3: Anomaly Detection
echo "🚨 Test 3: Anomaly Detection"
echo "----"
curl -X POST "$API_URL/api/ai/detect-anomaly" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": "VEH001",
    "last_gps_minutes_ago": 5,
    "deviation_km": 2.5,
    "eta_overdue_minutes": 15,
    "speed_kmh": 120
  }' -s | jq .

echo ""
echo "✓ Anomaly Detection test complete"
echo ""

echo "=========================================="
echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Check if all API calls returned valid responses"
echo "2. Verify anomalies are detected correctly"
echo "3. Check route optimization results"
echo "4. Integrate components into your dashboard"
