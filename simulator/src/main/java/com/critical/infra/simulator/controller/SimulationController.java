package com.critical.infra.simulator.controller;

import com.critical.infra.simulator.model.dto.AnomalyInjectionRequest;
import com.critical.infra.simulator.model.dto.IntervalUpdateRequest;
import com.critical.infra.simulator.model.dto.ModeUpdateRequest;
import com.critical.infra.simulator.model.dto.SimulationStatusResponse;
import com.critical.infra.simulator.service.SimulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/simulation")
public class SimulationController {

    private final SimulationService simulationService;

    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @GetMapping("/status")
    public ResponseEntity<SimulationStatusResponse> getStatus() {
        return ResponseEntity.ok(simulationService.getStatus());
    }

    @PostMapping("/mode")
    public ResponseEntity<SimulationStatusResponse> setGlobalMode(@RequestBody ModeUpdateRequest request) {
        if (request.mode() == null) {
            return ResponseEntity.badRequest().build();
        }
        simulationService.setGlobalMode(request.mode());
        return ResponseEntity.ok(simulationService.getStatus());
    }

    @PostMapping("/equipment/{equipmentId}/mode")
    public ResponseEntity<SimulationStatusResponse> setEquipmentMode(
            @PathVariable String equipmentId,
            @RequestBody ModeUpdateRequest request) {
        if (request.mode() == null) {
            return ResponseEntity.badRequest().build();
        }
        simulationService.setEquipmentMode(equipmentId, request.mode());
        return ResponseEntity.ok(simulationService.getStatus());
    }

    @PostMapping("/interval")
    public ResponseEntity<SimulationStatusResponse> setInterval(@RequestBody IntervalUpdateRequest request) {
        simulationService.setInterval(request.intervalMs());
        return ResponseEntity.ok(simulationService.getStatus());
    }

    @PostMapping("/start")
    public ResponseEntity<SimulationStatusResponse> startSimulation() {
        simulationService.start();
        return ResponseEntity.ok(simulationService.getStatus());
    }

    @PostMapping("/stop")
    public ResponseEntity<SimulationStatusResponse> stopSimulation() {
        simulationService.stop();
        return ResponseEntity.ok(simulationService.getStatus());
    }

    @PostMapping("/reset")
    public ResponseEntity<SimulationStatusResponse> resetSimulation() {
        simulationService.reset();
        return ResponseEntity.ok(simulationService.getStatus());
    }

    @PostMapping("/tick")
    public ResponseEntity<Map<String, String>> manualTick() {
        simulationService.triggerManualTick();
        return ResponseEntity.ok(Map.of("message", "Manual tick triggered successfully"));
    }

    @PostMapping("/inject-anomaly")
    public ResponseEntity<Map<String, String>> injectAnomaly(@RequestBody AnomalyInjectionRequest request) {
        if (request.equipmentId() == null || request.sensorType() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "equipmentId and sensorType are required"));
        }
        simulationService.injectAnomaly(
                request.equipmentId(),
                request.sensorType(),
                request.delta(),
                request.durationTicks()
        );
        return ResponseEntity.ok(Map.of(
                "message", String.format("Injected anomaly on %s [%s]: delta=%.1f for %d ticks",
                        request.equipmentId(), request.sensorType(), request.delta(), request.durationTicks())
        ));
    }
}
