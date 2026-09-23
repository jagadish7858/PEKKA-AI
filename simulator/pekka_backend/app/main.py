from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.api.routes import router as api_v1_router
from app.integration.simulator_client import simulator_client

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("PekkaAI")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing PEKKA AI Backend Services...")
    # Attempt to start continuous background ingestion from Java simulator
    if simulator_client.is_simulator_healthy():
        logger.info(f"Connected to Java Sensor Simulator at {settings.SENSOR_SIMULATOR_URL}")
        simulator_client.start_background_ingestion(poll_interval_sec=1.0)
    else:
        logger.warning(
            f"Java Sensor Simulator at {settings.SENSOR_SIMULATOR_URL} not reachable yet. Ingestion will start on demand."
        )
    yield
    logger.info("Shutting down PEKKA AI Backend Services...")
    simulator_client.stop_background_ingestion()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Autonomous AI for Critical Infrastructure - Telemetry Ingestion, ML Anomaly Detection, Failure Prediction, Risk Assessment, and Operator Recommendations.",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "service": "PEKKA AI Backend",
        "status": "ONLINE",
        "docs": "/docs",
        "api_v1": "/api/v1"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=False)
