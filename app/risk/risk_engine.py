from typing import Dict, List, Optional
from app.schemas.sensor import SensorReading
from app.schemas.anomaly import AnomalyReport, AnomalySeverity
from app.schemas.prediction import FailurePrediction, RiskLevel
from app.processing.feature_engineering import SensorFeatures


class RiskEngine:
    """
    Transparent Hybrid Multi-Factor Operational Risk Engine:
    Synthesizes deterministic engineering safety limits with supervised and
    unsupervised machine learning signals into a unified 0–100 score.

    Score Breakdown (0 - 100 points):
    1. Physical Rule Severity (0 - 35 points):
       - CRITICAL physical breach: 35 points
       - WARNING physical breach: 20 points
       - Minor anomaly: 10 points
       - Multi-sensor penalty: +2.5 pts per extra affected sensor (max +5)
    2. ML Anomaly Score (Isolation Forest) (0 - 30 points):
       - Normalized decision distance (0.0 to 1.0) scaled to 30 points
    3. ML Failure Probability (Random Forest) (0 - 35 points):
       - Calibrated predict_proba() failure probability (0.0 to 1.0) scaled to 35 points
    4. Dynamic Trend & Persistence (0 - 10 points):
       - High rate of change (ROC) across sensors contributes dynamic urgency

    Safety Constraint:
    If a deterministic CRITICAL safety threshold is breached (e.g. Temp > 100°C),
    the composite risk is constrained to >= 85.0 (CRITICAL) regardless of ML model latency.
    """

    def calculate_risk(
        self,
        equipment_id: str,
        readings: List[SensorReading],
        anomaly_report: AnomalyReport,
        prediction: Optional[FailurePrediction] = None,
        features: Optional[Dict[str, SensorFeatures]] = None,
    ) -> Dict:
        # 1. Rule-based Severity Component (0 - 35 points)
        rule_score = 0.0
        if anomaly_report.severity == AnomalySeverity.CRITICAL:
            rule_score = 35.0
        elif anomaly_report.severity == AnomalySeverity.WARNING:
            rule_score = 20.0
        elif anomaly_report.anomalyDetected:
            rule_score = 10.0

        extra_sensors = max(0, len(anomaly_report.affectedSensors) - 1)
        rule_score = min(35.0, rule_score + (extra_sensors * 2.5))

        # 2. ML Isolation Forest Component (0 - 30 points)
        ml_anom_score = anomaly_report.anomalyScore if anomaly_report.anomalyScore is not None else 0.0
        ml_anom_contribution = round(ml_anom_score * 30.0, 1)

        # 3. ML Random Forest Failure Probability (0 - 35 points)
        if prediction and prediction.failure_probability is not None:
            failure_prob = prediction.failure_probability
        else:
            failure_prob = 0.05
        ml_failure_contribution = round(failure_prob * 35.0, 1)

        # 4. Dynamic Rate of Change / Trend Component (0 - 10 points)
        trend_score = 2.0  # nominal background noise
        if features:
            high_roc_count = sum(1 for f in features.values() if abs(f.rate_of_change) > 0.3)
            high_deviation_count = sum(1 for f in features.values() if abs(f.baseline_deviation) > 20.0)
            trend_score = min(10.0, trend_score + (high_roc_count * 3.0) + (high_deviation_count * 2.5))

        # Total Composite Calculation (0 - 100)
        raw_composite = rule_score + ml_anom_contribution + ml_failure_contribution + trend_score

        # Safety override constraint
        if anomaly_report.severity == AnomalySeverity.CRITICAL:
            raw_composite = max(raw_composite, 85.0)
        elif anomaly_report.severity == AnomalySeverity.WARNING:
            raw_composite = max(raw_composite, 45.0)

        total_score = round(min(100.0, max(0.0, raw_composite)), 1)

        # Categorize according to project standard
        # LOW: 0-29, MEDIUM: 30-59, HIGH: 60-84, CRITICAL: 85-100
        if total_score >= 85.0:
            level = RiskLevel.CRITICAL
        elif total_score >= 60.0:
            level = RiskLevel.HIGH
        elif total_score >= 30.0:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.LOW

        summary = (
            f"Risk evaluated as {level.value} (Score: {total_score}/100). "
            f"Rule Severity: {rule_score}/35, ML Anomaly: {ml_anom_contribution}/30, "
            f"ML Failure Prob: {ml_failure_contribution}/35, Dynamics: {trend_score}/10."
        )

        return {
            "equipmentId": equipment_id,
            "riskScore": total_score,
            "riskLevel": level,
            "components": {
                "rule_safety_score": rule_score,
                "ml_isolation_forest_score": ml_anom_contribution,
                "ml_failure_probability_score": ml_failure_contribution,
                "trend_dynamic_score": round(trend_score, 1),
                "anomaly_severity_score": rule_score,
                "predictive_stress_score": ml_failure_contribution,
            },
            "summary": summary,
            "method": "transparent_hybrid_risk_v2",
        }


# Singleton risk engine instance
risk_engine = RiskEngine()
