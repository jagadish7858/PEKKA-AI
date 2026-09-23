from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class FailurePrediction(BaseModel):
    equipmentId: str = Field(..., description="ID of equipment analyzed")
    riskScore: float = Field(..., ge=0.0, le=100.0, description="Composite failure risk score (0-100)")
    riskLevel: RiskLevel = Field(..., description="Categorical risk classification")
    predictedFailureMode: str = Field(..., description="Suspected equipment failure mode")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence indicator of prediction")
    contributingFactors: List[str] = Field(default_factory=list, description="Key telemetry factors driving the risk")
    evaluationMethod: str = Field(default="hybrid_random_forest_v1", description="Prediction methodology: heuristic vs ML model")

    # ML Failure Model specific fields
    prediction: Optional[str] = Field(default=None, description="Model prediction category, e.g. HIGH_FAILURE_RISK")
    failure_probability: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="ML predicted probability of failure")
    risk_level: Optional[RiskLevel] = Field(default=None, description="Snake_case alias for riskLevel")
    ml_model: Optional[str] = Field(default=None, description="Supervised ML model identifier e.g. RandomForestClassifier")
    confidence_or_probability: Optional[float] = Field(default=None, description="Confidence or calibrated probability")
    supporting_features: List[str] = Field(default_factory=list, description="Top feature signals supporting prediction")
    explanation: Optional[str] = Field(default=None, description="Detailed ML explainability summary for operators")

    model_config = {
        "json_schema_extra": {
            "example": {
                "equipmentId": "TRANSFORMER-01",
                "riskScore": 78.5,
                "riskLevel": "HIGH",
                "risk_level": "HIGH",
                "predictedFailureMode": "THERMAL_OVERLOAD_RISK",
                "prediction": "HIGH_FAILURE_RISK",
                "failure_probability": 0.78,
                "confidence": 0.78,
                "confidence_or_probability": 0.78,
                "ml_model": "RandomForestClassifier",
                "supporting_features": [
                    "temperature: 92.4 °C (baseline delta: +37.4 °C)",
                    "current: 84.0 A (overload: 168%)",
                    "rate_of_change: +0.45 °C/s"
                ],
                "explanation": "Random Forest model predicted HIGH_FAILURE_RISK with 78% probability driven by sustained thermal overload and rapid temperature rise.",
                "contributingFactors": [
                    "Winding temperature elevated (92.4°C)",
                    "Current load exceeded 168% nominal"
                ],
                "evaluationMethod": "hybrid_random_forest_v1"
            }
        }
    }
