package com.sih.deanonymizer.controller;

import com.sih.deanonymizer.dto.LinkageAnalysisDto;
import com.sih.deanonymizer.dto.LinkageComputeRequest;
import com.sih.deanonymizer.service.LinkageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/linkages")
@Tag(name = "Linkages", description = "Endpoints for reading and computing deterministic cross-persona attribution analyses")
public class LinkageController {

    private final LinkageService linkageService;

    public LinkageController(LinkageService linkageService) {
        this.linkageService = linkageService;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get linkage analysis details", description = "Retrieves a pre-computed persona linkage analysis record including attribution score, sub-scores, evidence items, and explanation.")
    public ResponseEntity<LinkageAnalysisDto> getLinkageById(
            @Parameter(description = "UUID of the linkage analysis record")
            @PathVariable UUID id
    ) {
        LinkageAnalysisDto linkage = linkageService.getLinkageById(id);
        return ResponseEntity.ok(linkage);
    }

    @PostMapping("/compute")
    @Operation(summary = "Compute persona attribution linkage", description = "Executes deterministic multi-factor analysis (35% ID, 25% Stylometry, 20% Behavior, 20% Infra), generates evidence items, optionally generates Gemini forensic explanation, and returns the complete attribution record.")
    public ResponseEntity<LinkageAnalysisDto> computeLinkage(@RequestBody LinkageComputeRequest request) {
        LinkageAnalysisDto result = linkageService.computeLinkage(
                request.getSourcePersonaId(),
                request.getTargetPersonaId(),
                request.getIncludeAiExplanation()
        );
        return ResponseEntity.ok(result);
    }
}
