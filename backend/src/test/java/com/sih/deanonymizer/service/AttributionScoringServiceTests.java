package com.sih.deanonymizer.service;

import com.sih.deanonymizer.service.scoring.AttributionScoringService;
import com.sih.deanonymizer.service.scoring.AttributionScoringService.AttributionResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

public class AttributionScoringServiceTests {

    private AttributionScoringService scoringService;

    @BeforeEach
    void setUp() {
        scoringService = new AttributionScoringService();
    }

    @Test
    void testExactFormulaCalculation_KnownValues() {
        // Known values:
        // S_id = 95.00  -> Contrib (35%): 33.25
        // S_sty = 88.00 -> Contrib (25%): 22.00
        // S_beh = 85.00 -> Contrib (20%): 17.00
        // S_infra = 86.25 -> Contrib (20%): 17.25
        // Total = 33.25 + 22.00 + 17.00 + 17.25 = 89.50 (VERY_HIGH)
        BigDecimal sId = new BigDecimal("95.00");
        BigDecimal sSty = new BigDecimal("88.00");
        BigDecimal sBeh = new BigDecimal("85.00");
        BigDecimal sInfra = new BigDecimal("86.25");

        AttributionResult result = scoringService.calculateAttribution(
                sId, sSty, sBeh, sInfra, null, null, null, null);

        assertNotNull(result);
        assertEquals(new BigDecimal("33.25"), result.getIdentifierContribution());
        assertEquals(new BigDecimal("22.00"), result.getStylometricContribution());
        assertEquals(new BigDecimal("17.00"), result.getBehavioralContribution());
        assertEquals(new BigDecimal("17.25"), result.getInfrastructureContribution());
        assertEquals(new BigDecimal("89.50"), result.getTotalScore());
        assertEquals("VERY_HIGH", result.getConfidenceLevel());
    }

    @Test
    void testConfidenceBands() {
        assertEquals("VERY_HIGH", scoringService.determineConfidenceLevel(new BigDecimal("85.00")));
        assertEquals("VERY_HIGH", scoringService.determineConfidenceLevel(new BigDecimal("95.50")));
        assertEquals("HIGH", scoringService.determineConfidenceLevel(new BigDecimal("70.00")));
        assertEquals("HIGH", scoringService.determineConfidenceLevel(new BigDecimal("84.99")));
        assertEquals("MODERATE", scoringService.determineConfidenceLevel(new BigDecimal("40.00")));
        assertEquals("MODERATE", scoringService.determineConfidenceLevel(new BigDecimal("69.99")));
        assertEquals("LOW", scoringService.determineConfidenceLevel(new BigDecimal("39.99")));
        assertEquals("LOW", scoringService.determineConfidenceLevel(new BigDecimal("0.00")));
    }

    @Test
    void testBoundaryClamping_ZeroAndHundred() {
        // All zero
        AttributionResult zeroResult = scoringService.calculateAttribution(
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, null, null, null, null);
        assertEquals(new BigDecimal("0.00"), zeroResult.getTotalScore());
        assertEquals("LOW", zeroResult.getConfidenceLevel());

        // All 100
        AttributionResult fullResult = scoringService.calculateAttribution(
                new BigDecimal("100.00"), new BigDecimal("100.00"),
                new BigDecimal("100.00"), new BigDecimal("100.00"), null, null, null, null);
        assertEquals(new BigDecimal("100.00"), fullResult.getTotalScore());
        assertEquals("VERY_HIGH", fullResult.getConfidenceLevel());
    }
}
