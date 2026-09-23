package com.critical.infra.simulator.service;

import com.critical.infra.simulator.config.SimulationProperties;
import com.critical.infra.simulator.model.SensorReading;
import com.critical.infra.simulator.model.SensorStatus;
import com.critical.infra.simulator.model.SensorType;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class PekkaTelemetryDispatcherTest {

    @Test
    void testJsonPayloadMatchesPekkaTelemetryContract() {
        SensorReading reading = new SensorReading(
                "TEMP-T01",
                "TRANSFORMER-01",
                SensorType.TEMPERATURE,
                72.4,
                "°C",
                "2026-09-23T10:30:00Z",
                SensorStatus.NORMAL
        );

        String json = PekkaTelemetryDispatcher.toJson(reading);

        assertTrue(json.contains("\"sensorId\":\"TEMP-T01\""));
        assertTrue(json.contains("\"equipmentId\":\"TRANSFORMER-01\""));
        assertTrue(json.contains("\"sensorType\":\"TEMPERATURE\""));
        assertTrue(json.contains("\"value\":72.4"));
        assertTrue(json.contains("\"unit\":\"°C\""));
        assertTrue(json.contains("\"timestamp\":\"2026-09-23T10:30:00Z\""));
        assertTrue(json.contains("\"status\":\"NORMAL\""));
    }

    @Test
    void testLoadSensorTypeSerializedAsLoad() {
        SensorReading reading = new SensorReading(
                "LOAD-T01",
                "TRANSFORMER-01",
                SensorType.LOAD,
                65.0,
                "%",
                "2026-09-23T10:30:00Z",
                SensorStatus.NORMAL
        );

        String json = PekkaTelemetryDispatcher.toJson(reading);
        assertTrue(json.contains("\"sensorType\":\"LOAD\""));
    }

    @Test
    void testDispatchHandlesOfflineBackendGracefully() {
        SimulationProperties props = new SimulationProperties();
        props.setPekkaBackendUrl("http://127.0.0.1:59999"); // offline dummy port
        props.setPekkaIngestionEndpoint("/api/v1/readings");
        props.setPekkaIngestionEnabled(true);

        PekkaTelemetryDispatcher dispatcher = new PekkaTelemetryDispatcher(props);
        SensorReading reading = new SensorReading(
                "TEMP-T01",
                "TRANSFORMER-01",
                SensorType.TEMPERATURE,
                72.4,
                "°C",
                "2026-09-23T10:30:00Z",
                SensorStatus.NORMAL
        );

        assertDoesNotThrow(() -> dispatcher.dispatchReading(reading).join());
    }
}
