package com.critical.infra.simulator.service;

import com.critical.infra.simulator.config.SimulationProperties;
import com.critical.infra.simulator.model.SensorReading;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;

@Service
public class PekkaTelemetryDispatcher {

    private static final Logger log = LoggerFactory.getLogger(PekkaTelemetryDispatcher.class);

    private final SimulationProperties properties;
    private final HttpClient httpClient;

    public PekkaTelemetryDispatcher(SimulationProperties properties) {
        this.properties = properties;
        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(3))
                .build();
    }

    /**
     * Asynchronously dispatches a single sensor reading to the PEKKA AI backend.
     * Logs progress and handles connection failures gracefully without halting the simulation.
     */
    public CompletableFuture<Void> dispatchReading(SensorReading reading) {
        if (!properties.isPekkaIngestionEnabled()) {
            return CompletableFuture.completedFuture(null);
        }

        String targetUrl = properties.getPekkaBackendUrl().replaceAll("/+$", "")
                + "/" + properties.getPekkaIngestionEndpoint().replaceAll("^/+", "");

        log.info("[PEKKA] Sending reading sensorId={} equipmentId={} sensorType={}",
                reading.sensorId(), reading.equipmentId(), reading.sensorType());

        try {
            String jsonPayload = toJson(reading);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(targetUrl))
                    .version(HttpClient.Version.HTTP_1_1)
                    .timeout(Duration.ofSeconds(3))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, java.nio.charset.StandardCharsets.UTF_8))
                    .build();

            return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenAccept(response -> {
                        int statusCode = response.statusCode();
                        if (statusCode >= 200 && statusCode < 300) {
                            log.info("[PEKKA] Reading accepted sensorId={} equipmentId={} sensorType={} status={}",
                                    reading.sensorId(), reading.equipmentId(), reading.sensorType(), statusCode);
                        } else {
                            log.warn("[PEKKA] Transmission failed sensorId={} equipmentId={} sensorType={} HTTP status={}: {}",
                                    reading.sensorId(), reading.equipmentId(), reading.sensorType(), statusCode, response.body());
                        }
                    })
                    .exceptionally(ex -> {
                        log.warn("[PEKKA] Transmission failed sensorId={} equipmentId={} sensorType={} reason={}",
                                reading.sensorId(), reading.equipmentId(), reading.sensorType(), ex.getMessage());
                        return null;
                    });
        } catch (Exception e) {
            log.warn("[PEKKA] Transmission failed sensorId={} equipmentId={} sensorType={} reason={}",
                    reading.sensorId(), reading.equipmentId(), reading.sensorType(), e.getMessage());
            return CompletableFuture.completedFuture(null);
        }
    }

    public static String toJson(SensorReading r) {
        return "{" +
                "\"sensorId\":\"" + escapeJson(r.sensorId()) + "\"," +
                "\"equipmentId\":\"" + escapeJson(r.equipmentId()) + "\"," +
                "\"sensorType\":\"" + r.sensorType().name() + "\"," +
                "\"value\":" + r.value() + "," +
                "\"unit\":\"" + escapeJson(r.unit()) + "\"," +
                "\"timestamp\":\"" + escapeJson(r.timestamp()) + "\"," +
                "\"status\":\"" + r.status().name() + "\"" +
                "}";
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
