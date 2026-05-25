from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class AnomalyType(str, Enum):
    ROUTE_DEVIATION = "route_deviation"
    GPS_SILENT      = "gps_silent"
    LATE_DELIVERY   = "late_delivery"
    SPEED_ANOMALY   = "speed_anomaly"


class AnomalyRequest(BaseModel):
    vehicle_id: str
    last_gps_minutes_ago: int
    deviation_km: Optional[float] = None
    eta_overdue_minutes: Optional[int] = None
    speed_kmh: Optional[float] = None


class AnomalyResult(BaseModel):
    vehicle_id: str
    anomaly_type: AnomalyType
    severity: str    # "low" | "medium" | "high"
    description: str
    confidence: float


class AnomalyResponse(BaseModel):
    anomalies: List[AnomalyResult]
