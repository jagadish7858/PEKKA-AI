import time
import threading
import logging
import requests
from typing import List, Dict, Any, Optional
from app.config import settings
from app.models.schemas import SensorReading
from app.storage.repository import repository

logger = logging.getLogger("SimulatorClient")

class JavaSimulatorClient:
    def __init__(self, simulator_base_url: Optional[str] = None):
        self.base_url = (simulator_base_url or settings.SENSOR_SIMULATOR_URL).rstrip("/")
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self.poll_interval = 1.0  # seconds

    def is_simulator_healthy(self) -> bool:
        try:
            res = requests.get(f"{self.base_url}/api/v1/health", timeout=3)
            return res.status_code == 200 and res.json().get("status") == "UP"
        except Exception as e:
            logger.warning(f"Failed to reach Java simulator at {self.base_url}: {e}")
            return False

    def fetch_all_sensors(self) -> List[Dict[str, Any]]:
        res = requests.get(f"{self.base_url}/api/v1/sensors", timeout=3)
        res.raise_for_status()
        return res.json()

    def fetch_latest_readings(self, equipment_id: Optional[str] = None) -> List[SensorReading]:
        url = f"{self.base_url}/api/v1/readings/{equipment_id}" if equipment_id else f"{self.base_url}/api/v1/readings"
        res = requests.get(url, timeout=3)
        res.raise_for_status()
        data = res.json()

        readings = []
        for item in data:
            # Handle possible encoding anomalies in units (e.g. °C)
            unit_str = item.get("unit", "")
            if not unit_str or "C" in unit_str:
                unit_str = "°C" if item.get("sensorType") in ("TEMPERATURE", "OIL_TEMPERATURE") else unit_str

            readings.append(SensorReading(
                sensorId=item["sensorId"],
                equipmentId=item["equipmentId"],
                sensorType=item["sensorType"],
                value=float(item["value"]),
                unit=unit_str,
                timestamp=item.get("timestamp", ""),
                status=item.get("status", "NORMAL")
            ))
        return readings

    def set_simulator_mode(self, mode: str) -> Dict[str, Any]:
        """
        Switches the Java simulator's global mode (NORMAL, WARNING, CRITICAL).
        """
        res = requests.post(
            f"{self.base_url}/api/v1/simulation/mode",
            json={"mode": mode.upper()},
            timeout=3
        )
        res.raise_for_status()
        return res.json()

    def reset_simulator(self) -> Dict[str, Any]:
        """
        Resets the Java simulator to baseline state.
        """
        res = requests.post(f"{self.base_url}/api/v1/simulation/reset", timeout=3)
        res.raise_for_status()
        return res.json()

    def pull_and_ingest_once(self) -> int:
        """
        Pulls latest readings from Java simulator and ingests directly into local repository.
        """
        readings = self.fetch_latest_readings()
        if readings:
            repository.save_readings(readings)
            return len(readings)
        return 0

    def start_background_ingestion(self, poll_interval_sec: float = 1.0):
        if self._running:
            return
        self._running = True
        self.poll_interval = poll_interval_sec

        def _worker():
            logger.info(f"Started continuous telemetry ingestion from {self.base_url}")
            while self._running:
                try:
                    count = self.pull_and_ingest_once()
                    if count > 0:
                        logger.debug(f"Ingested {count} telemetry readings from simulator.")
                except Exception as e:
                    logger.warning(f"Error pulling telemetry from simulator: {e}")
                time.sleep(self.poll_interval)

        self._thread = threading.Thread(target=_worker, daemon=True, name="SimulatorIngestionThread")
        self._thread.start()

    def stop_background_ingestion(self):
        self._running = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2.0)
        logger.info("Stopped telemetry ingestion worker.")

simulator_client = JavaSimulatorClient()
