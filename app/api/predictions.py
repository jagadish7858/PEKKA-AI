from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.prediction import FailurePrediction
from app.schemas.errors import ErrorResponse
from app.storage.memory_store import get_store
from app.detection.anomaly_detector import anomaly_detector
from app.processing.feature_engineering import feature_engineer
from app.prediction.failure_predictor import failure_predictor

router = APIRouter(prefix="/api/v1", tags=["Failure Prediction"])


@router.get(
    "/predictions/{equipmentId}",
    response_model=FailurePrediction,
    summary="Predict Failure Risk",
    description="Analyzes equipment telemetry and trends to predict failure risk and identify suspected failure modes.",
    responses={
        404: {"model": ErrorResponse, "description": "Equipment not found"},
    },
)
async def get_equipment_failure_prediction(
    equipmentId: str,
    limit: Optional[int] = Query(default=100, ge=1, le=1000, description="Readings window to evaluate"),
) -> FailurePrediction:
    store = get_store()
    if not store.has_equipment(equipmentId):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "EQUIPMENT_NOT_FOUND",
                "message": f"Cannot compute failure prediction: equipment '{equipmentId}' has no registered telemetry.",
            },
        )
    readings = store.get_equipment_readings(equipmentId, limit=limit)
    anomaly_report = anomaly_detector.detect(equipment_id=equipmentId, readings=readings)

    # Group readings by sensorId for feature engineering
    by_sensor: Dict[str, List] = {}
    for r in readings:
        by_sensor.setdefault(r.sensorId, []).append(r)
    features = feature_engineer.compute_equipment_features(by_sensor)

    return failure_predictor.predict(
        equipment_id=equipmentId,
        readings=readings,
        anomaly_report=anomaly_report,
        features=features,
    )
