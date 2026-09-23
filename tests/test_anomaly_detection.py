from datetime import datetime, timezone
from app.detection.anomaly_detector import ThresholdAnomalyDetector
from app.schemas.sensor import SensorReading, SensorType, SensorStatus
from app.schemas.anomaly import AnomalySeverity


def test_baseline_detector_normal():
    detector = ThresholdAnomalyDetector()
    reading = SensorReading(
        sensorId="TEMP-01",
        equipmentId="TRANS-01",
        sensorType=SensorType.TEMPERATURE,
        value=65.0,
        unit="°C",
        timestamp=datetime.now(timezone.utc),
        status=SensorStatus.NORMAL,
    )
    report = detector.detect("TRANS-01", [reading])
    assert report.anomalyDetected is False
    assert report.severity == AnomalySeverity.NORMAL
    assert len(report.affectedSensors) == 0


def test_baseline_detector_temperature_warning_and_critical():
    detector = ThresholdAnomalyDetector()

    # Warning (>85.0)
    r_warn = SensorReading(
        sensorId="TEMP-01",
        equipmentId="TRANS-01",
        sensorType=SensorType.TEMPERATURE,
        value=88.5,
        unit="°C",
        timestamp=datetime.now(timezone.utc),
        status=SensorStatus.NORMAL,
    )
    report_warn = detector.detect("TRANS-01", [r_warn])
    assert report_warn.anomalyDetected is True
    assert report_warn.severity == AnomalySeverity.WARNING
    assert "TEMP-01" in report_warn.affectedSensors

    # Critical (>100.0)
    r_crit = SensorReading(
        sensorId="TEMP-01",
        equipmentId="TRANS-01",
        sensorType=SensorType.TEMPERATURE,
        value=105.0,
        unit="°C",
        timestamp=datetime.now(timezone.utc),
        status=SensorStatus.NORMAL,
    )
    report_crit = detector.detect("TRANS-01", [r_crit])
    assert report_crit.anomalyDetected is True
    assert report_crit.severity == AnomalySeverity.CRITICAL


def test_baseline_detector_multiple_affected_sensors():
    detector = ThresholdAnomalyDetector()
    r_temp = SensorReading(
        sensorId="TEMP-01",
        equipmentId="TRANS-01",
        sensorType=SensorType.TEMPERATURE,
        value=92.0,
        unit="°C",
        timestamp=datetime.now(timezone.utc),
        status=SensorStatus.NORMAL,
    )
    r_vib = SensorReading(
        sensorId="VIB-01",
        equipmentId="TRANS-01",
        sensorType=SensorType.VIBRATION,
        value=8.5,
        unit="mm/s",
        timestamp=datetime.now(timezone.utc),
        status=SensorStatus.NORMAL,
    )

    report = detector.detect("TRANS-01", [r_temp, r_vib])
    assert report.anomalyDetected is True
    assert report.severity == AnomalySeverity.CRITICAL
    assert set(report.affectedSensors) == {"TEMP-01", "VIB-01"}
    assert len(report.details) == 2


def test_anomaly_api_endpoint(client, sample_reading_payload):
    # Ingest abnormal reading
    payload = sample_reading_payload.copy()
    payload["value"] = 104.0
    client.post("/api/v1/readings", json=payload)

    resp = client.get("/api/v1/anomalies/TRANSFORMER-01")
    assert resp.status_code == 200
    data = resp.json()
    assert data["equipmentId"] == "TRANSFORMER-01"
    assert data["anomalyDetected"] is True
    assert data["severity"] == "CRITICAL"
    assert "TEMP-T01" in data["affectedSensors"]


def test_adhoc_anomaly_detect_wrapped_batch(client, sample_reading_payload):
    # Test batch object format { "readings": [...] }
    item = sample_reading_payload.copy()
    item["value"] = 89.0  # Warning
    batch_payload = {
        "equipmentId": "TRANSFORMER-01",
        "readings": [item],
    }
    resp = client.post("/api/v1/anomalies/detect", json=batch_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["equipmentId"] == "TRANSFORMER-01"
    assert data["anomalyDetected"] is True
    assert data["severity"] == "WARNING"


def test_adhoc_anomaly_detect_raw_array(client, sample_reading_payload):
    # Test raw array format [ {...} ]
    item = sample_reading_payload.copy()
    item["value"] = 105.0  # Critical
    resp = client.post("/api/v1/anomalies/detect", json=[item])
    assert resp.status_code == 200
    data = resp.json()
    assert data["anomalyDetected"] is True
    assert data["severity"] == "CRITICAL"


def test_adhoc_anomaly_detect_single_reading(client, sample_reading_payload):
    # Test single reading object {...}
    item = sample_reading_payload.copy()
    item["value"] = 65.0  # Normal
    resp = client.post("/api/v1/anomalies/detect", json=item)
    assert resp.status_code == 200
    data = resp.json()
    assert data["anomalyDetected"] is False
    assert data["severity"] == "NORMAL"


def test_adhoc_anomaly_detect_invalid_payload(client):
    # Malformed payload must trigger strict standardized 422
    invalid_payload = {
        "readings": [
            {
                "sensorId": "TEMP-01",
                "equipmentId": "T-01",
                "sensorType": "NOT_A_VALID_TYPE",
                "value": "non-numeric",
            }
        ]
    }
    resp = client.post("/api/v1/anomalies/detect", json=invalid_payload)
    assert resp.status_code == 422
    data = resp.json()
    assert data["success"] is False
    assert data["error"] in ("INVALID_SENSOR_TYPE", "VALIDATION_ERROR")

