package com.critical.infra.simulator.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

public record SensorReading(
        @JsonProperty("sensorId") String sensorId,
        @JsonProperty("equipmentId") String equipmentId,
        @JsonProperty("sensorType") SensorType sensorType,
        @JsonProperty("value") double value,
        @JsonProperty("unit") String unit,
        @JsonProperty("timestamp") String timestamp,
        @JsonProperty("status") SensorStatus status
) {
    public static String currentIsoTimestamp() {
        return Instant.now().truncatedTo(ChronoUnit.SECONDS).toString();
    }

    public static double roundValue(double val, SensorType type) {
        int decimals = switch (type) {
            case POWER_FACTOR -> 3;
            case FREQUENCY, OIL_PRESSURE -> 2;
            case TEMPERATURE, OIL_TEMPERATURE, VIBRATION, LOAD, VOLTAGE, CURRENT -> 1;
        };
        double factor = Math.pow(10, decimals);
        return Math.round(val * factor) / factor;
    }
}
