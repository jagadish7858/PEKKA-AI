package com.critical.infra.simulator.model.dto;

import com.critical.infra.simulator.model.SimulationMode;
import com.fasterxml.jackson.annotation.JsonProperty;

public record ModeUpdateRequest(
        @JsonProperty("mode") SimulationMode mode
) {}
