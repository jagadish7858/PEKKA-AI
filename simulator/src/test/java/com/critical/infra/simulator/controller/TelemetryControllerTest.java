package com.critical.infra.simulator.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
public class TelemetryControllerTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    void sensorsEndpointReturnsAllConfiguredSensors() throws Exception {
        mockMvc.perform(get("/api/v1/sensors")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(18)))
                .andExpect(jsonPath("$[0].sensorId", notNullValue()))
                .andExpect(jsonPath("$[0].equipmentId", notNullValue()))
                .andExpect(jsonPath("$[0].sensorType", notNullValue()))
                .andExpect(jsonPath("$[0].unit", notNullValue()));
    }

    @Test
    void readingsEndpointReturnsReadingsWithExactRequiredSchema() throws Exception {
        mockMvc.perform(get("/api/v1/readings")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].sensorId", notNullValue()))
                .andExpect(jsonPath("$[0].equipmentId", notNullValue()))
                .andExpect(jsonPath("$[0].sensorType", notNullValue()))
                .andExpect(jsonPath("$[0].value", notNullValue()))
                .andExpect(jsonPath("$[0].unit", notNullValue()))
                .andExpect(jsonPath("$[0].timestamp", notNullValue()))
                .andExpect(jsonPath("$[0].status", notNullValue()));
    }

    @Test
    void transformer01HasNineSensors() throws Exception {
        mockMvc.perform(get("/api/v1/readings/TRANSFORMER-01")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(9)));
    }

    @Test
    void simulationModeCanBeSwitchedViaRest() throws Exception {
        mockMvc.perform(post("/api/v1/simulation/mode")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mode\":\"WARNING\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.globalMode").value("WARNING"));

        mockMvc.perform(post("/api/v1/simulation/mode")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mode\":\"CRITICAL\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.globalMode").value("CRITICAL"));

        // Reset to normal
        mockMvc.perform(post("/api/v1/simulation/mode")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mode\":\"NORMAL\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.globalMode").value("NORMAL"));
    }
}
