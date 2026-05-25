import numpy as np
from math import radians, sin, cos, sqrt, atan2
from typing import List
from ..schemas.route import Coordinate, OptimizeResponse


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Jarak dalam km antara dua titik koordinat."""
    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


def optimize_route(origin: Coordinate, destinations: List[Coordinate]) -> OptimizeResponse:
    """
    Nearest-neighbor greedy TSP heuristic.
    Untuk dataset kecil (<= 20 titik) ini sudah cukup akurat.
    Untuk dataset lebih besar, bisa diupgrade ke OR-Tools.
    """
    points = list(destinations)
    current = origin
    ordered: List[Coordinate] = []
    total_dist = 0.0

    while points:
        distances = [
            haversine(current.lat, current.lng, p.lat, p.lng)
            for p in points
        ]
        nearest_idx = int(np.argmin(distances))
        nearest = points.pop(nearest_idx)
        total_dist += distances[nearest_idx]
        ordered.append(nearest)
        current = nearest

    # Estimasi durasi: kecepatan rata-rata 35 km/h + 5 menit per stop
    duration_min = int((total_dist / 35) * 60 + len(ordered) * 5)

    return OptimizeResponse(
        ordered_waypoints=ordered,
        estimated_distance_km=round(total_dist, 2),
        estimated_duration_min=duration_min,
    )
