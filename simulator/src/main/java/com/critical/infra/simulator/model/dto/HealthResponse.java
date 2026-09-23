package com.critical.infra.simulator.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record HealthResponse(
        @JsonProperty("status") String status,
        @JsonProperty("service") String service,
        @JsonProperty("timestamp") String timestamp,
        @JsonProperty("version") String version
) {
    public static HealthResponse up() {
        return new HealthResponse(
                "UP",
                "critical-infrastructure-sensor-simulator",
                java.time.LocalDateTime.now().toString(),
                "1.0.0"
        );
    }
}
