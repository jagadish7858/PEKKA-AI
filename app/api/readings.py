from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.sensor import (
    SensorReading,
    IngestionResponse,
    SensorReadingListResponse,
    LatestReadingsResponse,
)
from app.schemas.errors import ErrorResponse
from app.storage.memory_store import get_store

router = APIRouter(prefix="/api/v1", tags=["Sensor Readings"])


@router.post(
    "/readings",
    response_model=IngestionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest Sensor Telemetry",
    description="Accepts and validates single sensor reading from external Java Simulator or IoT gateway.",
    responses={
        422: {"model": ErrorResponse, "description": "Validation failure on sensor payload"},
        400: {"model": ErrorResponse, "description": "Malformed payload"},
    },
)
async def ingest_reading(reading: SensorReading) -> IngestionResponse:
    store = get_store()
    store.add_reading(reading)
    return IngestionResponse(success=True, message="Sensor reading received")


@router.get(
    "/readings/latest",
    response_model=LatestReadingsResponse,
    summary="Get Latest Sensor Readings",
    description="Retrieves the most recent reading recorded for every known sensor across all equipment.",
)
async def get_latest_readings() -> LatestReadingsResponse:
    store = get_store()
    readings = store.get_latest_readings()
    return LatestReadingsResponse(success=True, count=len(readings), readings=readings)


@router.get(
    "/equipment/{equipmentId}/readings",
    response_model=SensorReadingListResponse,
    summary="Get Equipment Telemetry History",
    description="Retrieves chronological sensor telemetry stream for a specific piece of equipment.",
    responses={
        404: {"model": ErrorResponse, "description": "Equipment not found"},
    },
)
async def get_equipment_readings(
    equipmentId: str,
    limit: Optional[int] = Query(default=100, ge=1, le=1000, description="Max readings to return"),
) -> SensorReadingListResponse:
    store = get_store()
    if not store.has_equipment(equipmentId):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "EQUIPMENT_NOT_FOUND",
                "message": f"No telemetry records found for equipment '{equipmentId}'",
            },
        )
    readings = store.get_equipment_readings(equipmentId, limit=limit)
    return SensorReadingListResponse(success=True, count=len(readings), readings=readings)


@router.get(
    "/sensors/{sensorId}/history",
    response_model=SensorReadingListResponse,
    summary="Get Single Sensor History",
    description="Retrieves recent historical observations for an individual sensor identifier.",
    responses={
        404: {"model": ErrorResponse, "description": "Sensor not found"},
    },
)
async def get_sensor_history(
    sensorId: str,
    limit: Optional[int] = Query(default=100, ge=1, le=1000, description="Max history points to return"),
) -> SensorReadingListResponse:
    store = get_store()
    if not store.has_sensor(sensorId):
        if store.has_equipment(sensorId):
            msg = (
                f"'{sensorId}' is an equipment identifier. Telemetry history for equipment "
                f"should be retrieved via /api/v1/equipment/{sensorId}/readings. "
                "To query sensor history, provide a specific sensor identifier (e.g., TEMP-T01)."
            )
        else:
            msg = f"No telemetry records found for sensor '{sensorId}'"

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "SENSOR_NOT_FOUND",
                "message": msg,
            },
        )
    readings = store.get_sensor_history(sensorId, limit=limit)
    return SensorReadingListResponse(success=True, count=len(readings), readings=readings)
