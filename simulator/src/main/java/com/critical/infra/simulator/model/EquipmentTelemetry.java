package com.critical.infra.simulator.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record EquipmentTelemetry(
        @JsonProperty("equipmentId") String equipmentId,
        @JsonProperty("equipmentName") String equipmentName,
        @JsonProperty("equipmentType") String equipmentType,
        @JsonProperty("mode") SimulationMode mode,
        @JsonProperty("status") SensorStatus overallStatus,
        @JsonProperty("timestamp") String timestamp,
        @JsonProperty("readings") List<SensorReading> readings
) {
    public static SensorStatus computeOverallStatus(List<SensorReading> readings) {
        if (readings == null || readings.isEmpty()) {
            return SensorStatus.NORMAL;
        }
        boolean hasWarning = false;
        for (SensorReading reading : readings) {
            if (reading.status() == SensorStatus.CRITICAL) {
                return SensorStatus.CRITICAL;
            }
            if (reading.status() == SensorStatus.WARNING) {
                hasWarning = true;
            }
        }
        return hasWarning ? SensorStatus.WARNING : SensorStatus.NORMAL;
    }
}
