package com.critical.infra.simulator.service;

import com.critical.infra.simulator.engine.SimulationEngine;
import com.critical.infra.simulator.model.SensorType;
import com.critical.infra.simulator.model.SimulationMode;
import com.critical.infra.simulator.model.dto.SimulationStatusResponse;
import org.springframework.stereotype.Service;

@Service
public class SimulationService {

    private final SimulationEngine simulationEngine;

    public SimulationService(SimulationEngine simulationEngine) {
        this.simulationEngine = simulationEngine;
    }

    public SimulationStatusResponse getStatus() {
        return simulationEngine.getStatus();
    }

    public void setGlobalMode(SimulationMode mode) {
        simulationEngine.setGlobalMode(mode);
    }

    public void setEquipmentMode(String equipmentId, SimulationMode mode) {
        simulationEngine.setEquipmentMode(equipmentId, mode);
    }

    public void setInterval(long intervalMs) {
        simulationEngine.updateInterval(intervalMs);
    }

    public void start() {
        simulationEngine.start();
    }

    public void stop() {
        simulationEngine.stop();
    }

    public void reset() {
        simulationEngine.resetAll();
    }

    public void injectAnomaly(String equipmentId, SensorType sensorType, double delta, int durationTicks) {
        simulationEngine.injectAnomaly(equipmentId, sensorType, delta, durationTicks);
    }

    public void triggerManualTick() {
        simulationEngine.tick();
    }
}
