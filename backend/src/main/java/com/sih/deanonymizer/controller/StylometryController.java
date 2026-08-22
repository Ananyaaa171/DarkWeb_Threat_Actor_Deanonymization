package com.sih.deanonymizer.controller;

import com.sih.deanonymizer.dto.StylometricComparisonDto;
import com.sih.deanonymizer.dto.StylometryCompareRequest;
import com.sih.deanonymizer.exception.BadRequestException;
import com.sih.deanonymizer.service.stylometry.StylometryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/stylometry")
@Tag(name = "Stylometry", description = "Statistical NLP stylometric feature extraction and cross-persona writing style comparison")
public class StylometryController {

    private final StylometryService stylometryService;

    public StylometryController(StylometryService stylometryService) {
        this.stylometryService = stylometryService;
    }

    @PostMapping("/compare")
    @Operation(summary = "Compare writing style", description = "Compares stylometric features (TTR, Yule's K, character 3-grams, punctuation, Slavic smileys) between two personas or two raw text bodies.")
    public ResponseEntity<StylometricComparisonDto> compareStylometry(@RequestBody StylometryCompareRequest request) {
        if (request.getSourcePersonaId() != null && request.getTargetPersonaId() != null) {
            StylometricComparisonDto comparison = stylometryService.comparePersonas(
                    request.getSourcePersonaId(), request.getTargetPersonaId());
            return ResponseEntity.ok(comparison);
        } else if (request.getTextA() != null && request.getTextB() != null) {
            StylometricComparisonDto comparison = stylometryService.compareTexts(
                    request.getTextA(), request.getTextB());
            return ResponseEntity.ok(comparison);
        } else {
            throw new BadRequestException("Must provide either (sourcePersonaId, targetPersonaId) or (textA, textB).");
        }
    }
}
