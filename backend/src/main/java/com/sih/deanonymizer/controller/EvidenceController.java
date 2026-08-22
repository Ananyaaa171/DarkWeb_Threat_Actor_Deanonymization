package com.sih.deanonymizer.controller;

import com.sih.deanonymizer.dto.EvidenceItemDto;
import com.sih.deanonymizer.service.LinkageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/evidence")
@Tag(name = "Evidence", description = "Endpoints for retrieving granular evidence items supporting persona linkages")
public class EvidenceController {

    private final LinkageService linkageService;

    public EvidenceController(LinkageService linkageService) {
        this.linkageService = linkageService;
    }

    @GetMapping("/linkage/{linkageId}")
    @Operation(summary = "Get evidence items for a linkage", description = "Retrieves all evidence items (PGP matches, shared crypto wallets, stylometric markers, timezone alignment) supporting a specific linkage analysis.")
    public ResponseEntity<List<EvidenceItemDto>> getEvidenceByLinkageId(
            @Parameter(description = "UUID of the linkage analysis")
            @PathVariable UUID linkageId
    ) {
        List<EvidenceItemDto> evidence = linkageService.getEvidenceByLinkageId(linkageId);
        return ResponseEntity.ok(evidence);
    }
}
