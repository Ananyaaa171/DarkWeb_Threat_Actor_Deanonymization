package com.sih.deanonymizer.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Health", description = "System health check and module readiness")
public class HealthController {

    @Value("${gemini.model-name:gemini-1.5-flash}")
    private String geminiModelName;

    @Value("${gemini.embedding-model:text-embedding-004}")
    private String geminiEmbeddingModel;

    @GetMapping("/health")
    @Operation(summary = "System health check", description = "Verifies backend status, active configuration, and API readiness.")
    public ResponseEntity<Map<String, Object>> getHealthStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Dark Web Deanonymizer Backend");
        response.put("version", "1.0.0-SNAPSHOT");
        response.put("timestamp", OffsetDateTime.now().toString());

        Map<String, Object> aiConfig = new HashMap<>();
        aiConfig.put("geminiModel", geminiModelName);
        aiConfig.put("embeddingModel", geminiEmbeddingModel);
        aiConfig.put("attributionEngine", "Deterministic Java 4-Factor Engine (35% ID, 25% Stylometry, 20% Behavior, 20% Infra)");
        response.put("aiArchitecture", aiConfig);

        Map<String, Object> phaseStatus = new HashMap<>();
        phaseStatus.put("currentPhase", "Phase 3: Stylometry + Behavioral Analysis + Deterministic Attribution Scoring + Gemini Explanation Engine");
        phaseStatus.put("status", "COMPLETED");
        phaseStatus.put("endpointsReady", List.of(
                "GET /api/v1/health",
                "GET /api/v1/actors",
                "GET /api/v1/actors/{id}",
                "GET /api/v1/actors/{id}/relationships",
                "GET /api/v1/personas/{id}",
                "GET /api/v1/search",
                "GET /api/v1/timeline/actor/{id}",
                "GET /api/v1/timeline/persona/{id}",
                "GET /api/v1/linkages/{id}",
                "GET /api/v1/evidence/linkage/{linkageId}",
                "POST /api/v1/stylometry/compare",
                "POST /api/v1/linkages/compute"
        ));
        response.put("phaseStatus", phaseStatus);

        return ResponseEntity.ok(response);
    }
}
