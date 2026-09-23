import os

class Settings:
    PROJECT_NAME: str = "PEKKA AI Critical Infrastructure Intelligence"
    API_V1_STR: str = "/api/v1"
    PORT: int = int(os.getenv("PORT", "8001"))
    HOST: str = os.getenv("HOST", "127.0.0.1")
    
    # Java Simulator Configuration
    SENSOR_SIMULATOR_URL: str = os.getenv("SENSOR_SIMULATOR_URL", "http://localhost:8081")
    SENSOR_SIMULATOR_WS_URL: str = os.getenv("SENSOR_SIMULATOR_WS_URL", "ws://localhost:8081/ws-raw")
    
    # ML Models directory
    MODELS_DIR: str = os.getenv(
        "MODELS_DIR",
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "saved_models")
    )
    
    # Storage settings
    MAX_HISTORY_PER_SENSOR: int = int(os.getenv("MAX_HISTORY_PER_SENSOR", "300"))
    MAX_HISTORY_PER_EQUIPMENT: int = int(os.getenv("MAX_HISTORY_PER_EQUIPMENT", "300"))

settings = Settings()
