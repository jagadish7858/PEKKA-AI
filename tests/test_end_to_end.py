from datetime import datetime, timezone, timedelta


def test_complete_telemetry_flow(client):
    """
    Validates complete end-to-end flow:
    Sensor JSON -> Validation -> Storage -> Feature processing -> Anomaly detection -> Risk assessment -> Recommendation
    """
    equipment_id = "TRANSFORMER-SUBSTATION-4"
    base_time = datetime(2026, 9, 23, 10, 0, 0, tzinfo=timezone.utc)

    # 1. Ingest normal baseline telemetry sequence
    telemetry_stream = [
        # Normal Temperature
        {
            "sensorId": f"TEMP-{equipment_id}",
            "equipmentId": equipment_id,
            "sensorType": "TEMPERATURE",
            "value": 68.0,
            "unit": "°C",
            "timestamp": (base_time + timedelta(seconds=10)).isoformat(),
            "status": "NORMAL",
        },
        # Normal Current
        {
            "sensorId": f"CURR-{equipment_id}",
            "equipmentId": equipment_id,
            "sensorType": "CURRENT",
            "value": 45.0,
            "unit": "A",
            "timestamp": (base_time + timedelta(seconds=11)).isoformat(),
            "status": "NORMAL",
        },
        # Normal Vibration
        {
            "sensorId": f"VIB-{equipment_id}",
            "equipmentId": equipment_id,
            "sensorType": "VIBRATION",
            "value": 1.4,
            "unit": "mm/s",
            "timestamp": (base_time + timedelta(seconds=12)).isoformat(),
            "status": "NORMAL",
        },
    ]

    for payload in telemetry_stream:
        res = client.post("/api/v1/readings", json=payload)
        assert res.status_code == 201
        assert res.json()["success"] is True

    # 2. Check latest readings
    latest_res = client.get("/api/v1/readings/latest")
    assert latest_res.status_code == 200
    assert latest_res.json()["count"] == 3

    # 3. Check equipment baseline anomalies (should be normal)
    anomaly_res1 = client.get(f"/api/v1/anomalies/{equipment_id}")
    assert anomaly_res1.status_code == 200
    assert anomaly_res1.json()["anomalyDetected"] is False
    assert anomaly_res1.json()["severity"] == "NORMAL"

    # 4. Stream an escalation event (thermal runaway + overcurrent)
    escalation_readings = [
        {
            "sensorId": f"TEMP-{equipment_id}",
            "equipmentId": equipment_id,
            "sensorType": "TEMPERATURE",
            "value": 96.5,
            "unit": "°C",
            "timestamp": (base_time + timedelta(seconds=30)).isoformat(),
            "status": "WARNING",
        },
        {
            "sensorId": f"CURR-{equipment_id}",
            "equipmentId": equipment_id,
            "sensorType": "CURRENT",
            "value": 82.0,
            "unit": "A",
            "timestamp": (base_time + timedelta(seconds=31)).isoformat(),
            "status": "WARNING",
        },
    ]

    for payload in escalation_readings:
        res = client.post("/api/v1/readings", json=payload)
        assert res.status_code == 201

    # 5. Anomaly detection now detects WARNING / CRITICAL
    anomaly_res2 = client.get(f"/api/v1/anomalies/{equipment_id}")
    assert anomaly_res2.status_code == 200
    anom_data = anomaly_res2.json()
    assert anom_data["anomalyDetected"] is True
    assert anom_data["severity"] in ("WARNING", "CRITICAL")
    assert f"TEMP-{equipment_id}" in anom_data["affectedSensors"]

    # 6. Failure prediction reflects thermal overload risk
    pred_res = client.get(f"/api/v1/predictions/{equipment_id}")
    assert pred_res.status_code == 200
    pred_data = pred_res.json()
    assert pred_data["riskScore"] >= 50.0
    assert pred_data["riskLevel"] in ("MEDIUM", "HIGH", "CRITICAL")
    assert len(pred_data["contributingFactors"]) > 0

    # 7. Risk endpoint calculates compound score
    risk_res = client.get(f"/api/v1/risk/{equipment_id}")
    assert risk_res.status_code == 200
    risk_data = risk_res.json()
    assert risk_data["riskScore"] >= 50.0
    assert risk_data["components"]["anomaly_severity_score"] > 0

    # 8. Preventive recommendations provide concrete human operator advice
    rec_res = client.get(f"/api/v1/recommendations/{equipment_id}")
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert rec_data["equipmentId"] == equipment_id
    assert rec_data["riskLevel"] in ("HIGH", "CRITICAL", "MEDIUM")
    assert len(rec_data["recommendations"]) >= 1
    # Check operator advice is present
    all_recs = " ".join(rec_data["recommendations"]).lower()
    assert ("load" in all_recs or "cooling" in all_recs)
