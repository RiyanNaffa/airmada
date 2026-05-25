from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional


router = APIRouter()


class EtaRequest(BaseModel):
    distance_km: float
    stops_remaining: int
    traffic_factor: Optional[float] = 1.0   # 1.0 = normal, >1 = lambat


class EtaResponse(BaseModel):
    estimated_minutes: int
    confidence: float


@router.post("/", response_model=EtaResponse)
def predict_eta(req: EtaRequest) -> EtaResponse:
    avg_speed_kmh = 35 * (1 / req.traffic_factor)
    drive_min = (req.distance_km / avg_speed_kmh) * 60
    stop_min  = req.stops_remaining * 5
    total_min = int(drive_min + stop_min)

    return EtaResponse(
        estimated_minutes=total_min,
        confidence=0.80,
    )
