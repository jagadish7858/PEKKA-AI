import os
import sys
import time
import pytest
import requests
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.config import settings
from app.storage.repository import repository
from app.integration.simulator_client import simulator_client
from app.ml.anomaly_detector import anomaly_detector
from app.ml.failure_predictor import failure_predictor
from sklearn.ensemble import IsolationForest, RandomForestClassifier

client = TestClient(app)

EQUIPMENT_ID = "TRANSFORMER-01"

@pytest.fixture(scope="module", autouse=True)
def setup_environment():
    """Ensure clean state before testing."""
    if simulator_client.is_simulator_healthy():
        simulator_client.reset_simulator()
    yield
    if simulator_client.is_simulator_healthy():
        simulator_client.reset_simulator()

# ==============================================================================
# 1. SIMULATOR REACHABILITY & SENSOR METADATA
# ==============================================================================

def test_01_java_simulator_reachable():
    """[PASS] Java Simulator reachable on port 8081"""
    healthy = simulator_client.is_simulator_healthy()
    assert healthy, f"Java Sensor Simulator not reachable at {settings.SENSOR_SIMULATOR_URL}"
    print(f"\n[PASS] Java Sensor Simulator is UP and reachable at {settings.SENSOR_SIMULATOR_URL}")

def test_02_sensor_metadata_retrieval():
    """[PASS] Sensor metadata and configurations retrieved from simulator"""
    sensors = simulator_client.fetch_all_sensors()
    assert len(sensors) >= 9, f"Expected at least 9 sensors, got {len(sensors)}"
    
    t01_sensors = [s for s in sensors if s["equipmentId"] == EQUIPMENT_ID]
    assert len(t01_sensors) == 9, f"Expected 9 sensors for {EQUIPMENT_ID}, got {len(t01_sensors)}"
    
    sensor_ids = [s["sensorId"] for s in t01_sensors]
    assert "TEMP-T01" in sensor_ids
    assert "VOLT-T01" in sensor_ids
    assert "CURR-T01" in sensor_ids
    assert "VIBR-T01" in sensor_ids
    print(f"[PASS] Retrieved {len(sensors)} sensor definitions. {EQUIPMENT_ID} has all 9 required sensors.")

# ==============================================================================
# 2. TELEMETRY RETRIEVAL, VALIDATION & INGESTION
# ==============================================================================

def test_03_telemetry_retrieval_and_validation():
    """[PASS] Telemetry JSON parsed and validated into Pydantic models"""
    readings = simulator_client.fetch_latest_readings(EQUIPMENT_ID)
    assert len(readings) == 9
    
    for r in readings:
        assert r.equipmentId == EQUIPMENT_ID
        assert r.sensorId.startswith(("TEMP", "VOLT", "CURR", "VIBR", "LOAD", "PWRF", "FREQ", "OIL"))
        assert r.unit is not None
        assert r.status in ("NORMAL", "WARNING", "CRITICAL")
    print(f"[PASS] Successfully retrieved and validated {len(readings)} live sensor telemetry readings.")

def test_04_fastapi_readings_ingestion():
    """[PASS] Telemetry submitted to PEKKA AI backend and stored (HTTP 201)"""
    readings = simulator_client.fetch_latest_readings()
    payload = [r.model_dump() for r in readings]
    
    res = client.post("/api/v1/readings", json=payload)
    assert res.status_code == 201, f"Expected 201 Created, got {res.status_code}: {res.text}"
    data = res.json()
    assert data["storedCount"] == len(payload)
    print(f"[PASS] Ingested {data['storedCount']} readings via POST /api/v1/readings -> HTTP 201 Created.")

def test_05_storage_and_history_availability():
    """[PASS] Stored readings accessible via latest and equipment endpoints"""
    # Test all latest
    res_latest = client.get("/api/v1/readings/latest")
    assert res_latest.status_code == 200
    latest = res_latest.json()
    assert len(latest) >= 9

    # Test equipment readings
    res_eq = client.get(f"/api/v1/equipment/{EQUIPMENT_ID}/readings")
    assert res_eq.status_code == 200
    eq_readings = res_eq.json()
    assert len(eq_readings) == 9
    print(f"[PASS] Stored readings verified across all query endpoints.")

# ==============================================================================
# 3. REAL ML MODELS VERIFICATION
# ==============================================================================

def test_06_real_ml_models_loaded_and_executing():
    """[PASS] Real trained ML models (IsolationForest & RandomForest) loaded and executing live inference"""
    assert isinstance(anomaly_detector.model, IsolationForest), "Isolation Forest model missing or invalid"
    assert isinstance(failure_predictor.model, RandomForestClassifier), "Random Forest model missing or invalid"
    assert anomaly_detector.scaler is not None, "Scaler not loaded"
    assert failure_predictor.scaler is not None, "Scaler not loaded"
    
    # Verify non-trivial number of estimators
    assert anomaly_detector.model.n_estimators >= 100
    assert failure_predictor.model.n_estimators >= 100
    print("[PASS] Verified Real ML: IsolationForest and RandomForestClassifier loaded with trained estimators.")

# ==============================================================================
# 4. NORMAL OPERATION PIPELINE TEST
# ==============================================================================

def test_07_normal_operation_pipeline():
    """[PASS] End-to-end pipeline in NORMAL mode: Low risk, healthy predictions, routine recommendations"""
    simulator_client.set_simulator_mode("NORMAL")
    time.sleep(2)
    
    # Ingest several normal ticks to build history
    for _ in range(5):
        readings = simulator_client.fetch_latest_readings()
        client.post("/api/v1/readings", json=[r.model_dump() for r in readings])
        time.sleep(1)

    # 1. Anomaly Detection
    res_anom = client.get(f"/api/v1/anomalies/{EQUIPMENT_ID}")
    assert res_anom.status_code == 200
    anom_data = res_anom.json()
    assert anom_data["severity"] == "NORMAL"
    assert not anom_data["anomalyDetected"]
    assert anom_data["mlAnomalyScore"] < 0.50

    # 2. Failure Prediction
    res_pred = client.get(f"/api/v1/predictions/{EQUIPMENT_ID}")
    assert res_pred.status_code == 200
    pred_data = res_pred.json()
    assert pred_data["predictedState"] == "NORMAL"
    assert pred_data["failureProbability"] < 0.25

    # 3. Risk Assessment
    res_risk = client.get(f"/api/v1/risk/{EQUIPMENT_ID}")
    assert res_risk.status_code == 200
    risk_data = res_risk.json()
    assert risk_data["riskLevel"] == "LOW"
    assert risk_data["riskScore"] < 35.0

    # 4. Recommendations
    res_rec = client.get(f"/api/v1/recommendations/{EQUIPMENT_ID}")
    assert res_rec.status_code == 200
    rec_data = res_rec.json()
    assert len(rec_data["recommendations"]) > 0
    assert rec_data["riskLevel"] == "LOW"
    print(f"[PASS] NORMAL mode pipeline verified: Risk={risk_data['riskScore']} (LOW), FailureProb={pred_data['failureProbability']:.2f}, AnomalyScore={anom_data['mlAnomalyScore']:.2f}")

# ==============================================================================
# 5. WARNING / DEGRADATION OPERATION PIPELINE TEST
# ==============================================================================

def test_08_warning_operation_pipeline():
    """[PASS] End-to-end pipeline in WARNING mode: Elevated risk, degradation warning detected"""
    simulator_client.set_simulator_mode("WARNING")
    time.sleep(3)
    
    for _ in range(5):
        readings = simulator_client.fetch_latest_readings()
        client.post("/api/v1/readings", json=[r.model_dump() for r in readings])
        time.sleep(1)

    # 1. Anomaly Detection
    res_anom = client.get(f"/api/v1/anomalies/{EQUIPMENT_ID}")
    assert res_anom.status_code == 200
    anom_data = res_anom.json()
    assert anom_data["anomalyDetected"] is True
    assert anom_data["severity"] in ("WARNING", "CRITICAL")

    # 2. Risk Assessment
    res_risk = client.get(f"/api/v1/risk/{EQUIPMENT_ID}")
    assert res_risk.status_code == 200
    risk_data = res_risk.json()
    assert risk_data["riskLevel"] in ("MEDIUM", "HIGH")
    assert risk_data["riskScore"] > 30.0

    # 3. Recommendations
    res_rec = client.get(f"/api/v1/recommendations/{EQUIPMENT_ID}")
    assert res_rec.status_code == 200
    rec_data = res_rec.json()
    assert any("Load" in r["title"] or "DGA" in r["title"] or "Monitoring" in r["title"] for r in rec_data["recommendations"])
    print(f"[PASS] WARNING mode pipeline verified: Risk={risk_data['riskScore']} ({risk_data['riskLevel']}), AnomalyDetected={anom_data['anomalyDetected']}")

# ==============================================================================
# 6. CRITICAL OPERATION PIPELINE TEST
# ==============================================================================

def test_09_critical_operation_pipeline():
    """[PASS] End-to-end pipeline in CRITICAL mode: Severe anomaly, high failure probability, emergency actions"""
    simulator_client.set_simulator_mode("CRITICAL")
    time.sleep(4)
    
    for _ in range(5):
        readings = simulator_client.fetch_latest_readings()
        client.post("/api/v1/readings", json=[r.model_dump() for r in readings])
        time.sleep(1)

    # 1. Anomaly Detection
    res_anom = client.get(f"/api/v1/anomalies/{EQUIPMENT_ID}")
    assert res_anom.status_code == 200
    anom_data = res_anom.json()
    assert anom_data["anomalyDetected"] is True
    assert anom_data["severity"] == "CRITICAL"
    assert anom_data["mlAnomalyScore"] > 0.60
    assert len(anom_data["affectedSensors"]) > 0

    # 2. Failure Prediction
    res_pred = client.get(f"/api/v1/predictions/{EQUIPMENT_ID}")
    assert res_pred.status_code == 200
    pred_data = res_pred.json()
    assert pred_data["failureProbability"] > 0.60
    assert pred_data["estimatedTimeToFailureHours"] is not None

    # 3. Risk Assessment
    res_risk = client.get(f"/api/v1/risk/{EQUIPMENT_ID}")
    assert res_risk.status_code == 200
    risk_data = res_risk.json()
    assert risk_data["riskLevel"] == "CRITICAL"
    assert risk_data["riskScore"] >= 80.0

    # 4. Operator Recommendations
    res_rec = client.get(f"/api/v1/recommendations/{EQUIPMENT_ID}")
    assert res_rec.status_code == 200
    rec_data = res_rec.json()
    assert rec_data["riskLevel"] == "CRITICAL"
    assert any(r["priority"] == "CRITICAL" for r in rec_data["recommendations"])
    print(f"[PASS] CRITICAL mode pipeline verified: Risk={risk_data['riskScore']} (CRITICAL), FailureProb={pred_data['failureProbability']:.2f}, RUL={pred_data['estimatedTimeToFailureHours']}h")

# ==============================================================================
# 7. SENSOR HISTORY BUG & VALIDATION FIXES (STEPS 11 & 12)
# ==============================================================================

def test_10_sensor_history_vs_equipment_history():
    """[PASS] Step 11 Fix: /sensors/{sensorId}/history works for actual sensorId, and 404s cleanly with explanation for equipmentId"""
    # 1. Valid sensor ID -> 200 OK
    res_sensor = client.get("/api/v1/sensors/TEMP-T01/history")
    assert res_sensor.status_code == 200, f"Expected 200 OK for valid sensorId, got {res_sensor.status_code}"
    history = res_sensor.json()
    assert isinstance(history, list)
    assert len(history) > 0

    # 2. Passing equipment ID to sensor history -> 404 with helpful error message
    res_wrong = client.get("/api/v1/sensors/TRANSFORMER-01/history")
    assert res_wrong.status_code == 404
    assert "Equipment ID" in res_wrong.json()["detail"]

    # 3. Correct equipment readings endpoint -> 200 OK
    res_eq = client.get("/api/v1/equipment/TRANSFORMER-01/readings")
    assert res_eq.status_code == 200
    print("[PASS] Step 11 Verified: Sensor history works with actual sensorId (TEMP-T01); Equipment ID returns clear 404.")

def test_11_anomaly_detection_post_endpoint_validation():
    """[PASS] Step 12 Fix: POST /api/v1/anomalies/detect works with valid payload, validates invalid payload"""
    # 1. Valid request
    res_valid = client.post("/api/v1/anomalies/detect", json={"equipmentId": EQUIPMENT_ID})
    assert res_valid.status_code == 200, f"Expected 200 OK, got {res_valid.status_code}: {res_valid.text}"
    assert "mlAnomalyScore" in res_valid.json()

    # 2. Invalid request (missing required equipmentId) -> 422 Unprocessable Entity
    res_invalid = client.post("/api/v1/anomalies/detect", json={})
    assert res_invalid.status_code == 422
    print("[PASS] Step 12 Verified: POST /api/v1/anomalies/detect succeeds on valid request, rejects invalid with 422.")
