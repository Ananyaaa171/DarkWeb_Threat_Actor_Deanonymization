package com.sih.deanonymizer.controller;

import com.sih.deanonymizer.dto.*;
import com.sih.deanonymizer.service.ActorService;
import com.sih.deanonymizer.service.RelationshipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/actors")
@Tag(name = "Threat Actors", description = "Endpoints for threat actor intelligence dossiers, summaries, and relationship networks")
public class ActorController {

    private final ActorService actorService;
    private final RelationshipService relationshipService;

    public ActorController(ActorService actorService, RelationshipService relationshipService) {
        this.actorService = actorService;
        this.relationshipService = relationshipService;
    }

    @GetMapping
    @Operation(summary = "List threat actors", description = "Retrieves a paginated list of threat actors with optional category, confidence, and search filters.")
    public ResponseEntity<PageResponse<ActorSummaryDto>> getActors(
            @Parameter(description = "Filter by threat category (e.g. RANSOMWARE, DATA_BROKER)")
            @RequestParam(required = false) String category,
            @Parameter(description = "Minimum attribution confidence score (0-100)")
            @RequestParam(required = false) BigDecimal minConfidence,
            @Parameter(description = "Search query for canonical name or summary")
            @RequestParam(required = false) String q,
            @Parameter(description = "Zero-indexed page number")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (default 10, max 100)")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort direction (ASC or DESC)")
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        int validatedSize = Math.min(Math.max(size, 1), 100);
        Sort sort = "ASC".equalsIgnoreCase(direction) ?
                Sort.by("overallConfidenceScore").ascending() :
                Sort.by("overallConfidenceScore").descending();

        Pageable pageable = PageRequest.of(Math.max(page, 0), validatedSize, sort);
        PageResponse<ActorSummaryDto> response = actorService.getActors(category, minConfidence, q, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get threat actor dossier", description = "Retrieves complete actor dossier including related personas, digital identifiers, infrastructure, and timeline events.")
    public ResponseEntity<ActorDetailDto> getActorById(
            @Parameter(description = "UUID of the threat actor")
            @PathVariable UUID id
    ) {
        ActorDetailDto dossier = actorService.getActorById(id);
        return ResponseEntity.ok(dossier);
    }

    @GetMapping("/{id}/relationships")
    @Operation(summary = "Get actor relationship network", description = "Retrieves a graph-friendly nodes and edges representation of the actor, associated personas, identifiers, and infrastructure.")
    public ResponseEntity<RelationshipGraphDto> getActorRelationships(
            @Parameter(description = "UUID of the threat actor")
            @PathVariable UUID id
    ) {
        RelationshipGraphDto graph = relationshipService.getActorRelationships(id);
        return ResponseEntity.ok(graph);
    }
}
