from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class SensorType(str, Enum):
    TEMPERATURE = "TEMPERATURE"
    VOLTAGE = "VOLTAGE"
    CURRENT = "CURRENT"
    VIBRATION = "VIBRATION"
    LOAD_PERCENTAGE = "LOAD_PERCENTAGE"
    POWER_FACTOR = "POWER_FACTOR"
    FREQUENCY = "FREQUENCY"
    OIL_TEMPERATURE = "OIL_TEMPERATURE"
    OIL_PRESSURE = "OIL_PRESSURE"

class SensorStatus(str, Enum):
    NORMAL = "NORMAL"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class SensorReading(BaseModel):
    sensorId: str = Field(..., description="Unique sensor identifier, e.g. TEMP-T01")
    equipmentId: str = Field(..., description="Target equipment identifier, e.g. TRANSFORMER-01")
    sensorType: SensorType = Field(..., description="Sensor physical metric type")
    value: float = Field(..., description="Numeric telemetry value")
    unit: str = Field(..., description="Physical unit of measurement")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat(), description="ISO-8601 timestamp")
    status: SensorStatus = Field(default=SensorStatus.NORMAL, description="Sensor operating threshold status")

class IngestionResponse(BaseModel):
    message: str
    storedCount: int
    equipmentId: str
    timestamp: str

class AnomalyDetectionRequest(BaseModel):
    equipmentId: str = Field(..., description="Equipment to evaluate")
    readings: Optional[List[SensorReading]] = Field(default=None, description="Optional batch of current readings to evaluate")

class AnomalyDetectionResponse(BaseModel):
    equipmentId: str
    anomalyDetected: bool
    mlAnomalyScore: float = Field(..., description="Isolation Forest anomaly score [0.0 = nominal, 1.0 = highly anomalous]")
    ruleAnomalyDetected: bool
    severity: str
    affectedSensors: List[str]
    featureContributions: Dict[str, float]
    explanation: str
    timestamp: str

class FailurePredictionResponse(BaseModel):
    equipmentId: str
    predictedState: str = Field(..., description="Predicted state: NORMAL, WARNING_DEGRADATION, CRITICAL_FAILURE")
    failureProbability: float = Field(..., description="Real ML Random Forest predicted failure probability [0.0 - 1.0]")
    estimatedTimeToFailureHours: Optional[float]
    topRiskDrivers: List[str]
    modelConfidence: float
    timestamp: str

class RiskAssessmentResponse(BaseModel):
    equipmentId: str
    riskScore: float = Field(..., description="Composite risk index [0.0 - 100.0]")
    riskLevel: RiskLevel
    mlRiskContribution: float
    safetyRulesRiskContribution: float
    operationalImpact: str
    timestamp: str

class Recommendation(BaseModel):
    priority: str = Field(..., description="CRITICAL, HIGH, MEDIUM, LOW")
    category: str = Field(..., description="MAINTENANCE, LOAD_SHEDDING, COOLING, INSPECTION")
    title: str
    action: str
    reason: str
    evidenceSource: str = Field(..., description="ML Model, Engineering Rule, or Hybrid")

class RecommendationsResponse(BaseModel):
    equipmentId: str
    riskLevel: RiskLevel
    summary: str
    recommendations: List[Recommendation]
    timestamp: str
