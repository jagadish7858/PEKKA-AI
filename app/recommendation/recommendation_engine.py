from typing import Dict, List, Optional
from app.schemas.sensor import SensorReading, SensorType
from app.schemas.prediction import RiskLevel, FailurePrediction
from app.schemas.recommendation import RecommendationResponse
from app.schemas.anomaly import AnomalyReport, AnomalySeverity


class RecommendationEngine:
    """
    Generates structured preventive maintenance recommendations for human grid operators.
    All outputs are advisory decision support and do NOT perform automated switching/breaker trips.
    """

    def generate_recommendations(
        self,
        equipment_id: str,
        risk_level: RiskLevel,
        anomaly_report: AnomalyReport,
        readings: List[SensorReading],
        prediction: Optional[FailurePrediction] = None,
    ) -> RecommendationResponse:
        recommendations: List[str] = []
        urgency = "MONITOR"
        operator_notes = "Normal operational parameters. Continue standard SCADA logging."

        latest_by_type: Dict[SensorType, SensorReading] = {r.sensorType: r for r in readings}

        temp = latest_by_type.get(SensorType.TEMPERATURE)
        oil_temp = latest_by_type.get(SensorType.OIL_TEMPERATURE)
        curr = latest_by_type.get(SensorType.CURRENT)
        volt = latest_by_type.get(SensorType.VOLTAGE)
        vib = latest_by_type.get(SensorType.VIBRATION)
        press = latest_by_type.get(SensorType.OIL_PRESSURE)

        has_high_temp = (temp and temp.value > 85.0) or (oil_temp and oil_temp.value > 80.0)
        has_crit_temp = (temp and temp.value > 100.0) or (oil_temp and oil_temp.value > 95.0)
        has_high_curr = curr and curr.value > 75.0
        has_high_vib = vib and vib.value >= 4.5
        has_crit_vib = vib and vib.value >= 8.0
        has_volt_sag = volt and (volt.value < 360.0 or volt.value > 440.0)
        has_press_abnormal = press and (press.value < 15.0 or press.value > 40.0)

        # Compound: High current + high temperature
        if has_high_curr and (has_high_temp or has_crit_temp):
            recommendations.append("Reduce transformer feeder load immediately via load shedding or network transfer.")
            recommendations.append("Inspect transformer cooling system fans, radiator fin obstructions, and pumps.")
            urgency = "IMMEDIATE_ACTION"
            operator_notes = "CAUTION: Thermal-electrical overload detected. Monitor winding hot-spot temperature continuously."

        # Thermal only
        elif has_crit_temp:
            recommendations.append("Inspect transformer cooling system and radiator valves.")
            recommendations.append("Verify oil circulation pump flow rate.")
            recommendations.append("Prepare auxiliary cooling bank.")
            urgency = "IMMEDIATE_ACTION"
            operator_notes = "Critical thermal threshold reached. Inspect cooling fans and oil level indicator."
        elif has_high_temp:
            recommendations.append("Inspect transformer cooling system and check ambient substation temperature.")
            recommendations.append("Check transformer load history for peak demand periods.")
            if urgency != "IMMEDIATE_ACTION":
                urgency = "SCHEDULE_INSPECTION"

        # Vibration
        if has_crit_vib:
            recommendations.append("Inspect core clamping bolts, internal windings, and foundation mounting for severe looseness.")
            recommendations.append("Perform acoustic and spectral vibration analysis.")
            urgency = "IMMEDIATE_ACTION"
        elif has_high_vib:
            recommendations.append("Inspect bearings, pump motors, and mechanical clamping components.")
            if urgency == "MONITOR":
                urgency = "SCHEDULE_INSPECTION"

        # Low/abnormal voltage + abnormal current
        if has_volt_sag and has_high_curr:
            recommendations.append("Inspect electrical connections, busbar contacts, and tap-changer mechanism.")
            recommendations.append("Evaluate grid power factor and downstream short-circuit / unbalance conditions.")
            if urgency == "MONITOR":
                urgency = "SCHEDULE_INSPECTION"
        elif has_volt_sag:
            recommendations.append("Check on-load tap changer (OLTC) position and secondary substation feeder balance.")

        # Oil pressure / dielectric
        if has_press_abnormal:
            recommendations.append("Inspect transformer conservator tank pressure relief device and Buchholz relay gas accumulation.")
            recommendations.append("Collect oil sample for Dissolved Gas Analysis (DGA) and dielectric breakdown testing.")
            urgency = "IMMEDIATE_ACTION"

        # Integrate ML Failure Model Insights
        if prediction and prediction.predictedFailureMode:
            mode = prediction.predictedFailureMode
            if mode == "THERMAL_OVERLOAD" and "Inspect transformer cooling system" not in "".join(recommendations):
                recommendations.append("Review transformer load distribution and prepare cooling bank inspection.")
            elif mode == "MECHANICAL_FAULT" and "Inspect bearings" not in "".join(recommendations):
                recommendations.append("Inspect mechanical foundation, core clamping, and pump bearings.")
            elif mode == "DIELECTRIC_FAULT" and "Dissolved Gas Analysis" not in "".join(recommendations):
                recommendations.append("Schedule oil sampling for Dissolved Gas Analysis (DGA) and moisture test.")
            elif mode == "CRITICAL_FAILURE" and urgency != "IMMEDIATE_ACTION":
                urgency = "IMMEDIATE_ACTION"
                recommendations.insert(0, "Initiate immediate on-site technical inspection.")

        # General risk-based fallback
        if not recommendations:
            if risk_level in (RiskLevel.CRITICAL, RiskLevel.HIGH):
                recommendations.append("Dispatch field technician for visual and thermographic inspection.")
                recommendations.append("Schedule preventive maintenance window within 24 hours.")
                urgency = "SCHEDULE_INSPECTION"
            elif risk_level == RiskLevel.MEDIUM:
                recommendations.append("Increase telemetry sampling rate and monitor temperature/vibration trends.")
                urgency = "MONITOR"
            else:
                recommendations.append("Operating within normal tolerances. Maintain standard inspection schedule.")
                urgency = "MONITOR"
        else:
            if risk_level in (RiskLevel.CRITICAL, RiskLevel.HIGH) and "Schedule preventive maintenance" not in "".join(recommendations):
                recommendations.append("Schedule preventive maintenance inspection.")

        # Combine ML evidence into notes
        if anomaly_report.ml_anomaly_detected:
            operator_notes += f" [ML Insight: {anomaly_report.explanation}]"
        if prediction and prediction.failure_probability and prediction.failure_probability > 0.40:
            operator_notes += f" [ML Risk: {prediction.failure_probability*100:.1f}% failure probability]."

        operator_notes += " Decision Support Notice: Recommendations are advisory; human operator approval required."

        return RecommendationResponse(
            equipmentId=equipment_id,
            riskLevel=risk_level,
            recommendations=list(dict.fromkeys(recommendations)),
            urgency=urgency,
            operatorNotes=operator_notes,
        )


# Singleton recommendation engine instance
recommendation_engine = RecommendationEngine()
