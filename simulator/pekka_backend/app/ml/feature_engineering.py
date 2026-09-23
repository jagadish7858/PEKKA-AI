import numpy as np
from typing import Dict, List, Any, Tuple, Optional
from app.models.schemas import SensorReading, SensorType

FEATURE_NAMES = [
    "temperature",
    "voltage",
    "current",
    "vibration",
    "load_percentage",
    "power_factor",
    "frequency",
    "oil_temperature",
    "oil_pressure",
    "temp_oil_gradient",
    "apparent_power_est",
    "voltage_deviation",
    "freq_deviation",
    "temp_rate_of_change",
    "vibr_rate_of_change",
    "load_rate_of_change"
]

NOMINAL_BASELINES = {
    "temperature": 60.0,
    "voltage": 230.0,
    "current": 350.0,
    "vibration": 1.8,
    "load_percentage": 50.0,
    "power_factor": 0.95,
    "frequency": 50.0,
    "oil_temperature": 52.0,
    "oil_pressure": 1.5,
    "temp_oil_gradient": 8.0,
    "apparent_power_est": 80.5,
    "voltage_deviation": 0.0,
    "freq_deviation": 0.0,
    "temp_rate_of_change": 0.0,
    "vibr_rate_of_change": 0.0,
    "load_rate_of_change": 0.0
}

def extract_raw_sensor_dict(readings: List[SensorReading]) -> Dict[str, float]:
    d = {}
    for r in readings:
        sensor_type = r.sensorType.value if hasattr(r.sensorType, "value") else str(r.sensorType)
        d[sensor_type.lower()] = float(r.value)
    return d

def compute_feature_vector(
    current_readings: List[SensorReading],
    history_snapshots: Optional[List[Dict[str, SensorReading]]] = None
) -> Tuple[np.ndarray, Dict[str, float]]:
    """
    Computes a 16-dimensional physics-informed feature vector from current readings
    and recent time-series history snapshots.
    """
    raw = extract_raw_sensor_dict(current_readings)
    
    # Extract 9 base values with fallback to nominal baselines
    temp = raw.get("temperature", NOMINAL_BASELINES["temperature"])
    volt = raw.get("voltage", NOMINAL_BASELINES["voltage"])
    curr = raw.get("current", NOMINAL_BASELINES["current"])
    vibr = raw.get("vibration", NOMINAL_BASELINES["vibration"])
    load = raw.get("load_percentage", NOMINAL_BASELINES["load_percentage"])
    pf = raw.get("power_factor", NOMINAL_BASELINES["power_factor"])
    freq = raw.get("frequency", NOMINAL_BASELINES["frequency"])
    oil_temp = raw.get("oil_temperature", NOMINAL_BASELINES["oil_temperature"])
    oil_pres = raw.get("oil_pressure", NOMINAL_BASELINES["oil_pressure"])
    
    # Physics derived cross-features
    temp_oil_diff = temp - oil_temp
    apparent_power = (volt * curr) / 1000.0  # kVA approximation
    volt_dev = abs(volt - 230.0)
    freq_dev = abs(freq - 50.0)
    
    # Time-series rate-of-change (derivatives)
    temp_roc = 0.0
    vibr_roc = 0.0
    load_roc = 0.0
    
    if history_snapshots and len(history_snapshots) >= 2:
        prev_snapshot = history_snapshots[-2]
        if "TEMPERATURE" in prev_snapshot:
            temp_roc = temp - float(prev_snapshot["TEMPERATURE"].value)
        if "VIBRATION" in prev_snapshot:
            vibr_roc = vibr - float(prev_snapshot["VIBRATION"].value)
        if "LOAD_PERCENTAGE" in prev_snapshot:
            load_roc = load - float(prev_snapshot["LOAD_PERCENTAGE"].value)
            
    features_dict = {
        "temperature": temp,
        "voltage": volt,
        "current": curr,
        "vibration": vibr,
        "load_percentage": load,
        "power_factor": pf,
        "frequency": freq,
        "oil_temperature": oil_temp,
        "oil_pressure": oil_pres,
        "temp_oil_gradient": temp_oil_diff,
        "apparent_power_est": apparent_power,
        "voltage_deviation": volt_dev,
        "freq_deviation": freq_dev,
        "temp_rate_of_change": temp_roc,
        "vibr_rate_of_change": vibr_roc,
        "load_rate_of_change": load_roc
    }
    
    vector = np.array([features_dict[name] for name in FEATURE_NAMES], dtype=np.float32)
    return vector, features_dict
