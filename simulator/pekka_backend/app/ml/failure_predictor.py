import os
import joblib
import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime
from app.config import settings
from app.ml.feature_engineering import compute_feature_vector, FEATURE_NAMES
from app.models.schemas import SensorReading

STATE_LABELS = {
    0: "NORMAL",
    1: "WARNING_DEGRADATION",
    2: "CRITICAL_FAILURE"
}

class FailurePredictor:
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
            model_path = os.path.join(d, "random_forest.joblib")
            if os.path.exists(scaler_path) and os.path.exists(model_path):
                self.scaler = joblib.load(scaler_path)
                self.model = joblib.load(model_path)
                return

        raise FileNotFoundError("Could not find trained random_forest.joblib and scaler.joblib")

    def predict(
        self,
        equipment_id: str,
        current_readings: List[SensorReading],
        history_snapshots: Optional[List[Dict[str, SensorReading]]] = None
    ) -> Dict[str, Any]:
        if not current_readings:
            return {
                "equipmentId": equipment_id,
                "predictedState": "UNKNOWN",
                "failureProbability": 0.0,
                "estimatedTimeToFailureHours": None,
                "topRiskDrivers": [],
                "modelConfidence": 0.0,
                "timestamp": datetime.now().isoformat()
            }

        feature_vector, features_dict = compute_feature_vector(current_readings, history_snapshots)
        vector_2d = feature_vector.reshape(1, -1)
        scaled_vector = self.scaler.transform(vector_2d)

        # Real ML inference: RandomForestClassifier probabilities
        probabilities = self.model.predict_proba(scaled_vector)[0]
        predicted_class_idx = int(np.argmax(probabilities))
        predicted_state = STATE_LABELS.get(predicted_class_idx, "NORMAL")
        
        # Real failure probability = prob(WARNING) * 0.4 + prob(CRITICAL) * 1.0
        prob_normal = float(probabilities[0]) if len(probabilities) > 0 else 1.0
        prob_warning = float(probabilities[1]) if len(probabilities) > 1 else 0.0
        prob_critical = float(probabilities[2]) if len(probabilities) > 2 else 0.0

        failure_probability = float(prob_warning * 0.45 + prob_critical * 1.0)
        confidence = float(np.max(probabilities))

        # Calculate estimated time to failure (RUL estimate)
        estimated_ttf = None
        if predicted_state == "CRITICAL_FAILURE" or failure_probability > 0.70:
            temp_roc = features_dict.get("temp_rate_of_change", 0.0)
            vibr_roc = features_dict.get("vibr_rate_of_change", 0.0)
            roc_speed = max(0.1, temp_roc + vibr_roc * 2.0)
            estimated_ttf = round(max(0.5, 6.0 / roc_speed), 1)  # hours
        elif predicted_state == "WARNING_DEGRADATION" or failure_probability > 0.30:
            estimated_ttf = round(24.0 + (1.0 - failure_probability) * 48.0, 1)  # hours

        # Feature importances weighted by current deviations
        importances = self.model.feature_importances_
        feature_impacts = {}
        for idx, name in enumerate(FEATURE_NAMES):
            feature_impacts[name] = float(importances[idx] * abs(scaled_vector[0][idx]))
        
        top_risk_drivers = sorted(feature_impacts.items(), key=lambda x: x[1], reverse=True)[:3]
        top_driver_names = [k for k, v in top_risk_drivers if v > 0.05]

        return {
            "equipmentId": equipment_id,
            "predictedState": predicted_state,
            "failureProbability": round(failure_probability, 4),
            "estimatedTimeToFailureHours": estimated_ttf,
            "topRiskDrivers": top_driver_names,
            "modelConfidence": round(confidence, 4),
            "timestamp": datetime.now().isoformat()
        }

failure_predictor = FailurePredictor()
