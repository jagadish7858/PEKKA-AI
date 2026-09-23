from collections import deque, defaultdict
import threading
from typing import List, Dict, Optional, Any
from app.models.schemas import SensorReading, SensorType

class TelemetryRepository:
    def __init__(self, max_history_per_sensor: int = 300, max_history_per_equipment: int = 300):
        self.max_history_per_sensor = max_history_per_sensor
        self.max_history_per_equipment = max_history_per_equipment
        
        self._lock = threading.RLock()
        
        # sensorId -> SensorReading
        self._latest_by_sensor: Dict[str, SensorReading] = {}
        
        # equipmentId -> { sensorType -> SensorReading }
        self._latest_by_equipment: Dict[str, Dict[str, SensorReading]] = defaultdict(dict)
        
        # sensorId -> deque[SensorReading]
        self._history_by_sensor: Dict[str, deque] = defaultdict(
            lambda: deque(maxlen=self.max_history_per_sensor)
        )
        
        # equipmentId -> deque[Dict[str, SensorReading]] (snapshots of all sensors at each tick)
        self._history_by_equipment: Dict[str, deque] = defaultdict(
            lambda: deque(maxlen=self.max_history_per_equipment)
        )

    def save_reading(self, reading: SensorReading) -> None:
        with self._lock:
            self._latest_by_sensor[reading.sensorId] = reading
            self._latest_by_equipment[reading.equipmentId][reading.sensorType.value] = reading
            self._history_by_sensor[reading.sensorId].append(reading)

    def save_readings(self, readings: List[SensorReading]) -> None:
        with self._lock:
            by_equipment: Dict[str, Dict[str, SensorReading]] = defaultdict(dict)
            for r in readings:
                self.save_reading(r)
                by_equipment[r.equipmentId][r.sensorType.value] = r
            
            for eq_id, eq_readings in by_equipment.items():
                self._history_by_equipment[eq_id].append(eq_readings)

    def get_latest_reading(self, sensor_id: str) -> Optional[SensorReading]:
        with self._lock:
            return self._latest_by_sensor.get(sensor_id)

    def get_all_latest_readings(self) -> List[SensorReading]:
        with self._lock:
            return list(self._latest_by_sensor.values())

    def get_equipment_latest_readings(self, equipment_id: str) -> List[SensorReading]:
        with self._lock:
            return list(self._latest_by_equipment.get(equipment_id, {}).values())

    def get_equipment_latest_dict(self, equipment_id: str) -> Dict[str, SensorReading]:
        with self._lock:
            return dict(self._latest_by_equipment.get(equipment_id, {}))

    def get_sensor_history(self, sensor_id: str, limit: int = 100) -> List[SensorReading]:
        with self._lock:
            history = self._history_by_sensor.get(sensor_id)
            if not history:
                return []
            items = list(history)
            return items[-limit:]

    def get_equipment_history(self, equipment_id: str, limit: int = 100) -> List[Dict[str, SensorReading]]:
        with self._lock:
            history = self._history_by_equipment.get(equipment_id)
            if not history:
                return []
            items = list(history)
            return items[-limit:]

    def get_all_equipment_ids(self) -> List[str]:
        with self._lock:
            return list(self._latest_by_equipment.keys())

# Global singleton repository
repository = TelemetryRepository()
