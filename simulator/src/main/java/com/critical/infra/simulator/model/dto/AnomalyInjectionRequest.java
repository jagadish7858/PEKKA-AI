package com.critical.infra.simulator.model.dto;

import com.critical.infra.simulator.model.SensorType;
import com.fasterxml.jackson.annotation.JsonProperty;

public record AnomalyInjectionRequest(
        @JsonProperty("equipmentId") String equipmentId,
        @JsonProperty("sensorType") SensorType sensorType,
        @JsonProperty("delta") double delta,
        @JsonProperty("durationTicks") int durationTicks
) {}
