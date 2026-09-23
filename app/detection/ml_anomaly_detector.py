import os
import logging
from typing import Dict, List, Optional, Tuple
import joblib
import numpy as np

from app.schemas.sensor import SensorReading, SensorType
from app.processing.feature_engineering import feature_engineer, ML_FEATURE_NAMES

logger = logging.getLogger(__name__)


class MLAnomalyDetector:
    """
    Unsupervised ML Anomaly Detector using scikit-learn IsolationForest.
    Learns multivariate normal transformer telemetry patterns and detects
    subtle multidimensional correlations that rule thresholds miss.
    """

    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        self.model = None
        self.scaler = None
        self.is_loaded = False
        self._load_models()

    def _load_models(self) -> bool:
        """Loads serialized Isolation Forest and Scaler artifacts."""
        model_path = os.path.join(self.models_dir, "isolation_forest.joblib")
        scaler_path = os.path.join(self.models_dir, "scaler.joblib")

        if os.path.exists(model_path) and os.path.exists(scaler_path):
            try:
                self.model = joblib.load(model_path)
                self.scaler = joblib.load(scaler_path)
                self.is_loaded = True
                logger.info("Loaded Isolation Forest model and scaler from %s", self.models_dir)
                return True
            except Exception as e:
                logger.error("Failed loading ML Anomaly Detector artifacts: %s", e)
        else:
            logger.warning("ML Anomaly Detector artifacts not found in %s", self.models_dir)
        return False

    def detect(self, equipment_id: str, readings: List[SensorReading]) -> Dict:
        """
        Runs unsupervised anomaly detection on equipment telemetry.
        Returns explainable anomaly report with normalized score (0.0 to 1.0).
        """
        if not self.is_loaded:
            # Attempt lazy reload
            if not self._load_models():
                return {
                    "anomalyDetected": False,
                    "anomalyScore": 0.0,
                    "severity": "NORMAL",
                    "affectedSensors": [],
                    "model": "IsolationForest",
                    "status": "MODEL_NOT_LOADED",
                    "explanation": "ML model artifact not loaded. Relying on rule safety checks.",
                }

        # Vectorize features
        vector, feat_dict, warning_msg = feature_engineer.build_ml_feature_vector(
            readings, min_required_samples=3
        )

        if vector is None:
            return {
                "anomalyDetected": False,
                "anomalyScore": 0.0,
                "severity": "NORMAL",
                "affectedSensors": [],
                "model": "IsolationForest",
                "status": "INSUFFICIENT_HISTORY",
                "explanation": warning_msg or "Insufficient history for ML inference",
            }

        # Scale features
        scaled_vec = self.scaler.transform(vector)

        # IsolationForest decision_function: empirical normal baseline is ~0.23, anomalies drop < 0.15
        decision_val = float(self.model.decision_function(scaled_vec)[0])
        # Normalized anomaly score (0.0 normal to 1.0 critical anomaly)
        anomaly_score = float(np.clip((0.23 - decision_val) / 0.35, 0.0, 1.0))
        anomaly_score = round(anomaly_score, 3)

        raw_pred = int(self.model.predict(scaled_vec)[0])  # -1 = anomaly, 1 = inlier
        anomaly_detected = (raw_pred == -1) or (anomaly_score >= 0.40) or (decision_val < 0.15)

        # Severity categorization based on ML distance
        if anomaly_score >= 0.75:
            severity = "CRITICAL"
        elif anomaly_score >= 0.50:
            severity = "HIGH"
        elif anomaly_score >= 0.35:
            severity = "WARNING"
        else:
            severity = "NORMAL"

        # Attribute affected sensors based on deviations from normal baseline
        affected_sensors = []
        abnormal_signals = []

        # Find which sensorIds in readings correspond to highest deviations
        sensor_map = {r.sensorType: r.sensorId for r in readings}

        if feat_dict.get("temperature", 55.0) > 80.0:
            s_id = sensor_map.get(SensorType.TEMPERATURE, "TEMP")
            affected_sensors.append(s_id)
            abnormal_signals.append(f"Winding temperature ({feat_dict['temperature']} °C)")

        if feat_dict.get("oil_temperature", 50.0) > 75.0:
            s_id = sensor_map.get(SensorType.OIL_TEMPERATURE, "OIL_TEMP")
            affected_sensors.append(s_id)
            abnormal_signals.append(f"Top-oil temperature ({feat_dict['oil_temperature']} °C)")

        if feat_dict.get("vibration", 1.5) > 3.5:
            s_id = sensor_map.get(SensorType.VIBRATION, "VIB")
            affected_sensors.append(s_id)
            abnormal_signals.append(f"Mechanical vibration ({feat_dict['vibration']} mm/s)")

        if feat_dict.get("current", 50.0) > 70.0:
            s_id = sensor_map.get(SensorType.CURRENT, "CURR")
            affected_sensors.append(s_id)
            abnormal_signals.append(f"High current load ({feat_dict['current']} A)")

        if feat_dict.get("power_factor", 0.95) < 0.85:
            s_id = sensor_map.get(SensorType.POWER_FACTOR, "PF")
            affected_sensors.append(s_id)
            abnormal_signals.append(f"Degraded power factor ({feat_dict['power_factor']})")

        if feat_dict.get("oil_pressure", 25.0) < 14.0 or feat_dict.get("oil_pressure", 25.0) > 40.0:
            s_id = sensor_map.get(SensorType.OIL_PRESSURE, "OIL_PRESS")
            affected_sensors.append(s_id)
            abnormal_signals.append(f"Abnormal tank pressure ({feat_dict['oil_pressure']} psi)")

        # Generate human-interpretable explanation
        if anomaly_detected:
            if abnormal_signals:
                signals_str = ", ".join(abnormal_signals[:3])
                explanation = (
                    f"Isolation Forest detected an abnormal multi-sensor correlation pattern "
                    f"(Score: {anomaly_score:.2f}). Primary drivers: {signals_str}."
                )
            else:
                explanation = (
                    f"Isolation Forest detected subtle multivariate operational drift "
                    f"(Score: {anomaly_score:.2f}) diverging from the normal baseline profile."
                )
        else:
            explanation = (
                f"Isolation Forest evaluated operational telemetry as normal "
                f"(Score: {anomaly_score:.2f}). All metrics conform to normal distribution."
            )

        return {
            "equipmentId": equipment_id,
            "anomalyDetected": anomaly_detected,
            "anomalyScore": anomaly_score,
            "severity": severity,
            "affectedSensors": list(set(affected_sensors)),
            "model": "IsolationForest",
            "status": "ACTIVE",
            "explanation": explanation,
            "feature_snapshot": feat_dict,
        }


# Singleton ML anomaly detector instance
ml_anomaly_detector = MLAnomalyDetector()
