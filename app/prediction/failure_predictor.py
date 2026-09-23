from abc import ABC, abstractmethod
from typing import Dict, List, Optional
from app.schemas.sensor import SensorReading, SensorType
from app.schemas.prediction import FailurePrediction, RiskLevel
from app.schemas.anomaly import AnomalyReport, AnomalySeverity
from app.processing.feature_engineering import SensorFeatures


class BaseFailurePredictor(ABC):
    """
    Abstract interface for equipment failure risk prediction.
    Ready for substitution with trained Gradient Boosting / Random Forest / LSTM models in Phase 2.
    """

    @abstractmethod
    def predict(
        self,
        equipment_id: str,
        readings: List[SensorReading],
        anomaly_report: AnomalyReport,
        features: Optional[Dict[str, SensorFeatures]] = None,
    ) -> FailurePrediction:
        pass


class HeuristicFailurePredictor(BaseFailurePredictor):
    """
    Phase 1 Rule-Based Heuristic Failure Predictor.
    Transparently predicts failure risk based on physical multi-sensor stress patterns:
    - High winding temperature + high load/current -> Thermal Breakdown Risk
    - High vibration -> Mechanical Bearing/Core Looseness
    - Oil temperature + pressure irregularities -> Cooling/Dielectric Insulation Failure
    NOTE: Transparent baseline implementation. No artificial ML accuracy is claimed.
    """

    def predict(
        self,
        equipment_id: str,
        readings: List[SensorReading],
        anomaly_report: AnomalyReport,
        features: Optional[Dict[str, SensorFeatures]] = None,
    ) -> FailurePrediction:
        if not readings:
            return FailurePrediction(
                equipmentId=equipment_id,
                riskScore=0.0,
                riskLevel=RiskLevel.LOW,
                predictedFailureMode="NONE",
                confidence=0.5,
                contributingFactors=["No recent sensor readings available."],
                evaluationMethod="heuristic_trend_v1",
            )

        # Map readings by sensor type
        latest_by_type: Dict[SensorType, SensorReading] = {}
        for r in readings:
            latest_by_type[r.sensorType] = r

        contributing = []
        base_score = 10.0  # nominal background risk
        failure_mode = "NORMAL_OPERATION"

        temp_reading = latest_by_type.get(SensorType.TEMPERATURE)
        oil_temp = latest_by_type.get(SensorType.OIL_TEMPERATURE)
        vib_reading = latest_by_type.get(SensorType.VIBRATION)
        curr_reading = latest_by_type.get(SensorType.CURRENT)
        load_reading = latest_by_type.get(SensorType.LOAD)
        volt_reading = latest_by_type.get(SensorType.VOLTAGE)
        press_reading = latest_by_type.get(SensorType.OIL_PRESSURE)

        # Thermal overload analysis
        is_high_temp = temp_reading and temp_reading.value > 85.0
        is_crit_temp = temp_reading and temp_reading.value > 100.0
        is_high_load = (curr_reading and curr_reading.value > 75.0) or (load_reading and load_reading.value > 90.0)

        if is_crit_temp:
            base_score += 45.0
            contributing.append(f"Critical winding temperature ({temp_reading.value} °C)")
            failure_mode = "THERMAL_RUNAWAY"
        elif is_high_temp:
            base_score += 25.0
            contributing.append(f"Elevated winding temperature ({temp_reading.value} °C)")
            failure_mode = "THERMAL_OVERLOAD"

        if is_high_load:
            base_score += 20.0
            contributing.append("Elevated electrical current / capacity load")
            if is_high_temp or is_crit_temp:
                base_score += 15.0  # Compound thermal-electrical stress
                failure_mode = "ACCELERATED_INSULATION_DEGRADATION"

        # Mechanical vibration analysis
        if vib_reading:
            if vib_reading.value >= 8.0:
                base_score += 40.0
                contributing.append(f"Severe mechanical vibration ({vib_reading.value} mm/s)")
                failure_mode = "MECHANICAL_CORE_OR_BEARING_FAILURE"
            elif vib_reading.value >= 4.5:
                base_score += 20.0
                contributing.append(f"Elevated vibration ({vib_reading.value} mm/s)")
                if failure_mode == "NORMAL_OPERATION":
                    failure_mode = "MECHANICAL_LOOSENESS"

        # Dielectric / Oil pressure analysis
        if oil_temp and oil_temp.value >= 90.0:
            base_score += 20.0
            contributing.append(f"High top-oil temperature ({oil_temp.value} °C)")
        if press_reading and (press_reading.value < 12.0 or press_reading.value > 45.0):
            base_score += 25.0
            contributing.append(f"Abnormal transformer tank oil pressure ({press_reading.value} {press_reading.unit})")
            failure_mode = "DIELECTRIC_OIL_LEAK_OR_OVERPRESSURE"

        # Factor in rate of change from features if available
        if features:
            for s_id, feat in features.items():
                if abs(feat.rate_of_change) > 0.5:
                    base_score += 10.0
                    contributing.append(f"Rapid telemetry rate of change on sensor {s_id} ({feat.rate_of_change:.2f}/s)")

        # Severity multiplier from anomaly report
        if anomaly_report.severity == AnomalySeverity.CRITICAL:
            base_score = max(base_score, 85.0)
        elif anomaly_report.severity == AnomalySeverity.WARNING:
            base_score = max(base_score, 50.0)

        # Bound score between 0 and 100
        risk_score = round(min(100.0, max(0.0, base_score)), 1)

        # Categorize level
        if risk_score >= 85.0:
            risk_level = RiskLevel.CRITICAL
        elif risk_score >= 60.0:
            risk_level = RiskLevel.HIGH
        elif risk_score >= 30.0:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.LOW
            if not contributing:
                contributing.append("All monitored metrics within nominal bounds.")
                failure_mode = "NONE"

        confidence = 0.85 if anomaly_report.anomalyDetected else 0.90

        return FailurePrediction(
            equipmentId=equipment_id,
            riskScore=risk_score,
            riskLevel=risk_level,
            risk_level=risk_level,
            predictedFailureMode=failure_mode,
            prediction=f"{risk_level.value}_FAILURE_RISK",
            failure_probability=round(risk_score / 100.0, 3),
            confidence=confidence,
            confidence_or_probability=confidence,
            ml_model="RuleHeuristicBaseline",
            supporting_features=contributing[:3],
            contributingFactors=contributing,
            explanation=f"Heuristic rule model evaluated {failure_mode} based on physical limits.",
            evaluationMethod="heuristic_trend_v1",
        )


class HybridFailurePredictor(BaseFailurePredictor):
    """
    Hybrid Failure Risk Predictor:
    Combines supervised scikit-learn RandomForestClassifier with
    physical rule-based safety constraints.
    """

    def __init__(self, heuristic_predictor: Optional[HeuristicFailurePredictor] = None):
        self.heuristic = heuristic_predictor or HeuristicFailurePredictor()

    def predict(
        self,
        equipment_id: str,
        readings: List[SensorReading],
        anomaly_report: AnomalyReport,
        features: Optional[Dict[str, SensorFeatures]] = None,
    ) -> FailurePrediction:
        # Run heuristic baseline
        rule_pred = self.heuristic.predict(equipment_id, readings, anomaly_report, features)

        # Run ML Random Forest
        from app.prediction.ml_failure_predictor import ml_failure_predictor
        ml_pred = ml_failure_predictor.predict(equipment_id, readings)

        # If ML has insufficient history or model not loaded, defer cleanly to rule prediction
        if ml_pred.predictedFailureMode in ("INSUFFICIENT_HISTORY", "MODEL_UNAVAILABLE"):
            rule_pred.explanation = (
                f"{rule_pred.explanation} (Note: ML Random Forest deferred due to "
                f"{ml_pred.predictedFailureMode.lower()} - min 3 readings required)."
            )
            return rule_pred

        # Synthesize hybrid failure score:
        # Take the maximum of ML failure probability and rule-based severity risk
        # to ensure safety rules are never relaxed by model under-prediction
        ml_prob = ml_pred.failure_probability or 0.0
        ml_score = round(ml_prob * 100.0, 1)

        # Safety override: if rule-based detected critical thermal or vibration breach
        final_score = max(ml_score, rule_pred.riskScore)

        if final_score >= 85.0:
            final_level = RiskLevel.CRITICAL
        elif final_score >= 60.0:
            final_level = RiskLevel.HIGH
        elif final_score >= 30.0:
            final_level = RiskLevel.MEDIUM
        else:
            final_level = RiskLevel.LOW

        failure_mode = ml_pred.predictedFailureMode
        if failure_mode in ("NORMAL", "NONE") and rule_pred.predictedFailureMode != "NONE":
            failure_mode = rule_pred.predictedFailureMode

        # Merge supporting signals
        merged_signals = list(dict.fromkeys(ml_pred.supporting_features + rule_pred.contributingFactors))

        explanation = (
            f"Random Forest predicted {ml_pred.prediction} with {ml_prob*100:.1f}% failure probability "
            f"({failure_mode}). Combined with {anomaly_report.severity.value} safety status."
        )

        return FailurePrediction(
            equipmentId=equipment_id,
            riskScore=final_score,
            riskLevel=final_level,
            risk_level=final_level,
            predictedFailureMode=failure_mode,
            prediction=f"{final_level.value}_FAILURE_RISK",
            failure_probability=ml_prob,
            confidence=ml_pred.confidence,
            confidence_or_probability=ml_prob,
            ml_model="RandomForestClassifier",
            supporting_features=merged_signals[:4],
            contributingFactors=rule_pred.contributingFactors,
            explanation=explanation,
            evaluationMethod="hybrid_random_forest_v1",
        )


# Singleton failure predictor instance: uses HybridFailurePredictor by default
failure_predictor = HybridFailurePredictor()
