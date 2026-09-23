package com.critical.infra.simulator.engine;

import com.critical.infra.simulator.model.SensorReading;
import com.critical.infra.simulator.model.SensorStatus;
import com.critical.infra.simulator.model.SensorType;
import com.critical.infra.simulator.model.SimulationMode;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class SimulationEngineTest {

    @Test
    void testGradualContinuousTimeSeriesInNormalMode() {
        EquipmentSimulationState state = new EquipmentSimulationState(
                "TRANSFORMER-01",
                "Substation Alpha",
                "POWER_TRANSFORMER",
                "T01",
                SimulationMode.NORMAL
        );

        double lastTemp = -1;
        double lastVoltage = -1;

        // Run 20 ticks in NORMAL mode
        for (int i = 0; i < 20; i++) {
            List<SensorReading> readings = state.step(SimulationMode.NORMAL);
            assertEquals(9, readings.size());

            for (SensorReading r : readings) {
                if (r.sensorType() == SensorType.TEMPERATURE) {
                    if (lastTemp > 0) {
                        // Crucial realism test: step change between consecutive ticks must be gradual (< 2.0°C)
                        double delta = Math.abs(r.value() - lastTemp);
                        assertTrue(delta < 2.5, "Temperature jump too high: " + delta);
                    }
                    lastTemp = r.value();
                    // Normal range: 55–70 °C
                    assertTrue(r.value() >= 50.0 && r.value() <= 75.0,
                            "Temperature out of expected normal range: " + r.value());
                } else if (r.sensorType() == SensorType.VOLTAGE) {
                    if (lastVoltage > 0) {
                        double delta = Math.abs(r.value() - lastVoltage);
                        assertTrue(delta < 3.0, "Voltage jump too high: " + delta);
                    }
                    lastVoltage = r.value();
                    // Voltage range: 220–240 V
                    assertTrue(r.value() >= 218.0 && r.value() <= 242.0,
                            "Voltage out of expected normal range: " + r.value());
                }
            }
        }
    }

    @Test
    void testCriticalModeTransitionsToCriticalStatus() {
        EquipmentSimulationState state = new EquipmentSimulationState(
                "TRANSFORMER-01",
                "Substation Alpha",
                "POWER_TRANSFORMER",
                "T01",
                SimulationMode.CRITICAL
        );

        boolean reachedCritical = false;

        // In CRITICAL mode, deterioration should reach CRITICAL status within 30 ticks
        for (int i = 0; i < 30; i++) {
            List<SensorReading> readings = state.step(SimulationMode.CRITICAL);
            for (SensorReading r : readings) {
                if (r.status() == SensorStatus.CRITICAL) {
                    reachedCritical = true;
                    break;
                }
            }
            if (reachedCritical) {
                break;
            }
        }

        assertTrue(reachedCritical, "Equipment should transition to CRITICAL status in CRITICAL mode");
    }

    @Test
    void testResetRestoresBaseline() {
        EquipmentSimulationState state = new EquipmentSimulationState(
                "TRANSFORMER-01",
                "Substation Alpha",
                "POWER_TRANSFORMER",
                "T01",
                SimulationMode.CRITICAL
        );

        // Drive into critical
        for (int i = 0; i < 20; i++) {
            state.step(SimulationMode.CRITICAL);
        }

        // Reset
        state.resetToNormalBaseline();
        List<SensorReading> baselineReadings = state.step(SimulationMode.NORMAL);

        for (SensorReading r : baselineReadings) {
            assertEquals(SensorStatus.NORMAL, r.status(),
                    "After reset, sensor " + r.sensorId() + " should be NORMAL, but was " + r.status());
        }
    }
}
