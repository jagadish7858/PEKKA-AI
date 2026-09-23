package com.critical.infra.simulator.repository;

import com.critical.infra.simulator.model.*;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Repository
public class InMemoryTelemetryRepository {

    private static final int DEFAULT_HISTORY_CAPACITY = 200;

    private final Map<String, EquipmentDefinition> equipmentMap = new LinkedHashMap<>();
    private final Map<String, SensorDefinition> sensorMap = new LinkedHashMap<>();

    private final Map<String, SensorReading> latestReadingsBySensor = new ConcurrentHashMap<>();
    private final Map<String, Map<String, SensorReading>> latestReadingsByEquipment = new ConcurrentHashMap<>();

    private final Map<String, Deque<SensorReading>> historyBySensor = new ConcurrentHashMap<>();
    private final Map<String, Deque<EquipmentTelemetry>> historyByEquipment = new ConcurrentHashMap<>();

    public InMemoryTelemetryRepository() {
        initializeDefaultEquipment();
    }

    private void initializeDefaultEquipment() {
        // Equipment 1: Primary Grid Substation Transformer
        registerEquipment(
                "TRANSFORMER-01",
                "Substation Alpha 400kV/33kV Power Transformer",
                "POWER_TRANSFORMER",
                "Sector 4 North Substation",
                "T01"
        );

        // Equipment 2: Secondary Industrial Distribution Transformer
        registerEquipment(
                "TRANSFORMER-02",
                "Distribution Beta 33kV/11kV Auxiliary Transformer",
                "POWER_TRANSFORMER",
                "Sector 7 Industrial Grid",
                "T02"
        );
    }

    private void registerEquipment(String eqId, String name, String type, String location, String prefix) {
        List<SensorDefinition> sensors = new ArrayList<>();
        sensors.add(SensorDefinition.of("TEMP-" + prefix, eqId, SensorType.TEMPERATURE));
        sensors.add(SensorDefinition.of("VOLT-" + prefix, eqId, SensorType.VOLTAGE));
        sensors.add(SensorDefinition.of("CURR-" + prefix, eqId, SensorType.CURRENT));
        sensors.add(SensorDefinition.of("VIBR-" + prefix, eqId, SensorType.VIBRATION));
        sensors.add(SensorDefinition.of("LOAD-" + prefix, eqId, SensorType.LOAD));
        sensors.add(SensorDefinition.of("PWRF-" + prefix, eqId, SensorType.POWER_FACTOR));
        sensors.add(SensorDefinition.of("FREQ-" + prefix, eqId, SensorType.FREQUENCY));
        sensors.add(SensorDefinition.of("OILTEMP-" + prefix, eqId, SensorType.OIL_TEMPERATURE));
        sensors.add(SensorDefinition.of("OILPRES-" + prefix, eqId, SensorType.OIL_PRESSURE));

        EquipmentDefinition eqDef = new EquipmentDefinition(eqId, name, type, location, List.copyOf(sensors));
        equipmentMap.put(eqId, eqDef);
        latestReadingsByEquipment.put(eqId, new ConcurrentHashMap<>());
        historyByEquipment.put(eqId, new ConcurrentLinkedDeque<>());

        for (SensorDefinition s : sensors) {
            sensorMap.put(s.sensorId(), s);
            historyBySensor.put(s.sensorId(), new ConcurrentLinkedDeque<>());
        }
    }

    public Collection<EquipmentDefinition> getAllEquipment() {
        return Collections.unmodifiableCollection(equipmentMap.values());
    }

    public Optional<EquipmentDefinition> getEquipment(String equipmentId) {
        return Optional.ofNullable(equipmentMap.get(equipmentId));
    }

    public Collection<SensorDefinition> getAllSensors() {
        return Collections.unmodifiableCollection(sensorMap.values());
    }

    public Optional<SensorDefinition> getSensor(String sensorId) {
        return Optional.ofNullable(sensorMap.get(sensorId));
    }

    public List<SensorDefinition> getSensorsForEquipment(String equipmentId) {
        EquipmentDefinition eq = equipmentMap.get(equipmentId);
        return eq != null ? eq.sensors() : List.of();
    }

    public void saveReading(SensorReading reading) {
        latestReadingsBySensor.put(reading.sensorId(), reading);

        Map<String, SensorReading> eqReadings = latestReadingsByEquipment.computeIfAbsent(
                reading.equipmentId(), k -> new ConcurrentHashMap<>());
        eqReadings.put(reading.sensorId(), reading);

        Deque<SensorReading> sensorHistory = historyBySensor.computeIfAbsent(
                reading.sensorId(), k -> new ConcurrentLinkedDeque<>());
        sensorHistory.addFirst(reading);
        while (sensorHistory.size() > DEFAULT_HISTORY_CAPACITY) {
            sensorHistory.pollLast();
        }
    }

    public void saveEquipmentTelemetry(EquipmentTelemetry telemetry) {
        Deque<EquipmentTelemetry> eqHistory = historyByEquipment.computeIfAbsent(
                telemetry.equipmentId(), k -> new ConcurrentLinkedDeque<>());
        eqHistory.addFirst(telemetry);
        while (eqHistory.size() > DEFAULT_HISTORY_CAPACITY) {
            eqHistory.pollLast();
        }
    }

    public Optional<SensorReading> getLatestReading(String sensorId) {
        return Optional.ofNullable(latestReadingsBySensor.get(sensorId));
    }

    public Collection<SensorReading> getAllLatestReadings() {
        return Collections.unmodifiableCollection(latestReadingsBySensor.values());
    }

    public List<SensorReading> getLatestReadingsForEquipment(String equipmentId) {
        Map<String, SensorReading> map = latestReadingsByEquipment.get(equipmentId);
        if (map == null) {
            return List.of();
        }
        return new ArrayList<>(map.values());
    }

    public List<SensorReading> getSensorHistory(String sensorId, int limit) {
        Deque<SensorReading> history = historyBySensor.get(sensorId);
        if (history == null) {
            return List.of();
        }
        return history.stream().limit(Math.max(1, limit)).toList();
    }

    public List<EquipmentTelemetry> getEquipmentHistory(String equipmentId, int limit) {
        Deque<EquipmentTelemetry> history = historyByEquipment.get(equipmentId);
        if (history == null) {
            return List.of();
        }
        return history.stream().limit(Math.max(1, limit)).toList();
    }

    public void clearHistory() {
        historyBySensor.values().forEach(Deque::clear);
        historyByEquipment.values().forEach(Deque::clear);
    }
}
