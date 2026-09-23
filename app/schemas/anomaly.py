from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.sensor import SensorReading


class AnomalySeverity(str, Enum):
    NORMAL = "NORMAL"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class AnomalyDetail(BaseModel):
    sensorId: str
    sensorType: str
    value: float
    unit: str
    thresholdBreached: str
    detail: str


class AnomalyDetectBatchRequest(BaseModel):
    equipmentId: Optional[str] = Field(default=None, description="Optional equipment identifier override")
    readings: List[SensorReading] = Field(..., min_length=1, description="List of sensor readings to evaluate")

    model_config = {
        "json_schema_extra": {
            "example": {
                "equipmentId": "TRANSFORMER-01",
                "readings": [
                    {
                        "sensorId": "TEMP-T01",
                        "equipmentId": "TRANSFORMER-01",
                        "sensorType": "TEMPERATURE",
                        "value": 72.4,
                        "unit": "°C",
                        "timestamp": "2026-09-23T10:30:00Z",
                        "status": "NORMAL",
                    }
                ]
            }
        }
    }


class AnomalyReport(BaseModel):
    equipmentId: str = Field(..., description="ID of equipment analyzed")
    anomalyDetected: bool = Field(..., description="Whether any sensor anomaly was detected")
    severity: AnomalySeverity = Field(..., description="Highest severity level observed")
    affectedSensors: List[str] = Field(default_factory=list, description="List of sensor IDs showing anomalies")
    details: List[AnomalyDetail] = Field(default_factory=list, description="Breakdown of detected anomalies per sensor")
    method: str = Field(default="baseline_threshold_v1", description="Detection method used (baseline rule vs ML model)")

    # ML Anomaly Detection fields
    anomalyScore: Optional[float] = Field(default=None, description="Normalized ML anomaly score (0.0 normal to 1.0 critical)")
    ml_anomaly_detected: Optional[bool] = Field(default=None, description="Whether ML Isolation Forest detected an anomaly")
    model: Optional[str] = Field(default=None, description="Model identifier e.g. IsolationForest")
    explanation: Optional[str] = Field(default=None, description="Human-interpretable explanation of the anomaly")

    model_config = {
        "json_schema_extra": {
            "example": {
                "equipmentId": "TRANSFORMER-01",
                "anomalyDetected": True,
                "severity": "WARNING",
                "affectedSensors": ["TEMP-T01", "VIB-T01"],
                "details": [
                    {
                        "sensorId": "TEMP-T01",
                        "sensorType": "TEMPERATURE",
                        "value": 91.5,
                        "unit": "°C",
                        "thresholdBreached": "TEMP > 85.0 °C",
                        "detail": "Warning: Temperature exceeded normal operating band",
                    }
                ],
                "method": "hybrid_isolation_forest_v1",
                "anomalyScore": 0.84,
                "ml_anomaly_detected": True,
                "model": "IsolationForest",
                "explanation": "Isolation Forest detected abnormal multi-sensor correlation: elevated winding temperature combined with rising mechanical vibration.",
            }
        }
    }
