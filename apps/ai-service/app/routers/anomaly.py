from fastapi import APIRouter
from ..schemas.anomaly import AnomalyRequest, AnomalyResponse
from ..models.anomaly_detector import detect_anomalies

router = APIRouter()


@router.post("/", response_model=AnomalyResponse)
def detect(req: AnomalyRequest) -> AnomalyResponse:
    return detect_anomalies(req)
