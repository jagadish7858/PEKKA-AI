import logging
from typing import Dict, List, Optional
import httpx
from app.config import settings
from app.schemas.sensor import SensorReading
from app.storage.memory_store import InMemoryStore, get_store

logger = logging.getLogger(__name__)


class SensorSimulatorClient:
    """
    Client for connecting to the external Java Spring Boot Sensor Simulator.
    Configurable via environment variables (SENSOR_SIMULATOR_URL, SENSOR_SIMULATOR_WS_URL).
    Designed to fail gracefully if the simulator is offline without affecting AI Backend operation.
    """

    def __init__(
        self,
        base_url: str = settings.SENSOR_SIMULATOR_URL,
        ws_url: str = settings.SENSOR_SIMULATOR_WS_URL,
        timeout_seconds: float = settings.SENSOR_SIMULATOR_TIMEOUT_SECONDS,
    ):
        self.base_url = base_url.rstrip("/")
        self.ws_url = ws_url
        self.timeout = timeout_seconds

    async def check_simulator_health(self) -> Dict[str, str]:
        """
        Polls the Java Spring Boot actuator or simulator health endpoint.
        Returns connection status dictionary without raising unhandled errors.
        """
        target_url = f"{self.base_url}/actuator/health"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(target_url)
                if response.status_code == 200:
                    return {"status": "ONLINE", "url": target_url, "details": response.text}
                return {"status": "DEGRADED", "url": target_url, "statusCode": str(response.status_code)}
        except (httpx.ConnectError, httpx.ConnectTimeout) as e:
            logger.info("Java Sensor Simulator is currently unreachable at %s: %s", target_url, str(e))
            return {"status": "OFFLINE", "url": target_url, "reason": "Connection refused / simulator not running"}
        except Exception as e:
            logger.warning("Error checking simulator health: %s", str(e))
            return {"status": "ERROR", "url": target_url, "reason": str(e)}

    async def fetch_and_ingest(self, target_endpoint: str = "/api/simulator/readings") -> int:
        """
        Fetches pending sensor readings from the Java simulator and ingests them into the local store.
        Returns count of successfully ingested readings.
        """
        url = f"{self.base_url}{target_endpoint}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    items = data if isinstance(data, list) else data.get("readings", [])
                    store = get_store()
                    ingested_count = 0
                    for item in items:
                        try:
                            reading = SensorReading(**item)
                            store.add_reading(reading)
                            ingested_count += 1
                        except Exception as parse_err:
                            logger.error("Skipping invalid reading from simulator: %s", parse_err)
                    return ingested_count
        except Exception as e:
            logger.info("Unable to pull telemetry from simulator at %s: %s", url, str(e))
        return 0


# Singleton simulator client
sensor_client = SensorSimulatorClient()
