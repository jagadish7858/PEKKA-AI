from datetime import datetime, timezone, timedelta
from app.schemas.sensor import SensorReading, SensorType, SensorStatus
from app.processing.feature_engineering import feature_engineer, ML_FEATURE_NAMES
from app.detection.ml_anomaly_detector import ml_anomaly_detector
from app.prediction.ml_failure_predictor import ml_failure_predictor
from app.detection.anomaly_detector import anomaly_detector
from app.prediction.failure_predictor import failure_predictor
from app.schemas.prediction import RiskLevel


def _create_stream(equipment_id: str, temp_val: float, curr_val: float, vib_val: float, count: int = 5):
    base_time = datetime(2026, 9, 23, 10, 0, 0, tzinfo=timezone.utc)
    readings = []
    for i in range(count):
        t = base_time + timedelta(seconds=i * 10)
        readings.extend([
            SensorReading(
                sensorId=f"TEMP-{equipment_id}",
                equipmentId=equipment_id,
                sensorType=SensorType.TEMPERATURE,
                value=temp_val + (i * 0.1),
                unit="°C",
                timestamp=t,
                status=SensorStatus.NORMAL if temp_val < 85 else SensorStatus.WARNING,
            ),
            SensorReading(
                sensorId=f"CURR-{equipment_id}",
                equipmentId=equipment_id,
                sensorType=SensorType.CURRENT,
                value=curr_val,
                unit="A",
                timestamp=t + timedelta(seconds=1),
                status=SensorStatus.NORMAL if curr_val < 75 else SensorStatus.WARNING,
            ),
            SensorReading(
                sensorId=f"VIB-{equipment_id}",
                equipmentId=equipment_id,
                sensorType=SensorType.VIBRATION,
                value=vib_val,
                unit="mm/s",
                timestamp=t + timedelta(seconds=2),
                status=SensorStatus.NORMAL if vib_val < 4.5 else SensorStatus.WARNING,
            ),
        ])
    return readings


def test_ml_feature_vector_insufficient_history():
    single_reading = [
        SensorReading(
            sensorId="TEMP-01",
            equipmentId="T-01",
            sensorType=SensorType.TEMPERATURE,
            value=60.0,
            unit="°C",
            timestamp=datetime.now(timezone.utc),
            status=SensorStatus.NORMAL,
        )
    ]
    vec, feat_dict, msg = feature_engineer.build_ml_feature_vector(single_reading, min_required_samples=3)
    assert vec is None
    assert "Insufficient history" in msg


def test_ml_feature_vector_success():
    readings = _create_stream("TRANS-TEST-01", temp_val=58.0, curr_val=48.0, vib_val=1.2, count=3)
    vec, feat_dict, msg = feature_engineer.build_ml_feature_vector(readings, min_required_samples=3)
    assert vec is not None
    assert vec.shape == (1, 15)
    assert msg is None
    for fname in ML_FEATURE_NAMES:
        assert fname in feat_dict


def test_ml_anomaly_detector_insufficient_history():
    single_reading = [
        SensorReading(
            sensorId="TEMP-01",
            equipmentId="T-01",
            sensorType=SensorType.TEMPERATURE,
            value=60.0,
            unit="°C",
            timestamp=datetime.now(timezone.utc),
            status=SensorStatus.NORMAL,
        )
    ]
    res = ml_anomaly_detector.detect("T-01", single_reading)
    assert res["status"] == "INSUFFICIENT_HISTORY"
    assert res["anomalyDetected"] is False


def test_ml_anomaly_detector_normal_and_anomalous():
    # Normal stream
    normal_stream = _create_stream("TRANS-NORM", temp_val=52.0, curr_val=45.0, vib_val=1.1, count=5)
    norm_res = ml_anomaly_detector.detect("TRANS-NORM", normal_stream)
    assert norm_res["anomalyDetected"] is False
    assert norm_res["anomalyScore"] < 0.35

    # Anomalous stream (High temp + high vibration + high current)
    anom_stream = _create_stream("TRANS-ANOM", temp_val=102.0, curr_val=88.0, vib_val=8.6, count=5)
    anom_res = ml_anomaly_detector.detect("TRANS-ANOM", anom_stream)
    assert anom_res["anomalyDetected"] is True
    assert anom_res["anomalyScore"] >= 0.45
    assert anom_res["severity"] in ("WARNING", "HIGH", "CRITICAL")
    assert len(anom_res["explanation"]) > 0


def test_ml_failure_predictor_insufficient_history():
    single_reading = [
        SensorReading(
            sensorId="TEMP-01",
            equipmentId="T-01",
            sensorType=SensorType.TEMPERATURE,
            value=60.0,
            unit="°C",
            timestamp=datetime.now(timezone.utc),
            status=SensorStatus.NORMAL,
        )
    ]
    pred = ml_failure_predictor.predict("T-01", single_reading)
    assert pred.predictedFailureMode == "INSUFFICIENT_HISTORY"
    assert pred.failure_probability == 0.0


def test_ml_failure_predictor_normal_vs_critical():
    # Normal
    normal_stream = _create_stream("TRANS-NORM-2", temp_val=50.0, curr_val=40.0, vib_val=1.0, count=5)
    pred_norm = ml_failure_predictor.predict("TRANS-NORM-2", normal_stream)
    assert pred_norm.failure_probability < 0.30
    assert pred_norm.riskLevel == RiskLevel.LOW
    assert pred_norm.ml_model == "RandomForestClassifier"

    # Critical thermal & vibration failure stream
    crit_stream = _create_stream("TRANS-CRIT-2", temp_val=110.0, curr_val=95.0, vib_val=9.5, count=5)
    pred_crit = ml_failure_predictor.predict("TRANS-CRIT-2", crit_stream)
    assert pred_crit.failure_probability > 0.60
    assert pred_crit.riskLevel in (RiskLevel.HIGH, RiskLevel.CRITICAL)
    assert pred_crit.predictedFailureMode != "NORMAL"
    assert len(pred_crit.supporting_features) > 0


def test_hybrid_pipeline_integration(client):
    """Verifies that API endpoints expose real ML attributes and explanations."""
    eq_id = "TRANSFORMER-01"
    readings = _create_stream(eq_id, temp_val=98.0, curr_val=84.0, vib_val=7.8, count=4)

    for r in readings:
        payload = {
            "sensorId": r.sensorId,
            "equipmentId": r.equipmentId,
            "sensorType": r.sensorType.value,
            "value": r.value,
            "unit": r.unit,
            "timestamp": r.timestamp.isoformat(),
            "status": r.status.value,
        }
        res = client.post("/api/v1/readings", json=payload)
        assert res.status_code == 201

    # 1. Anomaly endpoint includes ML score & explanation
    anom_res = client.get(f"/api/v1/anomalies/{eq_id}")
    assert anom_res.status_code == 200
    anom_data = anom_res.json()
    assert anom_data["anomalyDetected"] is True
    assert anom_data["anomalyScore"] is not None
    assert anom_data["model"] == "IsolationForest"
    assert "explanation" in anom_data

    # 2. Prediction endpoint includes real failure probability from Random Forest
    pred_res = client.get(f"/api/v1/predictions/{eq_id}")
    assert pred_res.status_code == 200
    pred_data = pred_res.json()
    assert pred_data["ml_model"] == "RandomForestClassifier"
    assert pred_data["failure_probability"] is not None
    assert pred_data["failure_probability"] > 0.50
    assert len(pred_data["supporting_features"]) > 0

    # 3. Risk endpoint includes ML component scores
    risk_res = client.get(f"/api/v1/risk/{eq_id}")
    assert risk_res.status_code == 200
    risk_data = risk_res.json()
    assert risk_data["riskScore"] >= 60.0
    assert "ml_isolation_forest_score" in risk_data["components"]
    assert "ml_failure_probability_score" in risk_data["components"]

    # 4. Recommendations include ML insights
    rec_res = client.get(f"/api/v1/recommendations/{eq_id}")
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert len(rec_data["recommendations"]) >= 2
    assert "ML" in rec_data["operatorNotes"]
