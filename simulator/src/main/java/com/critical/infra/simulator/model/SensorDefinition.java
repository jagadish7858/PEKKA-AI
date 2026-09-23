package com.critical.infra.simulator.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SensorDefinition(
        @JsonProperty("sensorId") String sensorId,
        @JsonProperty("equipmentId") String equipmentId,
        @JsonProperty("sensorType") SensorType sensorType,
        @JsonProperty("name") String name,
        @JsonProperty("unit") String unit,
        @JsonProperty("normalMin") double normalMin,
        @JsonProperty("normalMax") double normalMax,
        @JsonProperty("warningMin") double warningMin,
        @JsonProperty("warningMax") double warningMax,
        @JsonProperty("criticalMin") double criticalMin,
        @JsonProperty("criticalMax") double criticalMax
) {
    public static SensorDefinition of(String sensorId, String equipmentId, SensorType type) {
        return new SensorDefinition(
                sensorId,
                equipmentId,
                type,
                type.getDisplayName(),
                type.getDefaultUnit(),
                type.getNormalMin(),
                type.getNormalMax(),
                type.getWarningMin(),
                type.getWarningMax(),
                type.getCriticalMin(),
                type.getCriticalMax()
        );
    }
}
