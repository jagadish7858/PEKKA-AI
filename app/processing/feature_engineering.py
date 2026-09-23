from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from app.schemas.sensor import SensorReading, SensorType

# Standard engineering nominal baselines for power transformers
NOMINAL_BASELINES: Dict[SensorType, float] = {
    SensorType.TEMPERATURE: 55.0,        # Standard operating temp in °C
    SensorType.OIL_TEMPERATURE: 50.0,    # Normal top-oil temp in °C
    SensorType.VOLTAGE: 400.0,           # Rated primary/secondary line voltage (e.g., 400V)
    SensorType.CURRENT: 50.0,            # Rated nominal current (A)
    SensorType.VIBRATION: 1.5,           # Normal mechanical vibration mm/s RMS
    SensorType.LOAD: 75.0,               # Normal % capacity load
    SensorType.POWER_FACTOR: 0.95,       # Target power factor
    SensorType.FREQUENCY: 50.0,          # Nominal system frequency (50 Hz or 60 Hz)
    SensorType.OIL_PRESSURE: 25.0,       # Nominal tank pressure in psi / kPa
}

# The 15 features used across all ML models
ML_FEATURE_NAMES = [
    "temperature",
    "oil_temperature",
    "oil_pressure",
    "voltage",
    "current",
    "vibration",
    "load",
    "power_factor",
    "frequency",
    "temp_oil_delta",
    "apparent_power_ratio",
    "temp_rate_of_change",
    "vib_rate_of_change",
    "rolling_temp_std",
    "rolling_current_std",
]


@dataclass
class SensorFeatures:
    """Statistical summary features for a sensor over a recent time window."""
    sensor_id: str
    equipment_id: str
    sensor_type: SensorType
    current_value: float
    rolling_mean: float
    rolling_std: float
    min_value: float
    max_value: float
    rate_of_change: float       # Value delta per second
    baseline_deviation: float   # Difference from engineering baseline
    sample_count: int


class FeatureEngineer:
    """
    Extracts statistical and temporal features from raw sensor telemetry.
    Supports both single-sensor rolling metrics and multi-variate ML feature vectors.
    """

    def __init__(self, window_size: int = 20):
        self.window_size = window_size

    def compute_sensor_features(self, readings: List[SensorReading]) -> Optional[SensorFeatures]:
        """
        Computes windowed rolling statistics, rate of change, and baseline deviation
        for a chronological list of sensor readings.
        """
        if not readings:
            return None

        window = readings[-self.window_size:]
        values = np.array([r.value for r in window], dtype=float)
        timestamps = [r.timestamp.timestamp() for r in window]

        current_val = float(values[-1])
        rolling_mean = float(np.mean(values))
        rolling_std = float(np.std(values)) if len(values) > 1 else 0.0
        min_val = float(np.min(values))
        max_val = float(np.max(values))

        # Rate of change: delta value / delta time (per second)
        rate_of_change = 0.0
        if len(window) >= 2:
            dt = timestamps[-1] - timestamps[0]
            if dt > 0.001:
                rate_of_change = float((values[-1] - values[0]) / dt)

        # Baseline deviation
        nominal = NOMINAL_BASELINES.get(readings[-1].sensorType, rolling_mean)
        baseline_deviation = float(current_val - nominal)

        return SensorFeatures(
            sensor_id=readings[-1].sensorId,
            equipment_id=readings[-1].equipmentId,
            sensor_type=readings[-1].sensorType,
            current_value=current_val,
            rolling_mean=rolling_mean,
            rolling_std=rolling_std,
            min_value=min_val,
            max_value=max_val,
            rate_of_change=rate_of_change,
            baseline_deviation=baseline_deviation,
            sample_count=len(window),
        )

    def compute_equipment_features(
        self, readings_by_sensor: Dict[str, List[SensorReading]]
    ) -> Dict[str, SensorFeatures]:
        """Extracts features for all sensors associated with an equipment."""
        features: Dict[str, SensorFeatures] = {}
        for sensor_id, readings in readings_by_sensor.items():
            feat = self.compute_sensor_features(readings)
            if feat:
                features[sensor_id] = feat
        return features

    def build_ml_feature_vector(
        self, readings: List[SensorReading], min_required_samples: int = 3
    ) -> Tuple[Optional[np.ndarray], Dict[str, float], Optional[str]]:
        """
        Constructs the 15-dimensional feature vector required by IsolationForest
        and RandomForestClassifier from the equipment's telemetry stream.
        Handles missing sensor metrics with nominal engineering imputation.
        Returns: (feature_vector_array, feature_dict, error_or_warning_msg)
        """
        if not readings or len(readings) < min_required_samples:
            count = len(readings) if readings else 0
            return (
                None,
                {},
                f"Insufficient history for ML inference: received {count} reading(s), minimum {min_required_samples} required."
            )

        # Separate readings by sensorType
        by_type: Dict[SensorType, List[SensorReading]] = {}
        for r in readings:
            by_type.setdefault(r.sensorType, []).append(r)

        # Extract latest value or nominal fallback
        def get_latest(stype: SensorType) -> float:
            if stype in by_type and by_type[stype]:
                return float(by_type[stype][-1].value)
            return NOMINAL_BASELINES[stype]

        def get_series(stype: SensorType) -> List[float]:
            if stype in by_type and by_type[stype]:
                return [float(x.value) for x in by_type[stype][-self.window_size:]]
            return [NOMINAL_BASELINES[stype]]

        temp = get_latest(SensorType.TEMPERATURE)
        oil_temp = get_latest(SensorType.OIL_TEMPERATURE)
        oil_press = get_latest(SensorType.OIL_PRESSURE)
        volt = get_latest(SensorType.VOLTAGE)
        curr = get_latest(SensorType.CURRENT)
        vib = get_latest(SensorType.VIBRATION)
        load = get_latest(SensorType.LOAD)
        pf = get_latest(SensorType.POWER_FACTOR)
        freq = get_latest(SensorType.FREQUENCY)

        # Rolling statistics & rate of change
        temp_series = get_series(SensorType.TEMPERATURE)
        curr_series = get_series(SensorType.CURRENT)
        vib_series = get_series(SensorType.VIBRATION)

        temp_roc = 0.0
        if len(temp_series) >= 2:
            temp_roc = (temp_series[-1] - temp_series[0]) / float(len(temp_series))

        vib_roc = 0.0
        if len(vib_series) >= 2:
            vib_roc = (vib_series[-1] - vib_series[0]) / float(len(vib_series))

        rolling_temp_std = float(np.std(temp_series)) if len(temp_series) > 1 else 0.5
        rolling_curr_std = float(np.std(curr_series)) if len(curr_series) > 1 else 1.0

        feat_dict = {
            "temperature": round(temp, 2),
            "oil_temperature": round(oil_temp, 2),
            "oil_pressure": round(oil_press, 2),
            "voltage": round(volt, 2),
            "current": round(curr, 2),
            "vibration": round(vib, 2),
            "load": round(load, 2),
            "power_factor": round(pf, 3),
            "frequency": round(freq, 2),
            "temp_oil_delta": round(temp - oil_temp, 2),
            "apparent_power_ratio": round((volt * curr) / (400.0 * 50.0), 3),
            "temp_rate_of_change": round(temp_roc, 4),
            "vib_rate_of_change": round(vib_roc, 4),
            "rolling_temp_std": round(rolling_temp_std, 3),
            "rolling_current_std": round(rolling_curr_std, 3),
        }

        vector = np.array([[feat_dict[k] for k in ML_FEATURE_NAMES]], dtype=float)
        return vector, feat_dict, None


# Feature engineering singleton instance
feature_engineer = FeatureEngineer()
