import logging
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.api.health import router as health_router
from app.api.readings import router as readings_router
from app.api.anomalies import router as anomalies_router
from app.api.predictions import router as predictions_router
from app.api.recommendations import router as recommendations_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("critical-infrastructure-ai")

app = FastAPI(
    title="Critical Infrastructure AI Backend",
    description=(
        "Autonomous AI system for continuous monitoring of power grid and transformer telemetry. "
        "Provides data ingestion from virtual sensor simulator, validation, feature extraction, "
        "baseline anomaly detection, failure risk scoring, and preventive operator recommendations."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Standardized Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Formats Pydantic payload validation errors into standardized error contract."""
    raw_errors = exc.errors()
    first_error = raw_errors[0] if raw_errors else {}
    error_msg = first_error.get("msg", "Validation error")
    loc = " -> ".join(str(l) for l in first_error.get("loc", []))
    formatted_msg = f"{loc}: {error_msg}" if loc else error_msg

    # Check for invalid sensor type or status to give explicit machine error code
    err_type = first_error.get("type", "")
    error_code = "VALIDATION_ERROR"
    if "enum" in err_type:
        if "sensorType" in loc:
            error_code = "INVALID_SENSOR_TYPE"
        elif "status" in loc:
            error_code = "INVALID_SENSOR_STATUS"

    # Sanitize details to avoid non-serializable objects (e.g. ValueError in ctx)
    sanitized_details = []
    for err in raw_errors:
        sanitized_details.append({
            "type": err.get("type"),
            "loc": [str(x) for x in err.get("loc", [])],
            "msg": err.get("msg"),
        })

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={
            "success": False,
            "error": error_code,
            "message": formatted_msg,
            "details": sanitized_details,
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Formats explicit HTTP exceptions consistently."""
    if isinstance(exc.detail, dict) and "error" in exc.detail:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": exc.detail.get("error", "HTTP_ERROR"),
                "message": exc.detail.get("message", "Request failed"),
            },
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": f"HTTP_{exc.status_code}",
            "message": str(exc.detail),
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Global catch-all exception handler preventing uncaught stack traces to clients."""
    logger.exception("Unhandled server error processing %s: %s", request.url.path, str(exc))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred while processing the request.",
        },
    )


# Mount API Routers
app.include_router(health_router)
app.include_router(readings_router)
app.include_router(anomalies_router)
app.include_router(predictions_router)
app.include_router(recommendations_router)


@app.get("/", include_in_schema=False)
async def root():
    return {
        "service": "critical-infrastructure-ai",
        "status": "UP",
        "documentation": "/docs",
    }
