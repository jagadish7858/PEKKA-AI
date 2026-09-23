from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class SensorType(str, Enum):
    TEMPERATURE = "TEMPERATURE"
    VOLTAGE = "VOLTAGE"
    CURRENT = "CURRENT"
    VIBRATION = "VIBRATION"
    LOAD = "LOAD"
    POWER_FACTOR = "POWER_FACTOR"
    FREQUENCY = "FREQUENCY"
    OIL_TEMPERATURE = "OIL_TEMPERATURE"
    OIL_PRESSURE = "OIL_PRESSURE"


class SensorStatus(str, Enum):
    NORMAL = "NORMAL"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class SensorReading(BaseModel):
    sensorId: str = Field(..., min_length=1, description="Unique identifier of the sensor, e.g., TEMP-T01")
    equipmentId: str = Field(..., min_length=1, description="Identifier of the equipment, e.g., TRANSFORMER-01")
    sensorType: SensorType = Field(..., description="Type of measured metric")
    value: float = Field(..., description="Numeric sensor reading value")
    unit: str = Field(..., description="Unit of measurement, e.g., °C, V, A")
    timestamp: datetime = Field(..., description="Timestamp of reading in ISO-8601 format")
    status: SensorStatus = Field(..., description="Operational status flag associated with reading")

    @field_validator("sensorId", "equipmentId")
    @classmethod
    def check_non_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field must not be empty or whitespace")
        return v.strip()

    model_config = {
        "json_schema_extra": {
            "example": {
                "sensorId": "TEMP-T01",
                "equipmentId": "TRANSFORMER-01",
                "sensorType": "TEMPERATURE",
                "value": 72.4,
                "unit": "°C",
                "timestamp": "2026-09-23T10:30:00Z",
                "status": "NORMAL"
            }
        }
    }


class IngestionResponse(BaseModel):
    success: bool = Field(default=True, description="Indicates successful ingestion")
    message: str = Field(default="Sensor reading received", description="Status message")


class SensorReadingListResponse(BaseModel):
    success: bool = True
    count: int
    readings: List[SensorReading]


class LatestReadingsResponse(BaseModel):
    success: bool = True
    count: int
    readings: List[SensorReading]
