from pydantic import BaseModel, Field
from typing import Optional, Any

class ErrorResponse(BaseModel):
    success: bool = Field(default=False, description="Indicates request failure")
    error: str = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="Human-readable error description")
    details: Optional[Any] = Field(default=None, description="Detailed validation or contextual errors")
