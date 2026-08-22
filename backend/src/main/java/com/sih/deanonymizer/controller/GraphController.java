package com.sih.deanonymizer.controller;

import com.sih.deanonymizer.dto.RelationshipGraphDto;
import com.sih.deanonymizer.service.RelationshipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/graph")
@Tag(name = "Graph", description = "Endpoints for topological relationship networks and multi-hop entity graphs")
public class GraphController {

    private final RelationshipService relationshipService;

    public GraphController(RelationshipService relationshipService) {
        this.relationshipService = relationshipService;
    }

    @GetMapping("/actor/{id}")
    @Operation(summary = "Get actor relationship network", description = "Retrieves a graph-friendly nodes and edges representation of the actor, associated personas, identifiers, and infrastructure.")
    public ResponseEntity<RelationshipGraphDto> getActorGraph(
            @Parameter(description = "UUID of the threat actor")
            @PathVariable UUID id
    ) {
        RelationshipGraphDto graph = relationshipService.getActorRelationships(id);
        return ResponseEntity.ok(graph);
    }
}
