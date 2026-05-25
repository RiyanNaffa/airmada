from pydantic import BaseModel
from typing import List


class Coordinate(BaseModel):
    lat: float
    lng: float
    shipment_id: str


class OptimizeRequest(BaseModel):
    origin: Coordinate
    destinations: List[Coordinate]


class OptimizeResponse(BaseModel):
    ordered_waypoints: List[Coordinate]
    estimated_distance_km: float
    estimated_duration_min: int
