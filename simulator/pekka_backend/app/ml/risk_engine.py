from typing import Dict, List, Any, Optional
from datetime import datetime
from app.models.schemas import SensorReading, SensorStatus, RiskLevel
from app.ml.anomaly_detector import anomaly_detector
from app.ml.failure_predictor import failure_predictor

class RiskEngine:
    def calculate_risk(
        self,
        equipment_id: str,
        current_readings: List[SensorReading],
        history_snapshots: Optional[List[Dict[str, SensorReading]]] = None
    ) -> Dict[str, Any]:
        if not current_readings:
            return {
                "equipmentId": equipment_id,
                "riskScore": 0.0,
                "riskLevel": RiskLevel.LOW,
                "mlRiskContribution": 0.0,
                "safetyRulesRiskContribution": 0.0,
                "operationalImpact": "No active telemetry available to evaluate risk.",
                "timestamp": datetime.now().isoformat()
            }

        # 1. Evaluate ML components
        anomaly_res = anomaly_detector.detect(equipment_id, current_readings, history_snapshots)
        failure_res = failure_predictor.predict(equipment_id, current_readings, history_snapshots)

        ml_anomaly_score = anomaly_res["mlAnomalyScore"]
        failure_prob = failure_res["failureProbability"]
        ml_risk = (ml_anomaly_score * 0.45 + failure_prob * 0.55) * 100.0

        # 2. Evaluate Rule-based safety components
        critical_sensors = [r for r in current_readings if r.status == SensorStatus.CRITICAL]
        warning_sensors = [r for r in current_readings if r.status == SensorStatus.WARNING]

        safety_risk = 0.0
        if critical_sensors:
            safety_risk = 85.0 + min(15.0, len(critical_sensors) * 5.0)
        elif warning_sensors:
            safety_risk = 35.0 + min(35.0, len(warning_sensors) * 8.0)
        else:
            safety_risk = 5.0

        # 3. Composite score (Hybrid: 50% ML + 50% Engineering safety rules, max capped if critical physical violation)
        composite_score = (ml_risk * 0.50) + (safety_risk * 0.50)
        if critical_sensors:
            composite_score = max(composite_score, 88.0)

        composite_score = round(max(0.0, min(100.0, composite_score)), 1)

        # 4. Assign Risk Level
        if composite_score >= 80.0:
            level = RiskLevel.CRITICAL
            impact = "Immediate threat of transformer core failure, winding insulation breakdown, or substation blackout."
        elif composite_score >= 55.0:
            level = RiskLevel.HIGH
            impact = "Severe degradation detected. Operating life reduced; potential thermal tripping or voltage collapse."
        elif composite_score >= 30.0:
            level = RiskLevel.MEDIUM
            impact = "Elevated operating parameters. Accelerated thermal aging and minor grid efficiency loss."
        else:
            level = RiskLevel.LOW
            impact = "Nominal operation. Equipment operating within safe physical and electrical design limits."

        return {
            "equipmentId": equipment_id,
            "riskScore": composite_score,
            "riskLevel": level,
            "mlRiskContribution": round(ml_risk, 1),
            "safetyRulesRiskContribution": round(safety_risk, 1),
            "operationalImpact": impact,
            "timestamp": datetime.now().isoformat()
        }

risk_engine = RiskEngine()
