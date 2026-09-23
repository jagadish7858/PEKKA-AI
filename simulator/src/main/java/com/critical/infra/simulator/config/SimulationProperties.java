package com.critical.infra.simulator.config;

import com.critical.infra.simulator.model.SimulationMode;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "simulation")
public class SimulationProperties {

    /**
     * Simulation tick interval in milliseconds.
     */
    private long interval = 1000;

    /**
     * Default simulation mode at startup.
     */
    private SimulationMode defaultMode = SimulationMode.NORMAL;

    /**
     * Whether the simulation runs automatically upon startup.
     */
    private boolean enabled = true;

    /**
     * Whether WebSocket broadcasting is active.
     */
    private boolean websocketEnabled = true;

    /**
     * PEKKA AI Backend Base URL (e.g. http://127.0.0.1:8001).
     */
    private String pekkaBackendUrl = "http://127.0.0.1:8001";

    /**
     * PEKKA AI Telemetry Ingestion endpoint (e.g. /api/v1/readings).
     */
    private String pekkaIngestionEndpoint = "/api/v1/readings";

    /**
     * Whether telemetry transmission to PEKKA AI is enabled.
     */
    private boolean pekkaIngestionEnabled = true;

    public long getInterval() {
        return interval;
    }

    public void setInterval(long interval) {
        this.interval = interval;
    }

    public SimulationMode getDefaultMode() {
        return defaultMode;
    }

    public void setDefaultMode(SimulationMode defaultMode) {
        this.defaultMode = defaultMode;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isWebsocketEnabled() {
        return websocketEnabled;
    }

    public void setWebsocketEnabled(boolean websocketEnabled) {
        this.websocketEnabled = websocketEnabled;
    }

    public String getPekkaBackendUrl() {
        return pekkaBackendUrl;
    }

    public void setPekkaBackendUrl(String pekkaBackendUrl) {
        this.pekkaBackendUrl = pekkaBackendUrl;
    }

    public String getPekkaIngestionEndpoint() {
        return pekkaIngestionEndpoint;
    }

    public void setPekkaIngestionEndpoint(String pekkaIngestionEndpoint) {
        this.pekkaIngestionEndpoint = pekkaIngestionEndpoint;
    }

    public boolean isPekkaIngestionEnabled() {
        return pekkaIngestionEnabled;
    }

    public void setPekkaIngestionEnabled(boolean pekkaIngestionEnabled) {
        this.pekkaIngestionEnabled = pekkaIngestionEnabled;
    }
}
