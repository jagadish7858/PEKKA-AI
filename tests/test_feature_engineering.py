from datetime import datetime, timezone, timedelta
from app.processing.feature_engineering import FeatureEngineer
from app.schemas.sensor import SensorReading, SensorType, SensorStatus


def test_feature_engineering_rolling_statistics():
    engineer = FeatureEngineer(window_size=5)
    base_time = datetime(2026, 9, 23, 10, 0, 0, tzinfo=timezone.utc)

    # 5 readings with values 10, 20, 30, 40, 50
    readings = [
        SensorReading(
            sensorId="TEMP-01",
            equipmentId="T-01",
            sensorType=SensorType.TEMPERATURE,
            value=float(val),
            unit="°C",
            timestamp=base_time + timedelta(seconds=idx * 10),
            status=SensorStatus.NORMAL,
        )
        for idx, val in enumerate([10, 20, 30, 40, 50])
    ]

    features = engineer.compute_sensor_features(readings)
    assert features is not None
    assert features.current_value == 50.0
    assert features.rolling_mean == 30.0
    assert features.min_value == 10.0
    assert features.max_value == 50.0
    assert features.sample_count == 5

    # Rate of change: (50 - 10) / 40 seconds = 1.0 deg/sec
    assert abs(features.rate_of_change - 1.0) < 1e-4

    # Baseline deviation from nominal 55.0 °C: 50.0 - 55.0 = -5.0
    assert features.baseline_deviation == -5.0


def test_feature_engineering_empty_handling():
    engineer = FeatureEngineer()
    assert engineer.compute_sensor_features([]) is None
