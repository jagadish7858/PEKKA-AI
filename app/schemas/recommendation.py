from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.prediction import RiskLevel


class RecommendationResponse(BaseModel):
    equipmentId: str = Field(..., description="ID of equipment")
    riskLevel: RiskLevel = Field(..., description="Current evaluated risk level")
    recommendations: List[str] = Field(..., description="List of prioritized preventive recommendations for human operators")
    urgency: str = Field(default="MONITOR", description="Operational urgency: MONITOR, SCHEDULE_INSPECTION, IMMEDIATE_ACTION")
    operatorNotes: Optional[str] = Field(default=None, description="Safety and diagnostic guidance for substation operators")

    model_config = {
        "json_schema_extra": {
            "example": {
                "equipmentId": "TRANSFORMER-01",
                "riskLevel": "HIGH",
                "recommendations": [
                    "Inspect transformer cooling system",
                    "Check transformer load",
                    "Schedule preventive maintenance"
                ],
                "urgency": "SCHEDULE_INSPECTION",
                "operatorNotes": "Operator advice: Do not initiate remote breaker trip unless temperature exceeds 105°C."
            }
        }
    }
