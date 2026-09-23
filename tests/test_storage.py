import threading
from datetime import datetime, timezone
from app.storage.memory_store import InMemoryStore
from app.schemas.sensor import SensorReading, SensorType, SensorStatus


def test_in_memory_store_capacity_bounding():
    # Create store with capacity 5
    store = InMemoryStore(max_history_per_sensor=5)

    for i in range(10):
        reading = SensorReading(
            sensorId="TEMP-01",
            equipmentId="EQ-01",
            sensorType=SensorType.TEMPERATURE,
            value=50.0 + i,
            unit="°C",
            timestamp=datetime.now(timezone.utc),
            status=SensorStatus.NORMAL,
        )
        store.add_reading(reading)

    history = store.get_sensor_history("TEMP-01")
    # Must be capped at 5
    assert len(history) == 5
    # Must retain newest readings (5 to 9 -> values 55.0 to 59.0)
    assert history[0].value == 55.0
    assert history[-1].value == 59.0


def test_in_memory_store_isolation():
    store = InMemoryStore(max_history_per_sensor=10)

    r1 = SensorReading(
        sensorId="TEMP-01",
        equipmentId="EQ-A",
        sensorType=SensorType.TEMPERATURE,
        value=60.0,
        unit="°C",
        timestamp=datetime.now(timezone.utc),
        status=SensorStatus.NORMAL,
    )
    r2 = SensorReading(
        sensorId="TEMP-02",
        equipmentId="EQ-B",
        sensorType=SensorType.TEMPERATURE,
        value=65.0,
        unit="°C",
        timestamp=datetime.now(timezone.utc),
        status=SensorStatus.NORMAL,
    )

    store.add_reading(r1)
    store.add_reading(r2)

    assert len(store.get_equipment_readings("EQ-A")) == 1
    assert len(store.get_equipment_readings("EQ-B")) == 1
    assert store.get_equipment_readings("EQ-A")[0].value == 60.0
    assert store.get_equipment_readings("EQ-B")[0].value == 65.0


def test_in_memory_store_concurrency():
    store = InMemoryStore(max_history_per_sensor=200)

    def worker(worker_id: int):
        for i in range(20):
            reading = SensorReading(
                sensorId=f"CONC-S{worker_id}",
                equipmentId="CONC-EQ",
                sensorType=SensorType.CURRENT,
                value=float(i),
                unit="A",
                timestamp=datetime.now(timezone.utc),
                status=SensorStatus.NORMAL,
            )
            store.add_reading(reading)

    threads = [threading.Thread(target=worker, args=(t,)) for t in range(5)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    # 5 workers * 20 = 100 readings total for equipment
    assert len(store.get_equipment_readings("CONC-EQ")) == 100
    assert len(store.get_latest_readings()) == 5
