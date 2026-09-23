import threading
from collections import deque
from typing import Dict, List, Optional
from app.schemas.sensor import SensorReading
from app.config import settings


class InMemoryStore:
    """
    Thread-safe in-memory circular ring buffer for storing recent sensor telemetry.
    Bounded by MAX_HISTORY_PER_SENSOR to ensure predictable memory usage.
    """

    def __init__(self, max_history_per_sensor: int = settings.MAX_HISTORY_PER_SENSOR):
        self.max_history = max_history_per_sensor
        self._lock = threading.Lock()
        # sensorId -> deque of SensorReading
        self._sensor_history: Dict[str, deque] = {}
        # equipmentId -> deque of SensorReading
        self._equipment_history: Dict[str, deque] = {}
        # sensorId -> latest SensorReading
        self._latest_readings: Dict[str, SensorReading] = {}

    def add_reading(self, reading: SensorReading) -> None:
        """Stores a validated sensor reading in memory with thread safety."""
        with self._lock:
            # Update sensor history
            if reading.sensorId not in self._sensor_history:
                self._sensor_history[reading.sensorId] = deque(maxlen=self.max_history)
            self._sensor_history[reading.sensorId].append(reading)

            # Update equipment history
            if reading.equipmentId not in self._equipment_history:
                self._equipment_history[reading.equipmentId] = deque(maxlen=self.max_history * 5)
            self._equipment_history[reading.equipmentId].append(reading)

            # Update latest map
            self._latest_readings[reading.sensorId] = reading

    def get_latest_readings(self) -> List[SensorReading]:
        """Returns the most recent reading for each registered sensor."""
        with self._lock:
            return list(self._latest_readings.values())

    def get_sensor_history(self, sensor_id: str, limit: Optional[int] = None) -> List[SensorReading]:
        """Returns historical readings for a given sensor, newest first or chronological."""
        with self._lock:
            if sensor_id not in self._sensor_history:
                return []
            readings = list(self._sensor_history[sensor_id])
            if limit is not None and limit > 0:
                readings = readings[-limit:]
            return readings

    def get_equipment_readings(self, equipment_id: str, limit: Optional[int] = None) -> List[SensorReading]:
        """Returns historical readings for all sensors belonging to an equipment."""
        with self._lock:
            if equipment_id not in self._equipment_history:
                return []
            readings = list(self._equipment_history[equipment_id])
            if limit is not None and limit > 0:
                readings = readings[-limit:]
            return readings

    def get_equipment_latest(self, equipment_id: str) -> List[SensorReading]:
        """Returns latest reading for each sensor on a specific equipment."""
        with self._lock:
            return [
                r for r in self._latest_readings.values()
                if r.equipmentId == equipment_id
            ]

    def has_equipment(self, equipment_id: str) -> bool:
        """Checks if equipment has any registered readings."""
        with self._lock:
            return equipment_id in self._equipment_history

    def has_sensor(self, sensor_id: str) -> bool:
        """Checks if sensor has any registered readings."""
        with self._lock:
            return sensor_id in self._sensor_history

    def clear(self) -> None:
        """Clears all stored readings. Primarily used for unit testing isolation."""
        with self._lock:
            self._sensor_history.clear()
            self._equipment_history.clear()
            self._latest_readings.clear()


# Global in-memory storage singleton
store = InMemoryStore()


def get_store() -> InMemoryStore:
    return store
