#!/usr/bin/env python
"""
Simple test script untuk anomaly detector tanpa pytest dependency
"""
import sys
from app.schemas.anomaly import AnomalyRequest, AnomalyResponse, AnomalyType
from app.models.anomaly_detector import detect_anomalies


def test_gps_silent_warning():
    """Test GPS silent anomaly dengan severity medium"""
    print("\n✓ Test GPS Silent (Medium Severity)")
    req = AnomalyRequest(
        vehicle_id="vehicle-123",
        last_gps_minutes_ago=20
    )
    resp = detect_anomalies(req)
    assert len(resp.anomalies) == 1, f"Expected 1 anomaly, got {len(resp.anomalies)}"
    assert resp.anomalies[0].anomaly_type == AnomalyType.GPS_SILENT
    assert resp.anomalies[0].severity == "medium"
    print(f"  → {resp.anomalies[0].description}")


def test_gps_silent_critical():
    """Test GPS silent anomaly dengan severity high"""
    print("\n✓ Test GPS Silent (High Severity)")
    req = AnomalyRequest(
        vehicle_id="vehicle-456",
        last_gps_minutes_ago=35
    )
    resp = detect_anomalies(req)
    assert len(resp.anomalies) == 1
    assert resp.anomalies[0].anomaly_type == AnomalyType.GPS_SILENT
    assert resp.anomalies[0].severity == "high"
    print(f"  → {resp.anomalies[0].description}")


def test_route_deviation():
    """Test route deviation anomaly"""
    print("\n✓ Test Route Deviation (Medium Severity)")
    req = AnomalyRequest(
        vehicle_id="vehicle-789",
        last_gps_minutes_ago=5,
        deviation_km=3.5
    )
    resp = detect_anomalies(req)
    assert len(resp.anomalies) == 1
    assert resp.anomalies[0].anomaly_type == AnomalyType.ROUTE_DEVIATION
    assert resp.anomalies[0].severity == "medium"
    print(f"  → {resp.anomalies[0].description}")


def test_route_deviation_critical():
    """Test route deviation dengan severity high"""
    print("\n✓ Test Route Deviation (High Severity)")
    req = AnomalyRequest(
        vehicle_id="vehicle-001",
        last_gps_minutes_ago=5,
        deviation_km=6.0
    )
    resp = detect_anomalies(req)
    assert len(resp.anomalies) == 1
    assert resp.anomalies[0].anomaly_type == AnomalyType.ROUTE_DEVIATION
    assert resp.anomalies[0].severity == "high"
    print(f"  → {resp.anomalies[0].description}")


def test_late_delivery():
    """Test late delivery anomaly"""
    print("\n✓ Test Late Delivery (Medium Severity)")
    req = AnomalyRequest(
        vehicle_id="vehicle-002",
        last_gps_minutes_ago=5,
        eta_overdue_minutes=45
    )
    resp = detect_anomalies(req)
    assert len(resp.anomalies) == 1
    assert resp.anomalies[0].anomaly_type == AnomalyType.LATE_DELIVERY
    assert resp.anomalies[0].severity == "medium"
    print(f"  → {resp.anomalies[0].description}")


def test_speed_violation():
    """Test speed anomaly detection - warning level"""
    print("\n✓ Test Speed Anomaly (Medium Severity)")
    req = AnomalyRequest(
        vehicle_id="vehicle-003",
        last_gps_minutes_ago=5,
        speed_kmh=110.0
    )
    resp = detect_anomalies(req)
    assert len(resp.anomalies) == 1, f"Expected 1 anomaly, got {len(resp.anomalies)}"
    assert resp.anomalies[0].anomaly_type == AnomalyType.SPEED_ANOMALY
    assert resp.anomalies[0].severity == "medium"
    print(f"  → {resp.anomalies[0].description}")


def test_speed_critical():
    """Test speed anomaly detection - critical level"""
    print("\n✓ Test Speed Anomaly (High Severity)")
    req = AnomalyRequest(
        vehicle_id="vehicle-004",
        last_gps_minutes_ago=5,
        speed_kmh=125.0
    )
    resp = detect_anomalies(req)
    assert len(resp.anomalies) == 1
    assert resp.anomalies[0].anomaly_type == AnomalyType.SPEED_ANOMALY
    assert resp.anomalies[0].severity == "high"
    print(f"  → {resp.anomalies[0].description}")


def test_multiple_anomalies():
    """Test multiple anomalies detected simultaneously"""
    print("\n✓ Test Multiple Anomalies")
    req = AnomalyRequest(
        vehicle_id="vehicle-005",
        last_gps_minutes_ago=35,      # GPS silent - HIGH
        deviation_km=5.5,              # Route deviation - HIGH
        eta_overdue_minutes=50,        # Late delivery - MEDIUM
        speed_kmh=115.0                # Speed anomaly - MEDIUM
    )
    resp = detect_anomalies(req)
    assert len(resp.anomalies) == 4, f"Expected 4 anomalies, got {len(resp.anomalies)}"
    
    # Check all types exist
    types = {a.anomaly_type for a in resp.anomalies}
    assert types == {
        AnomalyType.GPS_SILENT,
        AnomalyType.ROUTE_DEVIATION,
        AnomalyType.LATE_DELIVERY,
        AnomalyType.SPEED_ANOMALY
    }, f"Unexpected anomaly types: {types}"
    
    # Check severities
    high_severity = [a for a in resp.anomalies if a.severity == "high"]
    assert len(high_severity) == 2, f"Expected 2 high severity, got {len(high_severity)}"
    
    for anomaly in resp.anomalies:
        print(f"  → [{anomaly.severity.upper()}] {anomaly.anomaly_type}: {anomaly.description}")


def test_no_anomalies():
    """Test normal operation - no anomalies"""
    print("\n✓ Test No Anomalies (Normal Operation)")
    req = AnomalyRequest(
        vehicle_id="vehicle-006",
        last_gps_minutes_ago=5,      # OK
        deviation_km=0.5,             # OK
        eta_overdue_minutes=5,        # OK
        speed_kmh=60.0                # OK
    )
    resp = detect_anomalies(req)
    assert len(resp.anomalies) == 0, f"Expected 0 anomalies, got {len(resp.anomalies)}"
    print(f"  → Vehicle operating normally, no anomalies detected")


def main():
    print("=" * 60)
    print("ANOMALY DETECTOR TEST SUITE")
    print("=" * 60)
    
    tests = [
        test_gps_silent_warning,
        test_gps_silent_critical,
        test_route_deviation,
        test_route_deviation_critical,
        test_late_delivery,
        test_speed_violation,
        test_speed_critical,
        test_multiple_anomalies,
        test_no_anomalies,
    ]
    
    passed = 0
    failed = 0
    
    for test_func in tests:
        try:
            test_func()
            passed += 1
        except Exception as e:
            failed += 1
            print(f"  ✗ FAILED: {str(e)}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "=" * 60)
    print(f"RESULTS: {passed} passed, {failed} failed")
    print("=" * 60 + "\n")
    
    if failed > 0:
        sys.exit(1)
    else:
        print("✓ All tests passed!")


if __name__ == "__main__":
    main()
