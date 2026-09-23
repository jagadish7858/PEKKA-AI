package com.critical.infra.simulator.model.dto;

import com.critical.infra.simulator.model.SimulationMode;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

public record SimulationStatusResponse(
        @JsonProperty("state") String state,
        @JsonProperty("globalMode") SimulationMode globalMode,
        @JsonProperty("intervalMs") long intervalMs,
        @JsonProperty("tickCount") long tickCount,
        @JsonProperty("equipmentModes") Map<String, SimulationMode> equipmentModes,
        @JsonProperty("equipmentCount") int equipmentCount,
        @JsonProperty("totalSensorsCount") int totalSensorsCount,
        @JsonProperty("timestamp") String timestamp
) {}
