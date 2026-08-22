package com.sih.deanonymizer.service.scoring;

import com.sih.deanonymizer.dto.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class AttributionScoringService {

    // Approved deterministic weights (sum = 1.00)
    public static final BigDecimal WEIGHT_IDENTIFIER = new BigDecimal("0.35");
    public static final BigDecimal WEIGHT_STYLOMETRY = new BigDecimal("0.25");
    public static final BigDecimal WEIGHT_BEHAVIORAL = new BigDecimal("0.20");
    public static final BigDecimal WEIGHT_INFRASTRUCTURE = new BigDecimal("0.20");

    // Configurable confidence thresholds
    public static final double THRESHOLD_VERY_HIGH = 85.00;
    public static final double THRESHOLD_HIGH = 70.00;
    public static final double THRESHOLD_MODERATE = 40.00;

    /**
     * Calculates the deterministic attribution score and evidence breakdown.
     * S_total = (0.35 * S_id) + (0.25 * S_sty) + (0.20 * S_beh) + (0.20 * S_infra)
     */
    public AttributionResult calculateAttribution(
            BigDecimal identifierScore,
            BigDecimal stylometricScore,
            BigDecimal behavioralScore,
            BigDecimal infrastructureScore,
            IdentifierComparisonDto idComparison,
            StylometricComparisonDto styComparison,
            BehavioralComparisonDto behComparison,
            InfrastructureComparisonDto infraComparison) {

        BigDecimal sId = clampScore(identifierScore);
        BigDecimal sSty = clampScore(stylometricScore);
        BigDecimal sBeh = clampScore(behavioralScore);
        BigDecimal sInfra = clampScore(infrastructureScore);

        // Calculate individual contribution points
        BigDecimal contribId = sId.multiply(WEIGHT_IDENTIFIER).setScale(2, RoundingMode.HALF_UP);
        BigDecimal contribSty = sSty.multiply(WEIGHT_STYLOMETRY).setScale(2, RoundingMode.HALF_UP);
        BigDecimal contribBeh = sBeh.multiply(WEIGHT_BEHAVIORAL).setScale(2, RoundingMode.HALF_UP);
        BigDecimal contribInfra = sInfra.multiply(WEIGHT_INFRASTRUCTURE).setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalScore = contribId.add(contribSty).add(contribBeh).add(contribInfra)
                .setScale(2, RoundingMode.HALF_UP);

        String confidenceLevel = determineConfidenceLevel(totalScore);

        // Build individual evidence items
        List<EvidenceItemDto> evidenceItems = new ArrayList<>();

        // 1. Identifier evidence items
        if (idComparison != null && !idComparison.getMatchedIdentifiers().isEmpty()) {
            for (String match : idComparison.getMatchedIdentifiers()) {
                EvidenceItemDto item = new EvidenceItemDto();
                item.setFactorCategory("IDENTIFIER");
                item.setTitle(match);
                item.setContributionPoints(contribId);
                item.setDetails(idComparison.getAnalysisDetails());
                item.setEvidenceSnippet(match);
                item.setSource("Corroborated Digital Identifier Registry");
                item.setSourceReliability("A (Confirmed Forensic Indicator)");
                evidenceItems.add(item);
            }
        } else {
            EvidenceItemDto item = new EvidenceItemDto();
            item.setFactorCategory("IDENTIFIER");
            item.setTitle("No Direct Identifier Match");
            item.setContributionPoints(BigDecimal.ZERO);
            item.setDetails("No shared PGP keys, cryptocurrency deposit addresses, or contact handles discovered.");
            evidenceItems.add(item);
        }

        // 2. Stylometry evidence item
        EvidenceItemDto styItem = new EvidenceItemDto();
        styItem.setFactorCategory("STYLOMETRY");
        styItem.setTitle(String.format("Statistical Stylometric Alignment (Score: %.1f%%)", sSty.doubleValue()));
        styItem.setContributionPoints(contribSty);
        styItem.setDetails(styComparison != null ? styComparison.getAnalysisDetails() : "Stylometric feature similarity.");
        if (styComparison != null && styComparison.getCharTrigramSimilarity() != null) {
            styItem.setEvidenceSnippet(String.format("Trigram Cosine: %.1f%%, TTR Sim: %.1f%%, Punctuation Sim: %.1f%%, Slavic Smiley Sim: %.1f%%",
                    styComparison.getCharTrigramSimilarity() * 100.0,
                    styComparison.getTtrSimilarity() * 100.0,
                    styComparison.getPunctuationSimilarity() * 100.0,
                    styComparison.getSmileySimilarity() * 100.0));
        }
        evidenceItems.add(styItem);

        // 3. Behavioral evidence item
        EvidenceItemDto behItem = new EvidenceItemDto();
        behItem.setFactorCategory("BEHAVIOR");
        behItem.setTitle(String.format("Temporal & Operational Profile (Score: %.1f%%)", sBeh.doubleValue()));
        behItem.setContributionPoints(contribBeh);
        behItem.setDetails(behComparison != null ? behComparison.getAnalysisDetails() : "Behavioral temporal pattern correlation.");
        if (behComparison != null && behComparison.getTimezoneAlignmentScore() != null) {
            behItem.setEvidenceSnippet(String.format("Timezone Sim: %.1f%%, Hour Histogram Cosine: %.1f%%, Modus Operandi Overlap: %.1f%%",
                    behComparison.getTimezoneAlignmentScore() * 100.0,
                    behComparison.getHourDistributionSimilarity() * 100.0,
                    behComparison.getEventTypeSimilarity() * 100.0));
        }
        evidenceItems.add(behItem);

        // 4. Infrastructure evidence items
        if (infraComparison != null && !infraComparison.getMatchedInfrastructure().isEmpty()) {
            for (String match : infraComparison.getMatchedInfrastructure()) {
                EvidenceItemDto item = new EvidenceItemDto();
                item.setFactorCategory("INFRASTRUCTURE");
                item.setTitle(match);
                item.setContributionPoints(contribInfra);
                item.setDetails(infraComparison.getAnalysisDetails());
                item.setEvidenceSnippet(match);
                item.setSource("Darknet Infrastructure Monitor");
                item.setSourceReliability("B (Observed Mirror / Certificate Correlation)");
                evidenceItems.add(item);
            }
        } else {
            EvidenceItemDto item = new EvidenceItemDto();
            item.setFactorCategory("INFRASTRUCTURE");
            item.setTitle("No Infrastructure Co-location");
            item.setContributionPoints(BigDecimal.ZERO);
            item.setDetails("No shared onion services, backend IP addresses, or SSL certificates identified.");
            evidenceItems.add(item);
        }

        return new AttributionResult(
                sId, sSty, sBeh, sInfra,
                contribId, contribSty, contribBeh, contribInfra,
                totalScore, confidenceLevel, evidenceItems
        );
    }

    public String determineConfidenceLevel(BigDecimal score) {
        if (score == null) return "LOW";
        double val = score.doubleValue();
        if (val >= THRESHOLD_VERY_HIGH) return "VERY_HIGH";
        if (val >= THRESHOLD_HIGH) return "HIGH";
        if (val >= THRESHOLD_MODERATE) return "MODERATE";
        return "LOW";
    }

    private BigDecimal clampScore(BigDecimal score) {
        if (score == null) return BigDecimal.ZERO;
        if (score.compareTo(BigDecimal.ZERO) < 0) return BigDecimal.ZERO;
        if (score.compareTo(BigDecimal.valueOf(100)) > 0) return BigDecimal.valueOf(100);
        return score.setScale(2, RoundingMode.HALF_UP);
    }

    public static class AttributionResult {
        private final BigDecimal identifierScore;
        private final BigDecimal stylometricScore;
        private final BigDecimal behavioralScore;
        private final BigDecimal infrastructureScore;
        private final BigDecimal identifierContribution;
        private final BigDecimal stylometricContribution;
        private final BigDecimal behavioralContribution;
        private final BigDecimal infrastructureContribution;
        private final BigDecimal totalScore;
        private final String confidenceLevel;
        private final List<EvidenceItemDto> evidenceItems;

        public AttributionResult(
                BigDecimal identifierScore, BigDecimal stylometricScore,
                BigDecimal behavioralScore, BigDecimal infrastructureScore,
                BigDecimal identifierContribution, BigDecimal stylometricContribution,
                BigDecimal behavioralContribution, BigDecimal infrastructureContribution,
                BigDecimal totalScore, String confidenceLevel,
                List<EvidenceItemDto> evidenceItems) {
            this.identifierScore = identifierScore;
            this.stylometricScore = stylometricScore;
            this.behavioralScore = behavioralScore;
            this.infrastructureScore = infrastructureScore;
            this.identifierContribution = identifierContribution;
            this.stylometricContribution = stylometricContribution;
            this.behavioralContribution = behavioralContribution;
            this.infrastructureContribution = infrastructureContribution;
            this.totalScore = totalScore;
            this.confidenceLevel = confidenceLevel;
            this.evidenceItems = evidenceItems;
        }

        public BigDecimal getIdentifierScore() { return identifierScore; }
        public BigDecimal getStylometricScore() { return stylometricScore; }
        public BigDecimal getBehavioralScore() { return behavioralScore; }
        public BigDecimal getInfrastructureScore() { return infrastructureScore; }
        public BigDecimal getIdentifierContribution() { return identifierContribution; }
        public BigDecimal getStylometricContribution() { return stylometricContribution; }
        public BigDecimal getBehavioralContribution() { return behavioralContribution; }
        public BigDecimal getInfrastructureContribution() { return infrastructureContribution; }
        public BigDecimal getTotalScore() { return totalScore; }
        public String getConfidenceLevel() { return confidenceLevel; }
        public List<EvidenceItemDto> getEvidenceItems() { return evidenceItems; }
    }
}
