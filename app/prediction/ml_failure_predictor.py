import os
import logging
from typing import Dict, List, Optional
import joblib
import numpy as np

from app.schemas.sensor import SensorReading
from app.schemas.prediction import FailurePrediction, RiskLevel
from app.processing.feature_engineering import feature_engineer, ML_FEATURE_NAMES
from training.train_failure_model import LABEL_NAMES

logger = logging.getLogger(__name__)


class MLFailurePredictor:
    """
    Supervised ML Failure Risk Predictor using scikit-learn RandomForestClassifier.
    Predicts calibrated failure probabilities, failure modes, and ranked supporting signals.
    """

    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        self.model = None
        self.scaler = None
        self.metadata = {}
        self.is_loaded = False
        self._load_models()

    def _load_models(self) -> bool:
        """Loads serialized Random Forest model, scaler, and metadata."""
        model_path = os.path.join(self.models_dir, "failure_rf.joblib")
        scaler_path = os.path.join(self.models_dir, "scaler.joblib")
        metadata_path = os.path.join(self.models_dir, "metadata.joblib")

        if os.path.exists(model_path) and os.path.exists(scaler_path):
            try:
                self.model = joblib.load(model_path)
                self.scaler = joblib.load(scaler_path)
                if os.path.exists(metadata_path):
                    self.metadata = joblib.load(metadata_path)
                self.is_loaded = True
                logger.info("Loaded Random Forest model from %s", self.models_dir)
                return True
            except Exception as e:
                logger.error("Failed loading ML Failure Predictor artifacts: %s", e)
        else:
            logger.warning("ML Failure Predictor artifacts not found in %s", self.models_dir)
        return False

    def predict(
        self,
        equipment_id: str,
        readings: List[SensorReading],
    ) -> FailurePrediction:
        """
        Calculates failure risk using the trained Random Forest model.
        Returns true probabilities from model.predict_proba(), not hardcoded values.
        """
        if not self.is_loaded:
            if not self._load_models():
                return FailurePrediction(
                    equipmentId=equipment_id,
                    riskScore=10.0,
                    riskLevel=RiskLevel.LOW,
                    risk_level=RiskLevel.LOW,
                    predictedFailureMode="MODEL_UNAVAILABLE",
                    prediction="NORMAL",
                    failure_probability=0.05,
                    confidence=0.5,
                    confidence_or_probability=0.05,
                    ml_model="RandomForestClassifier",
                    supporting_features=[],
                    contributingFactors=["ML model artifact not loaded. Defaulting to baseline."],
                    explanation="ML failure predictor model artifact not available. Deferring to rule safety.",
                    evaluationMethod="fallback_rule_v1",
                )

        # Build feature vector
        vector, feat_dict, warning_msg = feature_engineer.build_ml_feature_vector(
            readings, min_required_samples=3
        )

        if vector is None:
            return FailurePrediction(
                equipmentId=equipment_id,
                riskScore=5.0,
                riskLevel=RiskLevel.LOW,
                risk_level=RiskLevel.LOW,
                predictedFailureMode="INSUFFICIENT_HISTORY",
                prediction="NORMAL",
                failure_probability=0.0,
                confidence=0.5,
                confidence_or_probability=0.0,
                ml_model="RandomForestClassifier",
                supporting_features=[],
                contributingFactors=[warning_msg or "Insufficient history for ML inference."],
                explanation=warning_msg or "Insufficient history for ML inference (minimum 3 readings required).",
                evaluationMethod="hybrid_random_forest_v1",
            )

        # Scale feature vector
        scaled_vec = self.scaler.transform(vector)

        # Get true class probabilities from the Random Forest model
        probabilities = self.model.predict_proba(scaled_vec)[0]
        predicted_class_idx = int(self.model.predict(scaled_vec)[0])

        labels = self.metadata.get("label_names", LABEL_NAMES)
        predicted_mode = labels[predicted_class_idx] if predicted_class_idx < len(labels) else "UNKNOWN"

        # Failure probability is probability of any non-normal class
        # Class 0 is NORMAL
        prob_normal = float(probabilities[0])
        failure_prob = float(round(1.0 - prob_normal, 3))

        # Multi-factor failure risk score (0 - 100) derived from model's failure probability
        risk_score = round(failure_prob * 100.0, 1)

        # Categorize risk level
        if risk_score >= 85.0:
            risk_level = RiskLevel.CRITICAL
            pred_summary = "CRITICAL_FAILURE_RISK"
        elif risk_score >= 60.0:
            risk_level = RiskLevel.HIGH
            pred_summary = "HIGH_FAILURE_RISK"
        elif risk_score >= 30.0:
            risk_level = RiskLevel.MEDIUM
            pred_summary = "MEDIUM_FAILURE_RISK"
        else:
            risk_level = RiskLevel.LOW
            pred_summary = "NORMAL"

        # Extract top supporting features using model feature importances & deviations
        importances = self.metadata.get("feature_importances", {})
        ranked_feats = []
        for fname in ML_FEATURE_NAMES:
            imp = importances.get(fname, 0.0)
            val = feat_dict.get(fname, 0.0)
            ranked_feats.append((fname, imp, val))

        # Sort by importance
        ranked_feats.sort(key=lambda x: x[1], reverse=True)

        supporting_features = []
        contributing_factors = []
        for fname, imp, val in ranked_feats[:4]:
            text = f"{fname.replace('_', ' ').capitalize()}: {val} (Weight: {imp:.2f})"
            supporting_features.append(text)
            if fname == "temperature" and val > 80.0:
                contributing_factors.append(f"Winding temperature elevated ({val} °C)")
            elif fname == "vibration" and val > 3.0:
                contributing_factors.append(f"Mechanical vibration elevated ({val} mm/s)")
            elif fname == "current" and val > 70.0:
                contributing_factors.append(f"Overcurrent detected ({val} A)")
            elif fname == "power_factor" and val < 0.85:
                contributing_factors.append(f"Poor power factor ({val})")

        if not contributing_factors:
            contributing_factors.append("All key telemetry metrics within normal operational bounds.")

        # Construct explanation
        if failure_prob >= 0.50:
            explanation = (
                f"Random Forest model predicts {pred_summary} with {failure_prob*100:.1f}% failure probability. "
                f"Predicted degradation mode: {predicted_mode}. Key stress factors: {', '.join(supporting_features[:2])}."
            )
        else:
            explanation = (
                f"Random Forest model indicates stable normal operation with {prob_normal*100:.1f}% confidence. "
                f"Risk probability is low ({failure_prob*100:.1f}%)."
            )

        return FailurePrediction(
            equipmentId=equipment_id,
            riskScore=risk_score,
            riskLevel=risk_level,
            risk_level=risk_level,
            predictedFailureMode=predicted_mode,
            prediction=pred_summary,
            failure_probability=failure_prob,
            confidence=round(float(np.max(probabilities)), 3),
            confidence_or_probability=failure_prob,
            ml_model="RandomForestClassifier",
            supporting_features=supporting_features,
            contributingFactors=contributing_factors,
            explanation=explanation,
            evaluationMethod="hybrid_random_forest_v1",
        )


# Singleton ML failure predictor instance
ml_failure_predictor = MLFailurePredictor()
