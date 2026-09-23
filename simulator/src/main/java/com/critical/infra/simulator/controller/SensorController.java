package com.critical.infra.simulator.controller;

import com.critical.infra.simulator.model.EquipmentDefinition;
import com.critical.infra.simulator.model.SensorDefinition;
import com.critical.infra.simulator.service.TelemetryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class SensorController {

    private final TelemetryService telemetryService;

    public SensorController(TelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    @GetMapping("/sensors")
    public ResponseEntity<Collection<SensorDefinition>> getAllSensors() {
        return ResponseEntity.ok(telemetryService.getAllSensors());
    }

    @GetMapping("/sensors/{sensorId}")
    public ResponseEntity<SensorDefinition> getSensor(@PathVariable String sensorId) {
        return telemetryService.getSensor(sensorId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/equipment")
    public ResponseEntity<Collection<EquipmentDefinition>> getAllEquipment() {
        return ResponseEntity.ok(telemetryService.getAllEquipment());
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<EquipmentDefinition> getEquipment(@PathVariable String equipmentId) {
        return telemetryService.getEquipment(equipmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/equipment/{equipmentId}/sensors")
    public ResponseEntity<List<SensorDefinition>> getSensorsForEquipment(@PathVariable String equipmentId) {
        return ResponseEntity.ok(telemetryService.getSensorsForEquipment(equipmentId));
    }
}
