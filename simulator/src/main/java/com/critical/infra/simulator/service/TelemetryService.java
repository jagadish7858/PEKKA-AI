package com.critical.infra.simulator.service;

import com.critical.infra.simulator.model.EquipmentDefinition;
import com.critical.infra.simulator.model.EquipmentTelemetry;
import com.critical.infra.simulator.model.SensorDefinition;
import com.critical.infra.simulator.model.SensorReading;
import com.critical.infra.simulator.repository.InMemoryTelemetryRepository;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Service
public class TelemetryService {

    private final InMemoryTelemetryRepository repository;

    public TelemetryService(InMemoryTelemetryRepository repository) {
        this.repository = repository;
    }

    public Collection<EquipmentDefinition> getAllEquipment() {
        return repository.getAllEquipment();
    }

    public Optional<EquipmentDefinition> getEquipment(String equipmentId) {
        return repository.getEquipment(equipmentId);
    }

    public Collection<SensorDefinition> getAllSensors() {
        return repository.getAllSensors();
    }

    public Optional<SensorDefinition> getSensor(String sensorId) {
        return repository.getSensor(sensorId);
    }

    public List<SensorDefinition> getSensorsForEquipment(String equipmentId) {
        return repository.getSensorsForEquipment(equipmentId);
    }

    public Collection<SensorReading> getAllLatestReadings() {
        return repository.getAllLatestReadings();
    }

    public Optional<SensorReading> getLatestReading(String sensorId) {
        return repository.getLatestReading(sensorId);
    }

    public List<SensorReading> getLatestReadingsForEquipment(String equipmentId) {
        return repository.getLatestReadingsForEquipment(equipmentId);
    }

    public Optional<EquipmentTelemetry> getLatestEquipmentTelemetry(String equipmentId) {
        List<EquipmentTelemetry> history = repository.getEquipmentHistory(equipmentId, 1);
        return history.isEmpty() ? Optional.empty() : Optional.of(history.getFirst());
    }

    public List<SensorReading> getSensorHistory(String sensorId, int limit) {
        return repository.getSensorHistory(sensorId, limit);
    }

    public List<EquipmentTelemetry> getEquipmentHistory(String equipmentId, int limit) {
        return repository.getEquipmentHistory(equipmentId, limit);
    }
}
