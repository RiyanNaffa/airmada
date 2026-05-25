from typing import List
from ..schemas.anomaly import AnomalyRequest, AnomalyResult, AnomalyResponse, AnomalyType
from .anomaly_constants import (
    GPS_SILENT_WARNING_MINUTES, GPS_SILENT_CRITICAL_MINUTES,
    ROUTE_DEVIATION_WARNING_KM, ROUTE_DEVIATION_CRITICAL_KM,
    DELIVERY_DELAY_WARNING_MINUTES, DELIVERY_DELAY_CRITICAL_MINUTES,
    SPEED_WARNING_KMH, SPEED_CRITICAL_KMH,
    GPS_CONFIDENCE, ROUTE_CONFIDENCE, DELIVERY_CONFIDENCE, SPEED_CONFIDENCE
)


def detect_anomalies(req: AnomalyRequest) -> AnomalyResponse:
    """
    Rule-based anomaly detection with configurable thresholds.
    Bisa diganti/ditambah model ML (Isolation Forest) di sprint berikutnya.
    
    Detects:
    - GPS silent: No GPS signal for extended period
    - Route deviation: Vehicle off-route by more than threshold
    - Late delivery: Delivery exceeds ETA significantly
    - Speed anomaly: Vehicle speed exceeds safe limits
    """
    if not req.vehicle_id:
        raise ValueError("vehicle_id is required")
    
    anomalies: List[AnomalyResult] = []

    # GPS tidak responsif
    if req.last_gps_minutes_ago > GPS_SILENT_WARNING_MINUTES:
        severity = "high" if req.last_gps_minutes_ago > GPS_SILENT_CRITICAL_MINUTES else "medium"
        anomalies.append(AnomalyResult(
            vehicle_id=req.vehicle_id,
            anomaly_type=AnomalyType.GPS_SILENT,
            severity=severity,
            description=f"Tidak ada sinyal GPS selama {req.last_gps_minutes_ago} menit",
            confidence=GPS_CONFIDENCE,
        ))

    # Penyimpangan rute
    if req.deviation_km and req.deviation_km > ROUTE_DEVIATION_WARNING_KM:
        severity = "high" if req.deviation_km > ROUTE_DEVIATION_CRITICAL_KM else "medium"
        anomalies.append(AnomalyResult(
            vehicle_id=req.vehicle_id,
            anomaly_type=AnomalyType.ROUTE_DEVIATION,
            severity=severity,
            description=f"Kendaraan menyimpang {req.deviation_km:.1f} km dari rute",
            confidence=ROUTE_CONFIDENCE,
        ))

    # Keterlambatan
    if req.eta_overdue_minutes and req.eta_overdue_minutes > DELIVERY_DELAY_WARNING_MINUTES:
        severity = "high" if req.eta_overdue_minutes > DELIVERY_DELAY_CRITICAL_MINUTES else "medium"
        anomalies.append(AnomalyResult(
            vehicle_id=req.vehicle_id,
            anomaly_type=AnomalyType.LATE_DELIVERY,
            severity=severity,
            description=f"Terlambat {req.eta_overdue_minutes} menit dari estimasi",
            confidence=DELIVERY_CONFIDENCE,
        ))

    # Kecepatan berlebihan
    if req.speed_kmh and req.speed_kmh > SPEED_WARNING_KMH:
        severity = "high" if req.speed_kmh > SPEED_CRITICAL_KMH else "medium"
        anomalies.append(AnomalyResult(
            vehicle_id=req.vehicle_id,
            anomaly_type=AnomalyType.SPEED_ANOMALY,
            severity=severity,
            description=f"Kendaraan melaju dengan kecepatan {req.speed_kmh:.1f} km/h",
            confidence=SPEED_CONFIDENCE,
        ))

    return AnomalyResponse(anomalies=anomalies)
