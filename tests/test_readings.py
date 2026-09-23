def test_valid_reading_ingestion(client, sample_reading_payload):
    response = client.post("/api/v1/readings", json=sample_reading_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["message"] == "Sensor reading received"


def test_reject_missing_sensor_id(client, sample_reading_payload):
    payload = sample_reading_payload.copy()
    del payload["sensorId"]
    response = client.post("/api/v1/readings", json=payload)
    assert response.status_code == 422
    assert response.json()["success"] is False


def test_reject_empty_equipment_id(client, sample_reading_payload):
    payload = sample_reading_payload.copy()
    payload["equipmentId"] = "   "
    response = client.post("/api/v1/readings", json=payload)
    assert response.status_code == 422
    assert response.json()["success"] is False


def test_reject_invalid_sensor_type(client, sample_reading_payload):
    payload = sample_reading_payload.copy()
    payload["sensorType"] = "INVALID_GAS_TYPE"
    response = client.post("/api/v1/readings", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert data["error"] == "INVALID_SENSOR_TYPE"


def test_reject_invalid_status(client, sample_reading_payload):
    payload = sample_reading_payload.copy()
    payload["status"] = "EXPLODED"
    response = client.post("/api/v1/readings", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert data["error"] == "INVALID_SENSOR_STATUS"


def test_reject_non_numeric_value(client, sample_reading_payload):
    payload = sample_reading_payload.copy()
    payload["value"] = "not-a-number"
    response = client.post("/api/v1/readings", json=payload)
    assert response.status_code == 422
    assert response.json()["success"] is False


def test_reject_invalid_timestamp(client, sample_reading_payload):
    payload = sample_reading_payload.copy()
    payload["timestamp"] = "yesterday-at-noon"
    response = client.post("/api/v1/readings", json=payload)
    assert response.status_code == 422
    assert response.json()["success"] is False


def test_latest_readings_empty(client):
    response = client.get("/api/v1/readings/latest")
    assert response.status_code == 200
    assert response.json()["count"] == 0
    assert response.json()["readings"] == []


def test_latest_readings_multiple_sensors(client, sample_reading_payload):
    # Ingest reading 1
    client.post("/api/v1/readings", json=sample_reading_payload)

    # Ingest reading 2 (different sensor on same equipment)
    payload_vib = sample_reading_payload.copy()
    payload_vib["sensorId"] = "VIB-T01"
    payload_vib["sensorType"] = "VIBRATION"
    payload_vib["value"] = 2.1
    payload_vib["unit"] = "mm/s"
    client.post("/api/v1/readings", json=payload_vib)

    # Ingest updated reading for reading 1
    payload_temp2 = sample_reading_payload.copy()
    payload_temp2["value"] = 74.0
    payload_temp2["timestamp"] = "2026-09-23T10:31:00Z"
    client.post("/api/v1/readings", json=payload_temp2)

    response = client.get("/api/v1/readings/latest")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 2
    readings = {r["sensorId"]: r for r in data["readings"]}
    assert readings["TEMP-T01"]["value"] == 74.0
    assert readings["VIB-T01"]["value"] == 2.1


def test_equipment_readings_history_and_limit(client, sample_reading_payload):
    # Ingest 5 readings
    for i in range(5):
        p = sample_reading_payload.copy()
        p["value"] = 70.0 + i
        p["timestamp"] = f"2026-09-23T10:3{i}:00Z"
        client.post("/api/v1/readings", json=p)

    # Query with limit 3
    response = client.get("/api/v1/equipment/TRANSFORMER-01/readings?limit=3")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 3
    assert len(data["readings"]) == 3
    # Check that latest readings are returned
    assert data["readings"][-1]["value"] == 74.0


def test_equipment_not_found(client):
    response = client.get("/api/v1/equipment/NON_EXISTENT_EQUIPMENT/readings")
    assert response.status_code == 404
    data = response.json()
    assert data["success"] is False
    assert data["error"] == "EQUIPMENT_NOT_FOUND"


def test_sensor_history_and_not_found(client, sample_reading_payload):
    client.post("/api/v1/readings", json=sample_reading_payload)

    # Found
    resp = client.get("/api/v1/sensors/TEMP-T01/history")
    assert resp.status_code == 200
    assert resp.json()["count"] == 1

    # Not found
    resp404 = client.get("/api/v1/sensors/UNKNOWN_SENSOR/history")
    assert resp404.status_code == 404
    assert resp404.json()["error"] == "SENSOR_NOT_FOUND"


def test_sensor_history_equipment_id_confusion(client, sample_reading_payload):
    # Ingest reading for TRANSFORMER-01
    client.post("/api/v1/readings", json=sample_reading_payload)

    # Calling /sensors/TRANSFORMER-01/history must return 404 with helpful guidance
    resp = client.get("/api/v1/sensors/TRANSFORMER-01/history")
    assert resp.status_code == 404
    data = resp.json()
    assert data["error"] == "SENSOR_NOT_FOUND"
    assert "equipment identifier" in data["message"]
    assert "/api/v1/equipment/TRANSFORMER-01/readings" in data["message"]

    # Verify equipment history works as advised
    eq_resp = client.get("/api/v1/equipment/TRANSFORMER-01/readings")
    assert eq_resp.status_code == 200
    assert eq_resp.json()["count"] == 1

