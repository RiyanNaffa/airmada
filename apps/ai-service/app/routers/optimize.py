from fastapi import APIRouter
from ..schemas.route import OptimizeRequest, OptimizeResponse
from ..models.route_optimizer import optimize_route

router = APIRouter()


@router.post("/", response_model=OptimizeResponse)
def optimize(req: OptimizeRequest) -> OptimizeResponse:
    return optimize_route(req.origin, req.destinations)
