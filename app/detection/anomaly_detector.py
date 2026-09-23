from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Tuple
from app.schemas.sensor import SensorReading, SensorType, SensorStatus
from app.schemas.anomaly import AnomalyReport, AnomalySeverity, AnomalyDetail


# Engineering domain thresholds for transformer telemetry
DEFAULT_THRESHOLDS: Dict[SensorType, Dict[str, float]] = {
    SensorType.TEMPERATURE: {
        "warning_high": 85.0,
        "critical_high": 100.0,
    },
    SensorType.OIL_TEMPERATURE: {
        "warning_high": 80.0,
        "critical_high": 95.0,
    },
    SensorType.VIBRATION: {
        "warning_high": 4.5,
        "critical_high": 8.0,
    },
    SensorType.VOLTAGE: {
        "warning_low": 360.0,
        "warning_high": 440.0,
        "critical_low": 340.0,
        "critical_high": 460.0,
    },
    SensorType.CURRENT: {
        "warning_high": 75.0,
        "critical_high": 95.0,
    },
    SensorType.LOAD: {
        "warning_high": 90.0,
        "critical_high": 110.0,
    },
    SensorType.POWER_FACTOR: {
        "warning_low": 0.85,
        "critical_low": 0.70,
    },
    SensorType.FREQUENCY: {
        "warning_low": 49.5,
        "warning_high": 50.5,
        "critical_low": 48.5,
        "critical_high": 51.5,
    },
    SensorType.OIL_PRESSURE: {
        "warning_low": 15.0,
        "warning_high": 40.0,
        "critical_low": 10.0,
        "critical_high": 50.0,
    },
}


class BaseAnomalyDetector(ABC):
    """
    Abstract interface for anomaly detection.
    Allows transparent replacement of baseline threshold detector
    with trained ML models (e.g. Isolation Forest, One-Class SVM) in Phase 2.
    """

    @abstractmethod
    def detect(self, equipment_id: str, readings: List[SensorReading]) -> AnomalyReport:
        pass


class ThresholdAnomalyDetector(BaseAnomalyDetector):
    """
    Phase 1 Rule-Based Baseline Anomaly Detector.
    Evaluates readings against engineering thresholds and sensor operational status flags.
    NOTE: This is a transparent rule-based detector; actual ML will be introduced in Phase 2.
    """

    def __init__(self, thresholds: Optional[Dict[SensorType, Dict[str, float]]] = None):
        self.thresholds = thresholds or DEFAULT_THRESHOLDS

    def _check_reading(self, reading: SensorReading) -> Tuple[AnomalySeverity, Optional[str], Optional[str]]:
        """
        Evaluates a single reading against domain thresholds and status flag.
        Returns: (severity, threshold_breached, detail_msg)
        """
        # First priority: check if simulator explicitly flagged WARNING or CRITICAL
        sim_status = reading.status
        threshold_rules = self.thresholds.get(reading.sensorType, {})

        severity = AnomalySeverity.NORMAL
        breached = None
        detail = None

        val = reading.value

        # Check critical thresholds
        if "critical_high" in threshold_rules and val >= threshold_rules["critical_high"]:
            return (
                AnomalySeverity.CRITICAL,
                f"{reading.sensorType} >= {threshold_rules['critical_high']} {reading.unit}",
                f"Critical upper limit breach: {val} {reading.unit}",
            )
        if "critical_low" in threshold_rules and val <= threshold_rules["critical_low"]:
            return (
                AnomalySeverity.CRITICAL,
                f"{reading.sensorType} <= {threshold_rules['critical_low']} {reading.unit}",
                f"Critical lower limit breach: {val} {reading.unit}",
            )

        # Check warning thresholds
        if "warning_high" in threshold_rules and val >= threshold_rules["warning_high"]:
            return (
                AnomalySeverity.WARNING,
                f"{reading.sensorType} >= {threshold_rules['warning_high']} {reading.unit}",
                f"Warning high threshold exceeded: {val} {reading.unit}",
            )
        if "warning_low" in threshold_rules and val <= threshold_rules["warning_low"]:
            return (
                AnomalySeverity.WARNING,
                f"{reading.sensorType} <= {threshold_rules['warning_low']} {reading.unit}",
                f"Warning low threshold exceeded: {val} {reading.unit}",
            )

        # Simulator status fallback if threshold rules didn't trigger
        if sim_status == SensorStatus.CRITICAL:
            return (
                AnomalySeverity.CRITICAL,
                "SIMULATOR_FLAG_CRITICAL",
                f"Sensor reported CRITICAL status: {val} {reading.unit}",
            )
        elif sim_status == SensorStatus.WARNING:
            return (
                AnomalySeverity.WARNING,
                "SIMULATOR_FLAG_WARNING",
                f"Sensor reported WARNING status: {val} {reading.unit}",
            )

        return (AnomalySeverity.NORMAL, None, None)

    def detect(self, equipment_id: str, readings: List[SensorReading]) -> AnomalyReport:
        """
        Scans all recent readings for an equipment and generates a structured anomaly report.
        """
        affected_sensors = []
        details: List[AnomalyDetail] = []
        highest_severity = AnomalySeverity.NORMAL

        for reading in readings:
            severity, breached, msg = self._check_reading(reading)
            if severity != AnomalySeverity.NORMAL:
                affected_sensors.append(reading.sensorId)
                details.append(
                    AnomalyDetail(
                        sensorId=reading.sensorId,
                        sensorType=reading.sensorType.value,
                        value=reading.value,
                        unit=reading.unit,
                        thresholdBreached=breached or "UNKNOWN",
                        detail=msg or "Out of nominal limits",
                    )
                )
                if severity == AnomalySeverity.CRITICAL:
                    highest_severity = AnomalySeverity.CRITICAL
                elif severity == AnomalySeverity.WARNING and highest_severity != AnomalySeverity.CRITICAL:
                    highest_severity = AnomalySeverity.WARNING

        has_anomaly = len(affected_sensors) > 0

        return AnomalyReport(
            equipmentId=equipment_id,
            anomalyDetected=has_anomaly,
            severity=highest_severity,
            affectedSensors=list(set(affected_sensors)),
            details=details,
            method="baseline_threshold_v1",
        )


class HybridAnomalyDetector(BaseAnomalyDetector):
    """
    Production Hybrid Anomaly Detector:
    Combines deterministic engineering threshold checks (safety baseline)
    with unsupervised scikit-learn Isolation Forest (multivariate ML).
    """

    def __init__(
        self,
        threshold_detector: Optional[ThresholdAnomalyDetector] = None,
    ):
        self.threshold_detector = threshold_detector or ThresholdAnomalyDetector()

    def detect(self, equipment_id: str, readings: List[SensorReading]) -> AnomalyReport:
        # 1. Run deterministic safety checks
        rule_report = self.threshold_detector.detect(equipment_id, readings)

        # 2. Run unsupervised ML Isolation Forest
        from app.detection.ml_anomaly_detector import ml_anomaly_detector
        ml_res = ml_anomaly_detector.detect(equipment_id, readings)

        # 3. Synthesize Hybrid Findings
        ml_detected = ml_res.get("anomalyDetected", False)
        ml_score = ml_res.get("anomalyScore", 0.0)
        ml_severity_str = ml_res.get("severity", "NORMAL")

        # Composite anomaly detection flag
        composite_detected = rule_report.anomalyDetected or ml_detected

        # Severity resolution: Safety rules always take precedence for CRITICAL
        composite_severity = rule_report.severity
        if rule_report.severity != AnomalySeverity.CRITICAL:
            if ml_severity_str == "CRITICAL":
                composite_severity = AnomalySeverity.CRITICAL
            elif ml_severity_str in ("HIGH", "WARNING") and composite_severity == AnomalySeverity.NORMAL:
                composite_severity = AnomalySeverity.WARNING

        # Merge affected sensors
        combined_sensors = list(set(rule_report.affectedSensors + ml_res.get("affectedSensors", [])))

        # Combined details
        details = list(rule_report.details)
        if ml_detected and not rule_report.anomalyDetected:
            details.append(
                AnomalyDetail(
                    sensorId="MULTIVARIATE_ML",
                    sensorType="CORRELATION",
                    value=ml_score,
                    unit="score",
                    thresholdBreached="IsolationForest anomalyScore >= 0.52",
                    detail=ml_res.get("explanation", "Multivariate statistical anomaly detected."),
                )
            )

        # Unified explanation combining ML & rules
        if rule_report.anomalyDetected and ml_detected:
            explanation = (
                f"Dual Confirmation: Physical thresholds breached ({len(rule_report.affectedSensors)} sensors) "
                f"and {ml_res.get('explanation')}"
            )
        elif rule_report.anomalyDetected:
            explanation = (
                f"Physical threshold limits breached for {', '.join(rule_report.affectedSensors)}. "
                f"ML status: {ml_res.get('status', 'OK')}."
            )
        elif ml_detected:
            explanation = ml_res.get("explanation", "Isolation Forest detected abnormal multi-sensor pattern.")
        else:
            explanation = "Operational telemetry within standard normal operating envelope."

        return AnomalyReport(
            equipmentId=equipment_id,
            anomalyDetected=composite_detected,
            severity=composite_severity,
            affectedSensors=combined_sensors,
            details=details,
            method="hybrid_rules_and_isolation_forest_v1",
            anomalyScore=ml_score,
            ml_anomaly_detected=ml_detected,
            model="IsolationForest",
            explanation=explanation,
        )


# Singleton detector instance: uses HybridAnomalyDetector by default
anomaly_detector = HybridAnomalyDetector()
