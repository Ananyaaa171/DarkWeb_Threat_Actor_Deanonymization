package com.sih.deanonymizer.service;

import com.sih.deanonymizer.dto.StylometricComparisonDto;
import com.sih.deanonymizer.dto.StylometricFeaturesDto;
import com.sih.deanonymizer.service.stylometry.StylometryEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class StylometryEngineTests {

    private StylometryEngine stylometryEngine;

    @BeforeEach
    void setUp() {
        stylometryEngine = new StylometryEngine();
    }

    @Test
    void testExtractFeatures_ReproducibleAndDeterministic() {
        String sampleText = "Hello to all members. Always inspect domain trusts first before payload execution))) Contact on Tox only.";

        StylometricFeaturesDto features1 = stylometryEngine.extractFeatures(sampleText);
        StylometricFeaturesDto features2 = stylometryEngine.extractFeatures(sampleText);

        assertNotNull(features1);
        assertEquals(features1.getTtr(), features2.getTtr());
        assertEquals(features1.getYulesK(), features2.getYulesK());
        assertEquals(features1.getAvgSentenceLength(), features2.getAvgSentenceLength());
        assertEquals(features1.getAvgWordLength(), features2.getAvgWordLength());
        assertEquals(features1.getPunctuationFrequency(), features2.getPunctuationFrequency());
        assertEquals(features1.getSmileyPatternFrequency(), features2.getSmileyPatternFrequency());
        assertTrue(features1.getSmileyPatternFrequency() > 0.0, "Should detect Slavic smiley ')))'");
    }

    @Test
    void testExtractFeatures_DifferentTextsProduceDifferentFeatures() {
        String technicalRussianEnglish = "Rules: 80/20 affiliate split, custom locker builds on request, do not target CIS)))";
        String casualAmericanEnglish = "Hey guys, selling the database of major telecom company. 14 million users, PM me on Telegram!";

        StylometricFeaturesDto f1 = stylometryEngine.extractFeatures(technicalRussianEnglish);
        StylometricFeaturesDto f2 = stylometryEngine.extractFeatures(casualAmericanEnglish);

        assertNotEquals(f1.getSmileyPatternFrequency(), f2.getSmileyPatternFrequency());
        assertNotEquals(f1.getAvgSentenceLength(), f2.getAvgSentenceLength());
        assertTrue(f1.getSmileyPatternFrequency() > 0.0);
        assertEquals(0.0, f2.getSmileyPatternFrequency());
    }

    @Test
    void testCompareTexts_IdenticalTextsProduceHighScore() {
        String text = "We migrated here from old boards. rules are simple, 80/20 affiliate split, custom locker builds on request)))";

        StylometricComparisonDto comparison = stylometryEngine.compareTexts(text, text);

        assertNotNull(comparison);
        assertEquals(100.0, comparison.getOverallStylometricScore().doubleValue(), 0.01);
        assertEquals(1.0, comparison.getCharTrigramSimilarity(), 0.01);
        assertEquals(1.0, comparison.getTtrSimilarity(), 0.01);
        assertEquals(1.0, comparison.getYulesKSimilarity(), 0.01);
    }

    @Test
    void testCompareTexts_SimilarStyleProducesHighCorrelation() {
        String textA = "Always check domain controller trusts first before payload deploy. Do not touch CIS countries under any circumstances)))";
        String textB = "Never target CIS government or healthcare entities under any circumstances))) Reach out on tox or pgp verified message.";

        StylometricComparisonDto comparison = stylometryEngine.compareTexts(textA, textB);

        assertNotNull(comparison);
        assertTrue(comparison.getOverallStylometricScore().doubleValue() > 50.0, "Similar writing style should score > 50%");
        assertEquals(0.5, comparison.getSmileySimilarity(), "Both use ')))' with frequency variation based on sentence counts");
    }
}
