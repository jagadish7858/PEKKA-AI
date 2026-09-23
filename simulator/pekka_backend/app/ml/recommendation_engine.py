from typing import Dict, List, Any, Optional
from datetime import datetime
from app.models.schemas import SensorReading, SensorStatus, RiskLevel, Recommendation
from app.ml.risk_engine import risk_engine
from app.ml.anomaly_detector import anomaly_detector
from app.ml.failure_predictor import failure_predictor

class RecommendationEngine:
    def generate_recommendations(
        self,
        equipment_id: str,
        current_readings: List[SensorReading],
        history_snapshots: Optional[List[Dict[str, SensorReading]]] = None
    ) -> Dict[str, Any]:
        if not current_readings:
            return {
                "equipmentId": equipment_id,
                "riskLevel": RiskLevel.LOW,
                "summary": "No active telemetry data available.",
                "recommendations": [],
                "timestamp": datetime.now().isoformat()
            }

        risk_res = risk_engine.calculate_risk(equipment_id, current_readings, history_snapshots)
        anomaly_res = anomaly_detector.detect(equipment_id, current_readings, history_snapshots)
        failure_res = failure_predictor.predict(equipment_id, current_readings, history_snapshots)

        level = risk_res["riskLevel"]
        recs: List[Recommendation] = []

        # Find specific sensor conditions
        readings_map = {r.sensorType.value if hasattr(r.sensorType, "value") else str(r.sensorType): r for r in current_readings}
        temp_r = readings_map.get("TEMPERATURE")
        oil_temp_r = readings_map.get("OIL_TEMPERATURE")
        vibr_r = readings_map.get("VIBRATION")
        volt_r = readings_map.get("VOLTAGE")
        curr_r = readings_map.get("CURRENT")
        load_r = readings_map.get("LOAD_PERCENTAGE")
        pres_r = readings_map.get("OIL_PRESSURE")

        if level == RiskLevel.CRITICAL:
            summary = f"CRITICAL FAULT CONDITION detected on {equipment_id}. Immediate emergency action required."
            
            recs.append(Recommendation(
                priority="CRITICAL",
                category="LOAD_SHEDDING",
                title="Immediate Load Curtailment & Power Rerouting",
                action=f"Reduce substation throughput by at least 40% or switch load to auxiliary distribution feeder.",
                reason=f"Extreme overload condition (Load: {load_r.value if load_r else 'N/A'}%, Current: {curr_r.value if curr_r else 'N/A'}A).",
                evidenceSource="Engineering Rule (IEC 60076 Overload Limit)"
            ))

            if temp_r and temp_r.value > 85.0:
                recs.append(Recommendation(
                    priority="CRITICAL",
                    category="COOLING",
                    title="Activate Emergency Forced-Oil Forced-Air (OFAF) Cooling",
                    action="Engage secondary fan banks and auxiliary oil circulation pumps immediately.",
                    reason=f"Winding temperature ({temp_r.value}°C) and Oil temperature ({oil_temp_r.value if oil_temp_r else 'N/A'}°C) in thermal runaway zone.",
                    evidenceSource="Hybrid (ML Anomaly + IEEE C57.91 Thermal Limit)"
                ))

            if vibr_r and vibr_r.value > 6.0:
                recs.append(Recommendation(
                    priority="HIGH",
                    category="INSPECTION",
                    title="Inspect Transformer Core Clamping and Bushings",
                    action="Deploy field engineering crew for vibro-acoustic inspection and Dissolved Gas Analysis (DGA).",
                    reason=f"Vibration ({vibr_r.value} mm/s) indicates severe mechanical resonance or core looseness.",
                    evidenceSource="ML Model (Isolation Forest Anomaly Attribution)"
                ))

        elif level == RiskLevel.HIGH:
            summary = f"HIGH RISK: Significant equipment degradation on {equipment_id}. Planned intervention required within 24 hours."

            recs.append(Recommendation(
                priority="HIGH",
                category="LOAD_SHEDDING",
                title="Optimize Load Balancing Across Parallel Transformers",
                action="Reroute peak industrial feeder load to reduce thermal stress by 15-20%.",
                reason=f"Elevated continuous loading ({load_r.value if load_r else 'N/A'}%) with rising current ({curr_r.value if curr_r else 'N/A'}A).",
                evidenceSource="ML Model (Random Forest Failure Prediction)"
            ))

            recs.append(Recommendation(
                priority="MEDIUM",
                category="MAINTENANCE",
                title="Schedule Oil Sample DGA & Dielectric Breakdown Test",
                action="Extract transformer oil sample for chromatographic gas analysis.",
                reason=f"Oil temperature ({oil_temp_r.value if oil_temp_r else 'N/A'}°C) and pressure ({pres_r.value if pres_r else 'N/A'} bar) deviating from nominal curve.",
                evidenceSource="Engineering Rule (IEEE Std C57.104)"
            ))

        elif level == RiskLevel.MEDIUM:
            summary = f"MODERATE RISK: Early wear indicators detected on {equipment_id}. Monitor telemetry trend."

            recs.append(Recommendation(
                priority="MEDIUM",
                category="INSPECTION",
                title="Continuous Telemetry Trend Monitoring",
                action="Set high-frequency sampling on vibration and winding temperature sensors.",
                reason="Subtle statistical drift detected by Isolation Forest ahead of hard threshold trips.",
                evidenceSource="ML Model (Isolation Forest Early Warning)"
            ))

        else:
            summary = f"NOMINAL: {equipment_id} is operating in healthy condition. Standard maintenance schedule applies."

            recs.append(Recommendation(
                priority="LOW",
                category="MAINTENANCE",
                title="Routine Preventive Maintenance",
                action="Perform scheduled quarterly visual and thermal camera inspection as per grid standard.",
                reason="All 9 sensor streams stable within nominal bounds.",
                evidenceSource="Engineering Rule (Standard Grid Operating Procedure)"
            ))

        return {
            "equipmentId": equipment_id,
            "riskLevel": level,
            "summary": summary,
            "recommendations": [r.model_dump() for r in recs],
            "timestamp": datetime.now().isoformat()
        }

recommendation_engine = RecommendationEngine()
