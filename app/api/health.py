from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/v1", tags=["Health"])


class HealthResponse(BaseModel):
    status: str = Field(default="UP", description="Application operational status")
    service: str = Field(default="critical-infrastructure-ai", description="Service identifier")


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Returns service availability and status for infrastructure health probes.",
)
async def get_health() -> HealthResponse:
    return HealthResponse(status="UP", service="critical-infrastructure-ai")
