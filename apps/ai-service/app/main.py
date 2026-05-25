from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from .routers import optimize, anomaly, eta

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models on startup
    print("aiRMADA AI Service starting...")
    yield
    print("AI Service shutting down.")


app = FastAPI(
    title="aiRMADA AI Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("WEB_APP_URL", "http://localhost:3000")],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


async def verify_api_key(x_api_key: str = Header(alias="X-API-Key")):
    if x_api_key != os.getenv("AI_SERVICE_SECRET"):
        raise HTTPException(status_code=401, detail="Invalid API key")


app.include_router(
    optimize.router,
    prefix="/optimize-route",
    dependencies=[Depends(verify_api_key)],
)
app.include_router(
    anomaly.router,
    prefix="/detect-anomaly",
    dependencies=[Depends(verify_api_key)],
)
app.include_router(
    eta.router,
    prefix="/predict-eta",
    dependencies=[Depends(verify_api_key)],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "airmada-ai"}