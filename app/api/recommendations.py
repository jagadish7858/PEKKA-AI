from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.recommendation import RecommendationResponse
from app.schemas.errors import ErrorResponse
from app.storage.memory_store import get_store
from app.detection.anomaly_detector import anomaly_detector
from app.processing.feature_engineering import feature_engineer
from app.prediction.failure_predictor import failure_predictor
from app.risk.risk_engine import risk_engine
from app.recommendation.recommendation_engine import recommendation_engine

router = APIRouter(prefix="/api/v1", tags=["Recommendations & Risk"])


@router.get(
    "/recommendations/{equipmentId}",
    response_model=RecommendationResponse,
    summary="Get Preventive Recommendations",
    description="Generates actionable preventive maintenance recommendations and advisory guidance for human operators.",
    responses={
        404: {"model": ErrorResponse, "description": "Equipment not found"},
    },
)
async def get_equipment_recommendations(
    equipmentId: str,
    limit: Optional[int] = Query(default=100, ge=1, le=1000, description="Readings window to evaluate"),
) -> RecommendationResponse:
    store = get_store()
    if not store.has_equipment(equipmentId):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "EQUIPMENT_NOT_FOUND",
                "message": f"Cannot generate recommendations: equipment '{equipmentId}' has no registered telemetry.",
            },
        )
    readings = store.get_equipment_readings(equipmentId, limit=limit)
    anomaly_report = anomaly_detector.detect(equipment_id=equipmentId, readings=readings)

    by_sensor: Dict[str, List] = {}
    for r in readings:
        by_sensor.setdefault(r.sensorId, []).append(r)
    features = feature_engineer.compute_equipment_features(by_sensor)

    prediction = failure_predictor.predict(
        equipment_id=equipmentId,
        readings=readings,
        anomaly_report=anomaly_report,
        features=features,
    )

    risk_assessment = risk_engine.calculate_risk(
        equipment_id=equipmentId,
        readings=readings,
        anomaly_report=anomaly_report,
        prediction=prediction,
        features=features,
    )

    return recommendation_engine.generate_recommendations(
        equipment_id=equipmentId,
        risk_level=risk_assessment["riskLevel"],
        anomaly_report=anomaly_report,
        readings=readings,
        prediction=prediction,
    )


@router.get(
    "/risk/{equipmentId}",
    summary="Get Equipment Risk Assessment",
    description="Returns detailed risk evaluation breakdown and composite score (0-100) for equipment.",
    responses={
        404: {"model": ErrorResponse, "description": "Equipment not found"},
    },
)
async def get_equipment_risk(
    equipmentId: str,
    limit: Optional[int] = Query(default=100, ge=1, le=1000, description="Readings window to evaluate"),
):
    store = get_store()
    if not store.has_equipment(equipmentId):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "EQUIPMENT_NOT_FOUND",
                "message": f"Cannot evaluate risk: equipment '{equipmentId}' has no registered telemetry.",
            },
        )
    readings = store.get_equipment_readings(equipmentId, limit=limit)
    anomaly_report = anomaly_detector.detect(equipment_id=equipmentId, readings=readings)

    by_sensor: Dict[str, List] = {}
    for r in readings:
        by_sensor.setdefault(r.sensorId, []).append(r)
    features = feature_engineer.compute_equipment_features(by_sensor)

    prediction = failure_predictor.predict(
        equipment_id=equipmentId,
        readings=readings,
        anomaly_report=anomaly_report,
        features=features,
    )

    return risk_engine.calculate_risk(
        equipment_id=equipmentId,
        readings=readings,
        anomaly_report=anomaly_report,
        prediction=prediction,
        features=features,
    )
