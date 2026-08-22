package com.sih.deanonymizer.controller;

import com.sih.deanonymizer.dto.SearchResultDto;
import com.sih.deanonymizer.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
@Tag(name = "Search", description = "Multi-faceted global search across threat actors, handles, crypto wallets, PGP keys, and hidden services")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    @Operation(summary = "Global CTI search", description = "Search across threat actors, personas, identifiers (wallets, PGP, emails), and infrastructure indicators.")
    public ResponseEntity<List<SearchResultDto>> search(
            @Parameter(description = "Search query keyword, handle, wallet address, or PGP fingerprint", required = true)
            @RequestParam(name = "q") String query,
            @Parameter(description = "Filter by entity type: ALL, ACTOR, PERSONA, IDENTIFIER, INFRASTRUCTURE")
            @RequestParam(required = false, defaultValue = "ALL") String type,
            @Parameter(description = "Filter by threat category (e.g. RANSOMWARE, DATA_BROKER)")
            @RequestParam(required = false) String category,
            @Parameter(description = "Filter by start date (ISO-8601, e.g. 2021-01-01T00:00:00Z)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @Parameter(description = "Filter by end date (ISO-8601, e.g. 2026-12-31T23:59:59Z)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate
    ) {
        List<SearchResultDto> results = searchService.search(query, type, category, startDate, endDate);
        return ResponseEntity.ok(results);
    }
}
