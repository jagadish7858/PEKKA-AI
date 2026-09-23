package com.critical.infra.simulator.engine;

import com.critical.infra.simulator.model.SensorReading;
import com.critical.infra.simulator.model.SensorStatus;
import com.critical.infra.simulator.model.SensorType;
import com.critical.infra.simulator.model.SimulationMode;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Maintains internal state for a simulated equipment and generates physics-consistent,
 * continuous time-series telemetry.
 */
public class EquipmentSimulationState {

    private final String equipmentId;
    private final String equipmentName;
    private final String equipmentType;
    private final String prefix;
    private SimulationMode currentMode;

    // Current continuous values
    private double temperature;
    private double voltage;
    private double current;
    private double vibration;
    private double loadPercentage;
    private double powerFactor;
    private double frequency;
    private double oilTemperature;
    private double oilPressure;

    // Anomaly injection state
    private final Map<SensorType, Double> activeAnomalies = new ConcurrentHashMap<>();
    private final Map<SensorType, Integer> anomalyRemainingTicks = new ConcurrentHashMap<>();

    private final Random random = new Random();

    public EquipmentSimulationState(String equipmentId, String equipmentName, String equipmentType, String prefix, SimulationMode initialMode) {
        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.equipmentType = equipmentType;
        this.prefix = prefix;
        this.currentMode = initialMode;
        resetToNormalBaseline();
    }

    public void resetToNormalBaseline() {
        this.loadPercentage = 50.0 + (random.nextDouble() * 10.0 - 5.0);
        this.voltage = 230.0 + (random.nextDouble() * 2.0 - 1.0);
        this.powerFactor = 0.95 + (random.nextDouble() * 0.02 - 0.01);
        this.frequency = 50.0 + (random.nextDouble() * 0.1 - 0.05);
        this.current = 350.0 + (this.loadPercentage - 50.0) * 3.0;
        this.temperature = 60.0 + (random.nextDouble() * 4.0 - 2.0);
        this.oilTemperature = 52.0 + (random.nextDouble() * 4.0 - 2.0);
        this.vibration = 1.8 + (random.nextDouble() * 0.4 - 0.2);
        this.oilPressure = 1.5 + (random.nextDouble() * 0.1 - 0.05);

        activeAnomalies.clear();
        anomalyRemainingTicks.clear();
    }

    public synchronized List<SensorReading> step(SimulationMode mode) {
        this.currentMode = mode;

        // Apply physics-based gradual drift depending on active simulation mode
        switch (mode) {
            case NORMAL -> stepNormal();
            case WARNING -> stepWarning();
            case CRITICAL -> stepCritical();
        }

        // Apply any active anomalies
        applyAnomalies();

        String timestamp = SensorReading.currentIsoTimestamp();
        List<SensorReading> readings = new ArrayList<>(9);

        readings.add(createReading("TEMP-" + prefix, SensorType.TEMPERATURE, temperature, timestamp));
        readings.add(createReading("VOLT-" + prefix, SensorType.VOLTAGE, voltage, timestamp));
        readings.add(createReading("CURR-" + prefix, SensorType.CURRENT, current, timestamp));
        readings.add(createReading("VIBR-" + prefix, SensorType.VIBRATION, vibration, timestamp));
        readings.add(createReading("LOAD-" + prefix, SensorType.LOAD, loadPercentage, timestamp));
        readings.add(createReading("PWRF-" + prefix, SensorType.POWER_FACTOR, powerFactor, timestamp));
        readings.add(createReading("FREQ-" + prefix, SensorType.FREQUENCY, frequency, timestamp));
        readings.add(createReading("OILTEMP-" + prefix, SensorType.OIL_TEMPERATURE, oilTemperature, timestamp));
        readings.add(createReading("OILPRES-" + prefix, SensorType.OIL_PRESSURE, oilPressure, timestamp));

        return readings;
    }

    /**
     * NORMAL mode:
     * Values drift gently within stable bounds.
     * Load: 40-70%
     * Temp: 55-70°C
     * Voltage: 220-240V
     * Current: 300-450A
     * Vibration: 1-3 mm/s
     * Power factor: 0.90-0.99
     * Frequency: 49.8-50.2 Hz
     * Oil temp: 45-65°C
     * Oil pressure: 1.2-2.0 bar
     */
    private void stepNormal() {
        // Load slowly wanders between 45% and 65%
        loadPercentage = smoothWalk(loadPercentage, 52.0, 0.08, 0.6, 40.0, 68.0);

        // Current follows load
        double targetCurrent = 300.0 + ((loadPercentage - 40.0) / 30.0) * 130.0;
        current = smoothWalk(current, targetCurrent, 0.12, 1.5, 300.0, 450.0);

        // Voltage fluctuates smoothly around 230V with slight inverse correlation to current
        double targetVoltage = 232.0 - ((current - 300.0) / 150.0) * 4.0;
        voltage = smoothWalk(voltage, targetVoltage, 0.10, 0.4, 222.0, 238.0);

        // Frequency hovers around 50.0 Hz
        frequency = smoothWalk(frequency, 50.0, 0.15, 0.02, 49.85, 50.15);

        // Power factor nominal 0.95
        powerFactor = smoothWalk(powerFactor, 0.95, 0.05, 0.005, 0.91, 0.98);

        // Vibration is calm 1.2 - 2.4 mm/s
        double targetVibration = 1.6 + ((loadPercentage - 40.0) / 30.0) * 0.7;
        vibration = smoothWalk(vibration, targetVibration, 0.10, 0.08, 1.1, 2.8);

        // Temperature tracks current and ambient (thermal equilibrium target: ~62°C)
        double targetTemp = 57.0 + ((current - 300.0) / 150.0) * 10.0;
        temperature = smoothWalk(temperature, targetTemp, 0.06, 0.3, 55.0, 68.0);

        // Oil temperature lags winding temperature with thermal inertia
        double targetOilTemp = temperature - 7.0;
        oilTemperature = smoothWalk(oilTemperature, targetOilTemp, 0.04, 0.2, 47.0, 63.0);

        // Oil pressure stable around 1.5 bar
        double targetPressure = 1.45 + ((oilTemperature - 45.0) / 20.0) * 0.3;
        oilPressure = smoothWalk(oilPressure, targetPressure, 0.05, 0.02, 1.25, 1.90);
    }

    /**
     * WARNING mode:
     * Equipment begins deteriorating. Values gradually trend upwards towards warning thresholds.
     */
    private void stepWarning() {
        // Load creeps up into 75-88%
        loadPercentage = smoothWalk(loadPercentage, 82.0, 0.05, 0.8, 70.0, 89.0);

        // Current increases 460 - 580 A
        double targetCurrent = 460.0 + ((loadPercentage - 70.0) / 20.0) * 110.0;
        current = smoothWalk(current, targetCurrent, 0.08, 2.5, 455.0, 590.0);

        // Voltage begins to fluctuate with wider swings (210 - 245 V)
        double targetVoltage = 218.0 + (random.nextDouble() * 20.0 - 10.0);
        voltage = smoothWalk(voltage, targetVoltage, 0.12, 1.2, 208.0, 246.0);

        // Frequency experiences minor grid strain
        frequency = smoothWalk(frequency, 49.6, 0.08, 0.04, 49.3, 50.6);

        // Power factor drops slightly
        powerFactor = smoothWalk(powerFactor, 0.86, 0.04, 0.01, 0.83, 0.89);

        // Vibration slowly increases (3.4 - 5.5 mm/s)
        vibration = smoothWalk(vibration, 4.5, 0.05, 0.15, 3.2, 5.8);

        // Temperature slowly rises into warning territory (74 - 84 °C)
        temperature = smoothWalk(temperature, 78.5, 0.04, 0.4, 71.0, 84.5);

        // Oil temperature rises (68 - 80 °C)
        oilTemperature = smoothWalk(oilTemperature, 74.0, 0.03, 0.3, 66.0, 81.0);

        // Oil pressure begins to elevate (2.1 - 2.6 bar)
        oilPressure = smoothWalk(oilPressure, 2.35, 0.04, 0.03, 2.05, 2.70);
    }

    /**
     * CRITICAL mode:
     * Equipment failure condition: rapid thermal increase, excessive current, voltage drop, high vibration.
     */
    private void stepCritical() {
        // Load dangerously high (92 - 110%)
        loadPercentage = smoothWalk(loadPercentage, 102.0, 0.09, 1.2, 91.0, 115.0);

        // Current excessive (> 650 A up to 850 A)
        double targetCurrent = 680.0 + ((loadPercentage - 90.0) / 20.0) * 140.0;
        current = smoothWalk(current, targetCurrent, 0.12, 4.0, 620.0, 880.0);

        // Severe voltage drop due to heavy overload and impending fault
        voltage = smoothWalk(voltage, 185.0, 0.10, 2.0, 170.0, 202.0);

        // Grid frequency instability
        frequency = smoothWalk(frequency, 48.6, 0.08, 0.08, 47.5, 49.2);

        // Degraded power factor
        powerFactor = smoothWalk(powerFactor, 0.74, 0.06, 0.02, 0.65, 0.79);

        // Vibration becomes severe (> 7 mm/s up to 14 mm/s)
        vibration = smoothWalk(vibration, 9.8, 0.10, 0.35, 6.8, 16.0);

        // Rapid temperature spike into dangerous territory (90 - 115 °C)
        temperature = smoothWalk(temperature, 104.0, 0.08, 0.6, 88.0, 118.0);

        // Oil temperature escalates dangerously (88 - 105 °C)
        oilTemperature = smoothWalk(oilTemperature, 96.0, 0.06, 0.5, 84.0, 110.0);

        // Oil pressure spikes dangerously (> 2.9 bar)
        oilPressure = smoothWalk(oilPressure, 3.4, 0.08, 0.05, 2.85, 4.2);
    }

    /**
     * Smooth random walk with momentum and soft boundary clamping.
     * Prevents abrupt random jumps while ensuring realistic time-series variance.
     */
    private double smoothWalk(double currentVal, double targetVal, double driftRate, double noiseStdDev, double min, double max) {
        // Drift towards target (mean reversion)
        double drift = (targetVal - currentVal) * driftRate;
        // Subtle Gaussian jitter
        double noise = random.nextGaussian() * noiseStdDev;

        double nextVal = currentVal + drift + noise;
        // Clamp smoothly
        if (nextVal < min) {
            nextVal = min + Math.abs(random.nextGaussian() * noiseStdDev * 0.5);
        } else if (nextVal > max) {
            nextVal = max - Math.abs(random.nextGaussian() * noiseStdDev * 0.5);
        }
        return nextVal;
    }

    private void applyAnomalies() {
        Iterator<Map.Entry<SensorType, Integer>> it = anomalyRemainingTicks.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<SensorType, Integer> entry = it.next();
            SensorType type = entry.getKey();
            int remaining = entry.getValue() - 1;

            Double delta = activeAnomalies.get(type);
            if (delta != null) {
                switch (type) {
                    case TEMPERATURE -> temperature += delta;
                    case VOLTAGE -> voltage += delta;
                    case CURRENT -> current += delta;
                    case VIBRATION -> vibration += delta;
                    case LOAD -> loadPercentage += delta;
                    case POWER_FACTOR -> powerFactor += delta;
                    case FREQUENCY -> frequency += delta;
                    case OIL_TEMPERATURE -> oilTemperature += delta;
                    case OIL_PRESSURE -> oilPressure += delta;
                }
            }

            if (remaining <= 0) {
                it.remove();
                activeAnomalies.remove(type);
            } else {
                entry.setValue(remaining);
            }
        }
    }

    public synchronized void injectAnomaly(SensorType type, double delta, int durationTicks) {
        activeAnomalies.put(type, delta);
        anomalyRemainingTicks.put(type, Math.max(1, durationTicks));
    }

    private SensorReading createReading(String sensorId, SensorType type, double rawValue, String timestamp) {
        double rounded = SensorReading.roundValue(rawValue, type);
        SensorStatus status = type.evaluateStatus(rounded);
        return new SensorReading(
                sensorId,
                equipmentId,
                type,
                rounded,
                type.getDefaultUnit(),
                timestamp,
                status
        );
    }

    public String getEquipmentId() {
        return equipmentId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public String getEquipmentType() {
        return equipmentType;
    }

    public SimulationMode getCurrentMode() {
        return currentMode;
    }

    public void setCurrentMode(SimulationMode currentMode) {
        this.currentMode = currentMode;
    }
}
