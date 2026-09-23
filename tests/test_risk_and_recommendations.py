from datetime import datetime, timezone
from app.detection.anomaly_detector import ThresholdAnomalyDetector
from app.risk.risk_engine import RiskEngine
from app.recommendation.recommendation_engine import RecommendationEngine
from app.prediction.failure_predictor import HeuristicFailurePredictor
from app.schemas.sensor import SensorReading, SensorType, SensorStatus
from app.schemas.prediction import RiskLevel


def test_normal_risk_and_recommendation():
    detector = ThresholdAnomalyDetector()
    predictor = HeuristicFailurePredictor()
    risk_engine = RiskEngine()
    recommender = RecommendationEngine()

    reading = SensorReading(
        sensorId="TEMP-01",
        equipmentId="TRANS-01",
        sensorType=SensorType.TEMPERATURE,
        value=62.0,
        unit="°C",
        timestamp=datetime.now(timezone.utc),
        status=SensorStatus.NORMAL,
    )
    readings = [reading]
    report = detector.detect("TRANS-01", readings)
    prediction = predictor.predict("TRANS-01", readings, report)
    risk = risk_engine.calculate_risk("TRANS-01", readings, report, prediction)
    recommendation = recommender.generate_recommendations("TRANS-01", risk["riskLevel"], report, readings)

    assert risk["riskScore"] < 30.0
    assert risk["riskLevel"] == RiskLevel.LOW
    assert recommendation.equipmentId == "TRANS-01"
    assert recommendation.riskLevel == RiskLevel.LOW
    assert len(recommendation.recommendations) > 0


def test_compound_overload_generates_critical_action():
    detector = ThresholdAnomalyDetector()
    predictor = HeuristicFailurePredictor()
    risk_engine = RiskEngine()
    recommender = RecommendationEngine()

    now = datetime.now(timezone.utc)
    # High current + high temperature
    r_curr = SensorReading(
        sensorId="CURR-01",
        equipmentId="TRANS-01",
        sensorType=SensorType.CURRENT,
        value=88.0,
        unit="A",
        timestamp=now,
        status=SensorStatus.WARNING,
    )
    r_temp = SensorReading(
        sensorId="TEMP-01",
        equipmentId="TRANS-01",
        sensorType=SensorType.TEMPERATURE,
        value=102.0,
        unit="°C",
        timestamp=now,
        status=SensorStatus.CRITICAL,
    )
    readings = [r_curr, r_temp]

    report = detector.detect("TRANS-01", readings)
    prediction = predictor.predict("TRANS-01", readings, report)
    risk = risk_engine.calculate_risk("TRANS-01", readings, report, prediction)
    rec = recommender.generate_recommendations("TRANS-01", risk["riskLevel"], report, readings)

    assert risk["riskLevel"] in (RiskLevel.HIGH, RiskLevel.CRITICAL)
    assert rec.urgency == "IMMEDIATE_ACTION"
    # Verify presence of cooling system and load reduction guidance
    rec_text = " ".join(rec.recommendations)
    assert "cooling system" in rec_text.lower()
    assert "load" in rec_text.lower()


def test_recommendation_api_endpoint(client, sample_reading_payload):
    # Ingest high temperature reading
    p = sample_reading_payload.copy()
    p["value"] = 92.0
    client.post("/api/v1/readings", json=p)

    resp = client.get("/api/v1/recommendations/TRANSFORMER-01")
    assert resp.status_code == 200
    data = resp.json()
    assert data["equipmentId"] == "TRANSFORMER-01"
    assert "riskLevel" in data
    assert isinstance(data["recommendations"], list)
    assert len(data["recommendations"]) > 0
