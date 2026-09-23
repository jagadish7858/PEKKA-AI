from typing import List, Dict, Any, Union, Optional
from fastapi import APIRouter, HTTPException, Query, status
from datetime import datetime

from app.models.schemas import (
    SensorReading,
    IngestionResponse,
    AnomalyDetectionRequest,
    AnomalyDetectionResponse,
    FailurePredictionResponse,
    RiskAssessmentResponse,
    RecommendationsResponse
)
from app.storage.repository import repository
from app.ml.anomaly_detector import anomaly_detector
from app.ml.failure_predictor import failure_predictor
from app.ml.risk_engine import risk_engine
from app.ml.recommendation_engine import recommendation_engine

router = APIRouter()

@router.get("/health", tags=["System"])
def get_health() -> Dict[str, Any]:
    return {
        "status": "UP",
        "service": "pekka-ai-backend",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@router.post(
    "/readings",
    response_model=IngestionResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Telemetry Ingestion"]
)
def ingest_readings(payload: Union[SensorReading, List[SensorReading]]):
    """
    Ingests a single sensor reading or a batch of sensor readings.
    """
    if isinstance(payload, list):
        if not payload:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty readings batch")
        repository.save_readings(payload)
        eq_id = payload[0].equipmentId
        count = len(payload)
    else:
        repository.save_reading(payload)
        eq_id = payload.equipmentId
        count = 1

    return IngestionResponse(
        message=f"Successfully ingested {count} telemetry reading(s)",
        storedCount=count,
        equipmentId=eq_id,
        timestamp=datetime.now().isoformat()
    )

@router.get("/readings/latest", tags=["Telemetry Ingestion"])
def get_all_latest_readings() -> List[SensorReading]:
    return repository.get_all_latest_readings()

@router.get("/equipment/{equipmentId}/readings", tags=["Telemetry Ingestion"])
def get_equipment_readings(equipmentId: str) -> List[SensorReading]:
    readings = repository.get_equipment_latest_readings(equipmentId)
    if not readings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No telemetry readings found for equipment: {equipmentId}"
        )
    return readings

@router.get("/sensors/{sensorId}/history", tags=["Telemetry Ingestion"])
def get_sensor_history(sensorId: str, limit: int = Query(default=100, ge=1, le=500)) -> List[SensorReading]:
    """
    Returns time-series history for a specific sensor ID (e.g. TEMP-T01, VOLT-T01).
    Note: For equipment-level telemetry, use /api/v1/equipment/{equipmentId}/readings.
    """
    history = repository.get_sensor_history(sensorId, limit=limit)
    if not history:
        # Check if user passed an equipmentId by mistake
        if sensorId in repository.get_all_equipment_ids():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"'{sensorId}' is an Equipment ID, not a Sensor ID. Use /api/v1/equipment/{sensorId}/readings for equipment telemetry."
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No telemetry history found for sensor ID: {sensorId}"
        )
    return history

@router.post(
    "/anomalies/detect",
    response_model=AnomalyDetectionResponse,
    tags=["AI Analysis"]
)
def detect_anomalies(request: AnomalyDetectionRequest):
    """
    Runs real ML Isolation Forest anomaly detection on provided readings or current stored state.
    """
    equipment_id = request.equipmentId
    if request.readings:
        readings = request.readings
    else:
        readings = repository.get_equipment_latest_readings(equipment_id)
        if not readings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No stored readings for {equipment_id}. Please supply readings in the request body."
            )

    history = repository.get_equipment_history(equipment_id, limit=20)
    result = anomaly_detector.detect(equipment_id, readings, history)
    return AnomalyDetectionResponse(**result)

@router.get(
    "/anomalies/{equipmentId}",
    response_model=AnomalyDetectionResponse,
    tags=["AI Analysis"]
)
def get_equipment_anomalies(equipmentId: str):
    readings = repository.get_equipment_latest_readings(equipmentId)
    if not readings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No telemetry readings found for equipment: {equipmentId}"
        )
    history = repository.get_equipment_history(equipmentId, limit=20)
    result = anomaly_detector.detect(equipmentId, readings, history)
    return AnomalyDetectionResponse(**result)

@router.get(
    "/predictions/{equipmentId}",
    response_model=FailurePredictionResponse,
    tags=["AI Analysis"]
)
def get_equipment_predictions(equipmentId: str):
    readings = repository.get_equipment_latest_readings(equipmentId)
    if not readings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No telemetry readings found for equipment: {equipmentId}"
        )
    history = repository.get_equipment_history(equipmentId, limit=20)
    result = failure_predictor.predict(equipmentId, readings, history)
    return FailurePredictionResponse(**result)

@router.get(
    "/risk/{equipmentId}",
    response_model=RiskAssessmentResponse,
    tags=["AI Analysis"]
)
def get_equipment_risk(equipmentId: str):
    readings = repository.get_equipment_latest_readings(equipmentId)
    if not readings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No telemetry readings found for equipment: {equipmentId}"
        )
    history = repository.get_equipment_history(equipmentId, limit=20)
    result = risk_engine.calculate_risk(equipmentId, readings, history)
    return RiskAssessmentResponse(**result)

@router.get(
    "/recommendations/{equipmentId}",
    response_model=RecommendationsResponse,
    tags=["AI Analysis"]
)
def get_equipment_recommendations(equipmentId: str):
    readings = repository.get_equipment_latest_readings(equipmentId)
    if not readings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No telemetry readings found for equipment: {equipmentId}"
        )
    history = repository.get_equipment_history(equipmentId, limit=20)
    result = recommendation_engine.generate_recommendations(equipmentId, readings, history)
    return RecommendationsResponse(**result)
