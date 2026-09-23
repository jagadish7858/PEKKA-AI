import os
import joblib
import numpy as np
from typing import Dict, List, Any, Optional
from app.config import settings
from app.ml.feature_engineering import (
    compute_feature_vector,
    FEATURE_NAMES,
    NOMINAL_BASELINES,
    extract_raw_sensor_dict
)
from app.models.schemas import SensorReading, SensorStatus

class AnomalyDetector:
    def __init__(self):
        self.scaler = None
        self.model = None
        self.load_model()

    def load_model(self):
        model_dirs = [
            settings.MODELS_DIR,
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "saved_models"),
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved_models"),
        ]
        
        for d in model_dirs:
            scaler_path = os.path.join(d, "scaler.joblib")
            model_path = os.path.join(d, "isolation_forest.joblib")
            if os.path.exists(scaler_path) and os.path.exists(model_path):
                self.scaler = joblib.load(scaler_path)
                self.model = joblib.load(model_path)
                return

        raise FileNotFoundError("Could not find trained isolation_forest.joblib and scaler.joblib")

    def detect(
        self,
        equipment_id: str,
        current_readings: List[SensorReading],
        history_snapshots: Optional[List[Dict[str, SensorReading]]] = None
    ) -> Dict[str, Any]:
        if not current_readings:
            return {
                "equipmentId": equipment_id,
                "anomalyDetected": False,
                "mlAnomalyScore": 0.0,
                "ruleAnomalyDetected": False,
                "severity": "NORMAL",
                "affectedSensors": [],
                "featureContributions": {},
                "explanation": "No telemetry readings available for evaluation.",
                "timestamp": SensorReading.currentIsoTimestamp() if hasattr(SensorReading, 'currentIsoTimestamp') else ""
            }

        feature_vector, features_dict = compute_feature_vector(current_readings, history_snapshots)
        vector_2d = feature_vector.reshape(1, -1)
        scaled_vector = self.scaler.transform(vector_2d)

        # Real ML inference: IsolationForest raw score
        raw_score = -float(self.model.score_samples(scaled_vector)[0])
        # Normalized score: 0.0 (very normal) to 1.0 (severe anomaly)
        ml_score = max(0.0, min(1.0, (raw_score - 0.38) / 0.35))
        ml_detected = bool(self.model.predict(scaled_vector)[0] == -1 or ml_score > 0.50)

        # Rule-based engineering safety checks
        rule_detected = False
        affected_sensors = []
        for r in current_readings:
            if r.status in (SensorStatus.WARNING, SensorStatus.CRITICAL):
                rule_detected = True
                affected_sensors.append(r.sensorId)

        # Feature contributions (explainability)
        contributions = {}
        for name in FEATURE_NAMES:
            val = features_dict.get(name, 0.0)
            baseline = NOMINAL_BASELINES.get(name, 1.0)
            if abs(baseline) > 1e-5:
                rel_dev = abs(val - baseline) / abs(baseline)
            else:
                rel_dev = abs(val)
            contributions[name] = round(float(rel_dev), 4)

        # Sort top drivers
        top_drivers = sorted(contributions.items(), key=lambda x: x[1], reverse=True)[:3]
        top_driver_strs = [f"{k} (+{v*100:.1f}%)" for k, v in top_drivers if v > 0.10]

        severity = "NORMAL"
        if any(r.status == SensorStatus.CRITICAL for r in current_readings) or ml_score > 0.80:
            severity = "CRITICAL"
        elif rule_detected or ml_detected:
            severity = "WARNING"

        anomaly_detected = ml_detected or rule_detected

        if severity == "CRITICAL":
            explanation = f"Critical anomaly detected! Severe multi-sensor deviation across {', '.join(affected_sensors) or 'telemetry channels'}. Key drivers: {', '.join(top_driver_strs)}."
        elif severity == "WARNING":
            explanation = f"Operating condition abnormal. Telemetry drifting from nominal baseline. Key drivers: {', '.join(top_driver_strs)}."
        else:
            explanation = "All telemetry streams operating within nominal baseline bounds."

        from datetime import datetime
        return {
            "equipmentId": equipment_id,
            "anomalyDetected": anomaly_detected,
            "mlAnomalyScore": round(ml_score, 4),
            "ruleAnomalyDetected": rule_detected,
            "severity": severity,
            "affectedSensors": affected_sensors,
            "featureContributions": contributions,
            "explanation": explanation,
            "timestamp": datetime.now().isoformat()
        }

anomaly_detector = AnomalyDetector()
