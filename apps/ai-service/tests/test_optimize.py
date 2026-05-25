from fastapi.testclient import TestClient
from app.main import app
import os

os.environ["AI_SERVICE_SECRET"] = "test-secret"

client = TestClient(app)
HEADERS = {"X-API-Key": "test-secret"}


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_optimize_route():
    payload = {
        "origin": {"lat": -7.7956, "lng": 110.3695, "shipment_id": "origin"},
        "destinations": [
            {"lat": -7.8014, "lng": 110.3647, "shipment_id": "ship-1"},
            {"lat": -7.7822, "lng": 110.3672, "shipment_id": "ship-2"},
            {"lat": -7.8102, "lng": 110.3801, "shipment_id": "ship-3"},
        ],
    }
    resp = client.post("/optimize-route/", json=payload, headers=HEADERS)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["ordered_waypoints"]) == 3
    assert data["estimated_distance_km"] > 0


def test_detect_anomaly_gps_silent():
    payload = {
        "vehicle_id": "vehicle-123",
        "last_gps_minutes_ago": 20,
    }
    resp = client.post("/detect-anomaly/", json=payload, headers=HEADERS)
    assert resp.status_code == 200
    anomalies = resp.json()["anomalies"]
    assert len(anomalies) == 1
    assert anomalies[0]["anomaly_type"] == "gps_silent"
    assert anomalies[0]["severity"] == "medium"


def test_detect_anomaly_gps_critical():
    payload = {
        "vehicle_id": "vehicle-456",
        "last_gps_minutes_ago": 35,
    }
    resp = client.post("/detect-anomaly/", json=payload, headers=HEADERS)
    assert resp.status_code == 200
    anomalies = resp.json()["anomalies"]
    assert len(anomalies) == 1
    assert anomalies[0]["anomaly_type"] == "gps_silent"
    assert anomalies[0]["severity"] == "high"


def test_detect_anomaly_route_deviation():
    payload = {
        "vehicle_id": "vehicle-789",
        "last_gps_minutes_ago": 5,
        "deviation_km": 3.5,
    }
    resp = client.post("/detect-anomaly/", json=payload, headers=HEADERS)
    assert resp.status_code == 200
    anomalies = resp.json()["anomalies"]
    assert len(anomalies) == 1
    assert anomalies[0]["anomaly_type"] == "route_deviation"
    assert anomalies[0]["severity"] == "medium"


def test_detect_anomaly_route_deviation_critical():
    payload = {
        "vehicle_id": "vehicle-001",
        "last_gps_minutes_ago": 5,
        "deviation_km": 6.0,
    }
    resp = client.post("/detect-anomaly/", json=payload, headers=HEADERS)
    assert resp.status_code == 200
    anomalies = resp.json()["anomalies"]
    assert len(anomalies) == 1
    assert anomalies[0]["anomaly_type"] == "route_deviation"
    assert anomalies[0]["severity"] == "high"


def test_detect_anomaly_late_delivery():
    payload = {
        "vehicle_id": "vehicle-002",
        "last_gps_minutes_ago": 5,
        "eta_overdue_minutes": 45,
    }
    resp = client.post("/detect-anomaly/", json=payload, headers=HEADERS)
    assert resp.status_code == 200
    anomalies = resp.json()["anomalies"]
    assert len(anomalies) == 1
    assert anomalies[0]["anomaly_type"] == "late_delivery"
    assert anomalies[0]["severity"] == "medium"


def test_detect_anomaly_speed_violation():
    payload = {
        "vehicle_id": "vehicle-003",
        "last_gps_minutes_ago": 5,
        "speed_kmh": 110.0,
    }
    resp = client.post("/detect-anomaly/", json=payload, headers=HEADERS)
    assert resp.status_code == 200
    anomalies = resp.json()["anomalies"]
    assert len(anomalies) == 1
    assert anomalies[0]["anomaly_type"] == "speed_anomaly"
    assert anomalies[0]["severity"] == "medium"


def test_detect_anomaly_speed_critical():
    payload = {
        "vehicle_id": "vehicle-004",
        "last_gps_minutes_ago": 5,
        "speed_kmh": 125.0,
    }
    resp = client.post("/detect-anomaly/", json=payload, headers=HEADERS)
    assert resp.status_code == 200
    anomalies = resp.json()["anomalies"]
    assert len(anomalies) == 1
    assert anomalies[0]["anomaly_type"] == "speed_anomaly"
    assert anomalies[0]["severity"] == "high"


def test_detect_multiple_anomalies():
    """Test detection of multiple anomalies simultaneously"""
    payload = {
        "vehicle_id": "vehicle-005",
        "last_gps_minutes_ago": 35,  # GPS silent - HIGH
        "deviation_km": 5.5,          # Route deviation - HIGH
        "eta_overdue_minutes": 50,    # Late delivery - MEDIUM
        "speed_kmh": 115.0,           # Speed anomaly - MEDIUM
    }
    resp = client.post("/detect-anomaly/", json=payload, headers=HEADERS)
    assert resp.status_code == 200
    anomalies = resp.json()["anomalies"]
    assert len(anomalies) == 4
    
    # Check all anomaly types are present
    anomaly_types = {a["anomaly_type"] for a in anomalies}
    assert anomaly_types == {"gps_silent", "route_deviation", "late_delivery", "speed_anomaly"}
    
    # Check severities
    high_severity = [a for a in anomalies if a["severity"] == "high"]
    assert len(high_severity) == 2  # GPS and route deviation


def test_detect_no_anomalies():
    """Test when vehicle is operating normally"""
    payload = {
        "vehicle_id": "vehicle-006",
        "last_gps_minutes_ago": 5,  # OK
        "deviation_km": 0.5,        # OK
        "eta_overdue_minutes": 5,   # OK
        "speed_kmh": 60.0,          # OK
    }
    resp = client.post("/detect-anomaly/", json=payload, headers=HEADERS)
    assert resp.status_code == 200
    anomalies = resp.json()["anomalies"]
    assert len(anomalies) == 0


def test_unauthorized():
    resp = client.post("/optimize-route/", json={}, headers={"X-API-Key": "wrong"})
    assert resp.status_code == 401
