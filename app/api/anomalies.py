from typing import List, Optional, Union
from fastapi import APIRouter, HTTPException, Query, Body, status
from app.schemas.anomaly import AnomalyReport, AnomalySeverity, AnomalyDetectBatchRequest
from app.schemas.sensor import SensorReading
from app.schemas.errors import ErrorResponse
from app.storage.memory_store import get_store
from app.detection.anomaly_detector import anomaly_detector

router = APIRouter(prefix="/api/v1", tags=["Anomaly Detection"])


@router.get(
    "/anomalies/{equipmentId}",
    response_model=AnomalyReport,
    summary="Detect Anomalies for Equipment",
    description="Evaluates recent telemetry for an equipment and reports active threshold/status anomalies.",
    responses={
        404: {"model": ErrorResponse, "description": "Equipment not found"},
    },
)
async def get_equipment_anomalies(
    equipmentId: str,
    limit: Optional[int] = Query(default=50, ge=1, le=500, description="Readings window to evaluate"),
) -> AnomalyReport:
    store = get_store()
    if not store.has_equipment(equipmentId):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "EQUIPMENT_NOT_FOUND",
                "message": f"Cannot evaluate anomalies: equipment '{equipmentId}' has no registered telemetry.",
            },
        )
    readings = store.get_equipment_readings(equipmentId, limit=limit)
    return anomaly_detector.detect(equipment_id=equipmentId, readings=readings)


@router.post(
    "/anomalies/detect",
    response_model=AnomalyReport,
    summary="Ad-hoc Anomaly Evaluation",
    description=(
        "Stateless evaluation of provided sensor readings. Accepts a batch object with a 'readings' array, "
        "a raw JSON array of readings, or a single reading object."
    ),
    responses={
        422: {"model": ErrorResponse, "description": "Validation error on telemetry data"},
    },
)
async def detect_anomalies_adhoc(
    payload: Union[AnomalyDetectBatchRequest, List[SensorReading], SensorReading] = Body(
        ...,
        description="Sensor readings to evaluate. Supports wrapped batch object, list of readings, or single reading.",
        openapi_examples={
            "wrapped_batch": {
                "summary": "Wrapped Batch Object (Recommended)",
                "value": {
                    "equipmentId": "TRANSFORMER-01",
                    "readings": [
                        {
                            "sensorId": "TEMP-T01",
                            "equipmentId": "TRANSFORMER-01",
                            "sensorType": "TEMPERATURE",
                            "value": 92.5,
                            "unit": "°C",
                            "timestamp": "2026-09-23T10:30:00Z",
                            "status": "WARNING",
                        }
                    ],
                },
            },
            "array_of_readings": {
                "summary": "Direct Array of Readings",
                "value": [
                    {
                        "sensorId": "TEMP-T01",
                        "equipmentId": "TRANSFORMER-01",
                        "sensorType": "TEMPERATURE",
                        "value": 92.5,
                        "unit": "°C",
                        "timestamp": "2026-09-23T10:30:00Z",
                        "status": "WARNING",
                    }
                ],
            },
            "single_reading": {
                "summary": "Single Sensor Reading",
                "value": {
                    "sensorId": "TEMP-T01",
                    "equipmentId": "TRANSFORMER-01",
                    "sensorType": "TEMPERATURE",
                    "value": 72.4,
                    "unit": "°C",
                    "timestamp": "2026-09-23T10:30:00Z",
                    "status": "NORMAL",
                },
            },
        },
    ),
) -> AnomalyReport:
    if isinstance(payload, AnomalyDetectBatchRequest):
        readings = payload.readings
        equipment_id = payload.equipmentId or (readings[0].equipmentId if readings else "UNKNOWN")
    elif isinstance(payload, list):
        readings = payload
        equipment_id = readings[0].equipmentId if readings else "UNKNOWN"
    else:  # SensorReading
        readings = [payload]
        equipment_id = payload.equipmentId

    if not readings:
        return AnomalyReport(
            equipmentId=equipment_id,
            anomalyDetected=False,
            severity=AnomalySeverity.NORMAL,
            affectedSensors=[],
            details=[],
            method="baseline_threshold_v1",
        )

    return anomaly_detector.detect(equipment_id=equipment_id, readings=readings)
