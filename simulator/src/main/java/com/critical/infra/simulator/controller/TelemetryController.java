package com.critical.infra.simulator.controller;

import com.critical.infra.simulator.model.EquipmentTelemetry;
import com.critical.infra.simulator.model.SensorReading;
import com.critical.infra.simulator.service.TelemetryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.List;

@RestController
@RequestMapping("/api/v1/readings")
public class TelemetryController {

    private final TelemetryService telemetryService;

    public TelemetryController(TelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    /**
     * Get latest readings for all sensors across all equipment.
     */
    @GetMapping
    public ResponseEntity<Collection<SensorReading>> getAllLatestReadings() {
        return ResponseEntity.ok(telemetryService.getAllLatestReadings());
    }

    /**
     * Get latest readings for a specific equipment (e.g. TRANSFORMER-01).
     */
    @GetMapping("/{equipmentId}")
    public ResponseEntity<List<SensorReading>> getLatestReadingsForEquipment(
            @PathVariable String equipmentId) {
        List<SensorReading> readings = telemetryService.getLatestReadingsForEquipment(equipmentId);
        if (readings.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(readings);
    }

    /**
     * Get latest consolidated snapshot for a specific equipment.
     */
    @GetMapping("/{equipmentId}/snapshot")
    public ResponseEntity<EquipmentTelemetry> getEquipmentSnapshot(
            @PathVariable String equipmentId) {
        return telemetryService.getLatestEquipmentTelemetry(equipmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get latest reading for a specific sensor ID (e.g. TEMP-T01).
     */
    @GetMapping("/sensor/{sensorId}")
    public ResponseEntity<SensorReading> getLatestReadingForSensor(
            @PathVariable String sensorId) {
        return telemetryService.getLatestReading(sensorId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get recent time-series telemetry snapshots for an equipment.
     */
    @GetMapping("/{equipmentId}/history")
    public ResponseEntity<List<EquipmentTelemetry>> getEquipmentHistory(
            @PathVariable String equipmentId,
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(telemetryService.getEquipmentHistory(equipmentId, limit));
    }

    /**
     * Get recent time-series readings for a specific sensor.
     */
    @GetMapping("/sensor/{sensorId}/history")
    public ResponseEntity<List<SensorReading>> getSensorHistory(
            @PathVariable String sensorId,
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(telemetryService.getSensorHistory(sensorId, limit));
    }
}
