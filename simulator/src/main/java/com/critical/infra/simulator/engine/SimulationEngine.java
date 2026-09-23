package com.critical.infra.simulator.engine;

import com.critical.infra.simulator.config.SimulationProperties;
import com.critical.infra.simulator.model.*;
import com.critical.infra.simulator.model.dto.SimulationStatusResponse;
import com.critical.infra.simulator.repository.InMemoryTelemetryRepository;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class SimulationEngine {

    private static final Logger log = LoggerFactory.getLogger(SimulationEngine.class);

    private final SimulationProperties properties;
    private final InMemoryTelemetryRepository repository;
    private final SimpMessagingTemplate messagingTemplate;
    private final com.critical.infra.simulator.service.PekkaTelemetryDispatcher telemetryDispatcher;

    private final Map<String, EquipmentSimulationState> equipmentStates = new ConcurrentHashMap<>();
    private final Map<String, SimulationMode> equipmentModeOverrides = new ConcurrentHashMap<>();

    private volatile SimulationMode globalMode;
    private volatile long currentIntervalMs;
    private final AtomicBoolean isRunning = new AtomicBoolean(false);
    private final AtomicLong tickCount = new AtomicLong(0);

    private ScheduledExecutorService executorService;
    private ScheduledFuture<?> scheduledTask;

    public SimulationEngine(SimulationProperties properties,
                            InMemoryTelemetryRepository repository,
                            SimpMessagingTemplate messagingTemplate,
                            com.critical.infra.simulator.service.PekkaTelemetryDispatcher telemetryDispatcher) {
        this.properties = properties;
        this.repository = repository;
        this.messagingTemplate = messagingTemplate;
        this.telemetryDispatcher = telemetryDispatcher;
        this.globalMode = properties.getDefaultMode() != null ? properties.getDefaultMode() : SimulationMode.NORMAL;
        this.currentIntervalMs = properties.getInterval();
    }

    @PostConstruct
    public synchronized void init() {
        // Register simulated equipment states
        equipmentStates.put("TRANSFORMER-01", new EquipmentSimulationState(
                "TRANSFORMER-01",
                "Substation Alpha 400kV/33kV Power Transformer",
                "POWER_TRANSFORMER",
                "T01",
                globalMode
        ));

        equipmentStates.put("TRANSFORMER-02", new EquipmentSimulationState(
                "TRANSFORMER-02",
                "Distribution Beta 33kV/11kV Auxiliary Transformer",
                "POWER_TRANSFORMER",
                "T02",
                globalMode
        ));

        log.info("Initialized SimulationEngine with {} equipment units. Default Mode: {}, Interval: {}ms",
                equipmentStates.size(), globalMode, currentIntervalMs);

        // Perform initial baseline tick so data is immediately available
        tick();

        if (properties.isEnabled()) {
            start();
        }
    }

    public synchronized void start() {
        if (isRunning.get()) {
            return;
        }

        executorService = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "simulation-engine-thread");
            t.setDaemon(true);
            return t;
        });

        scheduledTask = executorService.scheduleAtFixedRate(
                this::safeTick,
                currentIntervalMs,
                currentIntervalMs,
                TimeUnit.MILLISECONDS
        );

        isRunning.set(true);
        log.info("Simulation engine started at interval {}ms", currentIntervalMs);
        broadcastStatus();
    }

    public synchronized void stop() {
        if (!isRunning.get()) {
            return;
        }
        isRunning.set(false);
        if (scheduledTask != null) {
            scheduledTask.cancel(false);
        }
        if (executorService != null) {
            executorService.shutdown();
        }
        log.info("Simulation engine paused/stopped.");
        broadcastStatus();
    }

    public synchronized void updateInterval(long newIntervalMs) {
        if (newIntervalMs < 50) {
            throw new IllegalArgumentException("Simulation interval must be at least 50 ms");
        }
        this.currentIntervalMs = newIntervalMs;
        log.info("Simulation interval updated to {}ms", newIntervalMs);

        if (isRunning.get()) {
            // Reschedule
            if (scheduledTask != null) {
                scheduledTask.cancel(false);
            }
            scheduledTask = executorService.scheduleAtFixedRate(
                    this::safeTick,
                    newIntervalMs,
                    newIntervalMs,
                    TimeUnit.MILLISECONDS
            );
        }
        broadcastStatus();
    }

    public synchronized void setGlobalMode(SimulationMode mode) {
        this.globalMode = mode;
        // Also clear any per-equipment overrides when global mode is explicitly set
        equipmentModeOverrides.clear();
        for (EquipmentSimulationState state : equipmentStates.values()) {
            state.setCurrentMode(mode);
        }
        log.info("Global simulation mode set to: {}", mode);
        broadcastStatus();
    }

    public synchronized void setEquipmentMode(String equipmentId, SimulationMode mode) {
        EquipmentSimulationState state = equipmentStates.get(equipmentId);
        if (state == null) {
            throw new NoSuchElementException("Equipment not found: " + equipmentId);
        }
        equipmentModeOverrides.put(equipmentId, mode);
        state.setCurrentMode(mode);
        log.info("Equipment {} simulation mode set to: {}", equipmentId, mode);
        broadcastStatus();
    }

    public synchronized void resetAll() {
        equipmentModeOverrides.clear();
        this.globalMode = SimulationMode.NORMAL;
        for (EquipmentSimulationState state : equipmentStates.values()) {
            state.resetToNormalBaseline();
            state.setCurrentMode(SimulationMode.NORMAL);
        }
        tickCount.set(0);
        repository.clearHistory();
        // Perform a fresh baseline tick
        tick();
        log.info("Simulation engine state reset to normal baseline.");
        broadcastStatus();
    }

    public void injectAnomaly(String equipmentId, SensorType sensorType, double delta, int durationTicks) {
        EquipmentSimulationState state = equipmentStates.get(equipmentId);
        if (state == null) {
            throw new NoSuchElementException("Equipment not found: " + equipmentId);
        }
        state.injectAnomaly(sensorType, delta, durationTicks);
        log.info("Injected anomaly on {} sensor {}: delta={}, durationTicks={}",
                equipmentId, sensorType, delta, durationTicks);
    }

    private void safeTick() {
        try {
            tick();
        } catch (Exception e) {
            log.error("Error executing simulation tick", e);
        }
    }

    /**
     * Executes one simulation cycle:
     * 1. Updates sensor values
     * 2. Applies selected simulation mode
     * 3. Generates timestamp
     * 4. Calculates sensor status
     * 5. Stores latest reading in memory
     * 6. Makes data available through the API (via repository)
     * 7. Broadcasts readings through WebSocket
     */
    public void tick() {
        long currentTick = tickCount.incrementAndGet();
        List<SensorReading> allReadingsThisTick = new ArrayList<>();

        for (EquipmentSimulationState state : equipmentStates.values()) {
            SimulationMode effectiveMode = equipmentModeOverrides.getOrDefault(state.getEquipmentId(), globalMode);
            List<SensorReading> readings = state.step(effectiveMode);

            // Save individual sensor readings and dispatch to PEKKA AI
            for (SensorReading reading : readings) {
                repository.saveReading(reading);
                allReadingsThisTick.add(reading);
                log.info("[SIMULATOR] Generated reading sensorId={} equipmentId={} sensorType={} value={} unit={} status={}",
                        reading.sensorId(), reading.equipmentId(), reading.sensorType(), reading.value(), reading.unit(), reading.status());
                if (telemetryDispatcher != null) {
                    telemetryDispatcher.dispatchReading(reading);
                }
            }

            // Create and save composite equipment telemetry
            SensorStatus overallStatus = EquipmentTelemetry.computeOverallStatus(readings);
            EquipmentTelemetry telemetry = new EquipmentTelemetry(
                    state.getEquipmentId(),
                    state.getEquipmentName(),
                    state.getEquipmentType(),
                    effectiveMode,
                    overallStatus,
                    SensorReading.currentIsoTimestamp(),
                    readings
            );
            repository.saveEquipmentTelemetry(telemetry);

            // Broadcast equipment snapshot via WebSocket
            if (properties.isWebsocketEnabled()) {
                broadcastEquipmentTelemetry(telemetry);
            }
        }

        // Broadcast batch readings if WebSocket enabled
        if (properties.isWebsocketEnabled()) {
            broadcastReadingsBatch(allReadingsThisTick);
        }
    }

    private void broadcastEquipmentTelemetry(EquipmentTelemetry telemetry) {
        try {
            messagingTemplate.convertAndSend("/topic/equipment/" + telemetry.equipmentId(), telemetry);
        } catch (Exception e) {
            log.debug("WebSocket broadcast error for equipment {}: {}", telemetry.equipmentId(), e.getMessage());
        }
    }

    private void broadcastReadingsBatch(List<SensorReading> readings) {
        try {
            // Broadcast all readings on unified topic
            messagingTemplate.convertAndSend("/topic/readings", readings);

            // Also broadcast individual sensor readings for fine-grained subscribers
            for (SensorReading r : readings) {
                messagingTemplate.convertAndSend("/topic/sensors/" + r.sensorId(), r);
            }
        } catch (Exception e) {
            log.debug("WebSocket broadcast error for readings: {}", e.getMessage());
        }
    }

    public void broadcastStatus() {
        if (!properties.isWebsocketEnabled()) {
            return;
        }
        try {
            messagingTemplate.convertAndSend("/topic/simulation-status", getStatus());
        } catch (Exception e) {
            log.debug("WebSocket broadcast error for simulation status: {}", e.getMessage());
        }
    }

    public SimulationStatusResponse getStatus() {
        Map<String, SimulationMode> modes = new LinkedHashMap<>();
        for (String eqId : equipmentStates.keySet()) {
            modes.put(eqId, equipmentModeOverrides.getOrDefault(eqId, globalMode));
        }

        return new SimulationStatusResponse(
                isRunning.get() ? "RUNNING" : "PAUSED",
                globalMode,
                currentIntervalMs,
                tickCount.get(),
                modes,
                equipmentStates.size(),
                repository.getAllSensors().size(),
                SensorReading.currentIsoTimestamp()
        );
    }

    public boolean isRunning() {
        return isRunning.get();
    }

    public SimulationMode getGlobalMode() {
        return globalMode;
    }

    public long getCurrentIntervalMs() {
        return currentIntervalMs;
    }

    public long getTickCount() {
        return tickCount.get();
    }

    @PreDestroy
    public synchronized void cleanup() {
        stop();
    }
}
