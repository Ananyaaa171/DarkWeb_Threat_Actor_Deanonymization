package com.sih.deanonymizer.controller;

import com.sih.deanonymizer.dto.PageResponse;
import com.sih.deanonymizer.dto.TimelineEventDto;
import com.sih.deanonymizer.service.TimelineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/timeline")
@Tag(name = "Timeline", description = "Chronological event investigation across threat groups and specific personas")
public class TimelineController {

    private final TimelineService timelineService;

    public TimelineController(TimelineService timelineService) {
        this.timelineService = timelineService;
    }

    @GetMapping("/actor/{id}")
    @Operation(summary = "Get actor chronological timeline", description = "Retrieves aggregated events across all personas associated with the threat actor.")
    public ResponseEntity<PageResponse<TimelineEventDto>> getActorTimeline(
            @Parameter(description = "UUID of the threat actor")
            @PathVariable UUID id,
            @Parameter(description = "Filter events starting after date (ISO-8601)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @Parameter(description = "Filter events occurring before date (ISO-8601)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate,
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (default 20, max 100)")
            @RequestParam(defaultValue = "20") int size
    ) {
        int validatedSize = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(Math.max(page, 0), validatedSize, Sort.by("eventTimestamp").descending());
        PageResponse<TimelineEventDto> timeline = timelineService.getActorTimeline(id, startDate, endDate, pageable);
        return ResponseEntity.ok(timeline);
    }

    @GetMapping("/persona/{id}")
    @Operation(summary = "Get persona chronological timeline", description = "Retrieves events specifically authored by or attributed to the specified persona.")
    public ResponseEntity<PageResponse<TimelineEventDto>> getPersonaTimeline(
            @Parameter(description = "UUID of the persona")
            @PathVariable UUID id,
            @Parameter(description = "Filter events starting after date (ISO-8601)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @Parameter(description = "Filter events occurring before date (ISO-8601)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate,
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (default 20, max 100)")
            @RequestParam(defaultValue = "20") int size
    ) {
        int validatedSize = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(Math.max(page, 0), validatedSize, Sort.by("eventTimestamp").descending());
        PageResponse<TimelineEventDto> timeline = timelineService.getPersonaTimeline(id, startDate, endDate, pageable);
        return ResponseEntity.ok(timeline);
    }
}
