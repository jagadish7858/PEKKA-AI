package com.critical.infra.simulator.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record EquipmentDefinition(
        @JsonProperty("equipmentId") String equipmentId,
        @JsonProperty("name") String name,
        @JsonProperty("type") String type,
        @JsonProperty("location") String location,
        @JsonProperty("sensors") List<SensorDefinition> sensors
) {
}
