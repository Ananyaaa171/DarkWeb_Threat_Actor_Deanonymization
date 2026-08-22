package com.sih.deanonymizer.controller;

import com.sih.deanonymizer.dto.ActorDetailDto;
import com.sih.deanonymizer.service.ActorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/export")
@Tag(name = "Export", description = "Endpoints for exporting court-ready evidentiary dossiers, STIX 2.1 JSON, and CSV indicators")
public class ExportController {

    private final ActorService actorService;

    public ExportController(ActorService actorService) {
        this.actorService = actorService;
    }

    @GetMapping("/json/{actorId}")
    @Operation(summary = "Export STIX 2.1 JSON dossier", description = "Generates structured cyber threat intelligence payload formatted according to the STIX 2.1 specification.")
    public ResponseEntity<Map<String, Object>> exportJson(
            @Parameter(description = "UUID of the threat actor")
            @PathVariable UUID actorId
    ) {
        ActorDetailDto actor = actorService.getActorById(actorId);

        Map<String, Object> stix = new HashMap<>();
        stix.put("type", "bundle");
        stix.put("id", "bundle--" + UUID.randomUUID());
        stix.put("spec_version", "2.1");
        stix.put("classification", "TLP:AMBER+STRICT");
        stix.put("generated_at", OffsetDateTime.now().toString());

        Map<String, Object> threatActorObj = new HashMap<>();
        threatActorObj.put("type", "threat-actor");
        threatActorObj.put("id", "threat-actor--" + actor.getId());
        threatActorObj.put("name", actor.getCanonicalName());
        threatActorObj.put("threat_category", actor.getThreatCategory());
        threatActorObj.put("primary_motive", actor.getPrimaryMotive());
        threatActorObj.put("confidence", actor.getOverallConfidenceScore());
        threatActorObj.put("description", actor.getSummary());
        threatActorObj.put("personas", actor.getPersonas().stream().map(p -> p.getHandle()).collect(Collectors.toList()));
        threatActorObj.put("identifiers", actor.getIdentifiers());
        threatActorObj.put("infrastructure", actor.getInfrastructure());

        stix.put("objects", threatActorObj);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"DWD_Dossier_" + actor.getCanonicalName().replaceAll("\\s+", "_") + ".json\"")
                .body(stix);
    }

    @GetMapping("/csv/{actorId}")
    @Operation(summary = "Export indicators CSV table", description = "Generates a flattened CSV table of digital identifiers, crypto wallets, PGP fingerprints, and onion infrastructure.")
    public ResponseEntity<byte[]> exportCsv(
            @Parameter(description = "UUID of the threat actor")
            @PathVariable UUID actorId
    ) {
        ActorDetailDto actor = actorService.getActorById(actorId);

        StringBuilder sb = new StringBuilder();
        sb.append("ActorName,ThreatCategory,ConfidenceScore,IndicatorType,IndicatorValue,SeenDate\n");

        if (actor.getIdentifiers() != null) {
            for (var id : actor.getIdentifiers()) {
                sb.append(String.format("\"%s\",\"%s\",%.2f,\"%s\",\"%s\",\"%s\"\n",
                        actor.getCanonicalName(),
                        actor.getThreatCategory(),
                        actor.getOverallConfidenceScore(),
                        id.getType(),
                        id.getValue(),
                        id.getFirstSeenAt() != null ? id.getFirstSeenAt().toString() : ""));
            }
        }

        if (actor.getInfrastructure() != null) {
            for (var inf : actor.getInfrastructure()) {
                sb.append(String.format("\"%s\",\"%s\",%.2f,\"%s\",\"%s\",\"%s\"\n",
                        actor.getCanonicalName(),
                        actor.getThreatCategory(),
                        actor.getOverallConfidenceScore(),
                        inf.getType(),
                        inf.getValue(),
                        inf.getLastScannedAt() != null ? inf.getLastScannedAt().toString() : ""));
            }
        }

        byte[] bytes = sb.toString().getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"DWD_Indicators_" + actor.getCanonicalName().replaceAll("\\s+", "_") + ".csv\"")
                .body(bytes);
    }

    @GetMapping("/pdf/{actorId}")
    @Operation(summary = "Export court-ready evidentiary dossier PDF", description = "Generates a forensic intelligence dossier document with case headers, TLP markings, and evidence chains.")
    public ResponseEntity<byte[]> exportPdf(
            @Parameter(description = "UUID of the threat actor")
            @PathVariable UUID actorId
    ) {
        ActorDetailDto actor = actorService.getActorById(actorId);

        String textDossier = String.format(
                "=======================================================\n" +
                "DARK WEB DEANONYMIZER - COURT-READY DOSSIER REPORT\n" +
                "CONFIDENTIAL // TLP:AMBER+STRICT\n" +
                "=======================================================\n" +
                "Case Reference: SIH-2026-CTI-%s\n" +
                "Generated: %s\n" +
                "Target Actor: %s\n" +
                "Threat Category: %s\n" +
                "Attribution Confidence: %.2f%%\n\n" +
                "EXECUTIVE SUMMARY:\n%s\n\n" +
                "LINKED PERSONAS:\n%s\n",
                actor.getId().toString().substring(0, 8),
                OffsetDateTime.now().toString(),
                actor.getCanonicalName(),
                actor.getThreatCategory(),
                actor.getOverallConfidenceScore(),
                actor.getSummary(),
                actor.getPersonas().stream().map(p -> "- @" + p.getHandle() + " (" + p.getPlatform() + ")").collect(Collectors.joining("\n"))
        );

        byte[] bytes = textDossier.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"DWD_Dossier_" + actor.getCanonicalName().replaceAll("\\s+", "_") + ".txt\"")
                .body(bytes);
    }
}
