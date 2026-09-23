from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    # Memory storage bounds
    MAX_HISTORY_PER_SENSOR: int = 1000

    # CORS Allowed origins
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"

    # Java Sensor Simulator connection
    SENSOR_SIMULATOR_URL: str = "http://localhost:8081"
    SENSOR_SIMULATOR_WS_URL: str = "ws://localhost:8081/ws/sensors"
    SENSOR_SIMULATOR_TIMEOUT_SECONDS: float = 5.0

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
