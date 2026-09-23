package com.critical.infra.simulator.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record IntervalUpdateRequest(
        @JsonProperty("intervalMs") long intervalMs
) {}
