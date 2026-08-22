package com.sih.deanonymizer.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.deanonymizer.dto.*;
import com.sih.deanonymizer.service.scoring.AttributionScoringService.AttributionResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiExplanationService {

    private static final Logger log = LoggerFactory.getLogger(GeminiExplanationService.class);

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model-name:gemini-1.5-flash}")
    private String modelName;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiExplanationService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    /**
     * Synthesizes a human-readable forensic attribution explanation using Google Gemini API.
     * If the API key is not configured or network fails, returns a deterministic fallback explanation.
     */
    public String generateExplanation(
            PersonaSummaryDto sourcePersona,
            PersonaSummaryDto targetPersona,
            AttributionResult scoringResult,
            StylometricComparisonDto stylometry,
            BehavioralComparisonDto behavioral,
            IdentifierComparisonDto identifiers,
            InfrastructureComparisonDto infrastructure) {

        if (apiKey == null || apiKey.trim().isEmpty()) {
            return generateFallbackExplanation(sourcePersona, targetPersona, scoringResult, stylometry, behavioral, identifiers, infrastructure);
        }

        try {
            String prompt = buildPrompt(sourcePersona, targetPersona, scoringResult, stylometry, behavioral, identifiers, infrastructure);
            String response = callGeminiApi(prompt);
            if (response != null && !response.trim().isEmpty()) {
                return response.trim();
            }
        } catch (Exception e) {
            log.warn("Gemini API call failed: {}. Falling back to deterministic summary.", e.getMessage());
        }

        return generateFallbackExplanation(sourcePersona, targetPersona, scoringResult, stylometry, behavioral, identifiers, infrastructure);
    }

    private String buildPrompt(
            PersonaSummaryDto pA,
            PersonaSummaryDto pB,
            AttributionResult result,
            StylometricComparisonDto sty,
            BehavioralComparisonDto beh,
            IdentifierComparisonDto idComp,
            InfrastructureComparisonDto infraComp) {

        return String.format(
                "You are an expert Cyber Threat Intelligence (CTI) forensic investigator assisting authorized analysts.\n" +
                "Analyze the following pre-computed deterministic evidence between two suspected threat actor personas and generate an explainable, court-ready attribution brief (2-3 concise paragraphs).\n\n" +
                "--- PERSONA IDENTITIES ---\n" +
                "• Persona A: '%s' on %s (Status: %s, Timezone: %s)\n" +
                "• Persona B: '%s' on %s (Status: %s, Timezone: %s)\n\n" +
                "--- DETERMINISTIC ATTRIBUTION SCORES ---\n" +
                "• Total Attribution Score: %.2f%% (Confidence Band: %s)\n" +
                "• Digital Identifier Overlap: %.2f%% (Contribution: +%.2f pts) - %s\n" +
                "• Stylometric Writing Similarity: %.2f%% (Contribution: +%.2f pts) - %s\n" +
                "• Behavioral & Temporal Overlap: %.2f%% (Contribution: +%.2f pts) - %s\n" +
                "• Infrastructure Proximity: %.2f%% (Contribution: +%.2f pts) - %s\n\n" +
                "--- KEY FORENSIC EVIDENCE ITEMS ---\n%s\n\n" +
                "--- INVESTIGATION INSTRUCTIONS ---\n" +
                "1. Synthesize the findings clearly. Highlight any shared cryptographic fingerprints, matching deposit wallets, Slavic punctuation patterns (e.g. ')))'), and timezone alignments.\n" +
                "2. Explicitly frame this as a 'potential linkage' or 'probable migration' with confidence level, NEVER as absolute legal certainty.\n" +
                "3. Note any investigative limitations (e.g. potential copycat behavior, lack of on-chain deanonymization).\n" +
                "4. Keep the summary professional, factual, and strictly under 180 words.",
                pA.getHandle(), pA.getPlatform(), pA.getStatus(), pA.getActivityTimezoneEstimated(),
                pB.getHandle(), pB.getPlatform(), pB.getStatus(), pB.getActivityTimezoneEstimated(),
                result.getTotalScore().doubleValue(), result.getConfidenceLevel(),
                result.getIdentifierScore().doubleValue(), result.getIdentifierContribution().doubleValue(), idComp != null ? idComp.getAnalysisDetails() : "",
                result.getStylometricScore().doubleValue(), result.getStylometricContribution().doubleValue(), sty != null ? sty.getAnalysisDetails() : "",
                result.getBehavioralScore().doubleValue(), result.getBehavioralContribution().doubleValue(), beh != null ? beh.getAnalysisDetails() : "",
                result.getInfrastructureScore().doubleValue(), result.getInfrastructureContribution().doubleValue(), infraComp != null ? infraComp.getAnalysisDetails() : "",
                formatEvidenceList(result.getEvidenceItems())
        );
    }

    private String callGeminiApi(String prompt) throws Exception {
        String endpoint = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                modelName.trim(), apiKey.trim());

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(textPart));

        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(content));

        String jsonBody = objectMapper.writeValueAsString(body);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(10))
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }
        } else {
            log.warn("Gemini API HTTP {} error: {}", response.statusCode(), response.body());
        }
        return null;
    }

    private String generateFallbackExplanation(
            PersonaSummaryDto pA,
            PersonaSummaryDto pB,
            AttributionResult result,
            StylometricComparisonDto sty,
            BehavioralComparisonDto beh,
            IdentifierComparisonDto idComp,
            InfrastructureComparisonDto infraComp) {

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Deterministic multi-factor analysis indicates a %s potential linkage (Composite Score: %.2f%%) between '%s' (%s) and '%s' (%s).\n\n",
                result.getConfidenceLevel(), result.getTotalScore().doubleValue(),
                pA.getHandle(), pA.getPlatform(), pB.getHandle(), pB.getPlatform()));

        if (result.getIdentifierScore().doubleValue() > 0) {
            sb.append(String.format("• Digital Identifiers (+%.2f pts): %s\n",
                    result.getIdentifierContribution().doubleValue(),
                    idComp != null ? idComp.getAnalysisDetails() : "Matched cryptographic/wallet indicators."));
        }

        if (result.getStylometricScore().doubleValue() > 0) {
            sb.append(String.format("• Stylometry (+%.2f pts): %s\n",
                    result.getStylometricContribution().doubleValue(),
                    sty != null ? sty.getAnalysisDetails() : "Statistical vocabulary & n-gram correlation."));
        }

        if (result.getBehavioralScore().doubleValue() > 0) {
            sb.append(String.format("• Behavioral Profile (+%.2f pts): %s\n",
                    result.getBehavioralContribution().doubleValue(),
                    beh != null ? beh.getAnalysisDetails() : "Temporal active hours correlation."));
        }

        if (result.getInfrastructureScore().doubleValue() > 0) {
            sb.append(String.format("• Infrastructure Proximity (+%.2f pts): %s\n",
                    result.getInfrastructureContribution().doubleValue(),
                    infraComp != null ? infraComp.getAnalysisDetails() : "Co-located darknet infrastructure indicators."));
        }

        sb.append("\nNote: This assessment represents a potential linkage evaluated through deterministic weighted evidence. AI synthesis is pending or unavailable.");
        return sb.toString();
    }

    private String formatEvidenceList(List<EvidenceItemDto> items) {
        if (items == null || items.isEmpty()) return "None";
        StringBuilder sb = new StringBuilder();
        for (EvidenceItemDto item : items) {
            sb.append(String.format("- [%s] %s (+%.2f pts)\n",
                    item.getFactorCategory(), item.getTitle(), item.getContributionPoints().doubleValue()));
        }
        return sb.toString();
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }
}
