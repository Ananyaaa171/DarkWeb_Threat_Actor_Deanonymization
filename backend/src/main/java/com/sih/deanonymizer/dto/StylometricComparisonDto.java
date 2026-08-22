package com.sih.deanonymizer.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class StylometricComparisonDto {
    private UUID sourcePersonaId;
    private UUID targetPersonaId;
    private StylometricFeaturesDto sourceFeatures;
    private StylometricFeaturesDto targetFeatures;
    private Double ttrSimilarity;
    private Double yulesKSimilarity;
    private Double charTrigramSimilarity;
    private Double punctuationSimilarity;
    private Double sentenceLengthSimilarity;
    private Double wordLengthSimilarity;
    private Double smileySimilarity;
    private Double functionWordSimilarity;
    private BigDecimal overallStylometricScore;
    private String analysisDetails;

    public StylometricComparisonDto() {}

    public UUID getSourcePersonaId() { return sourcePersonaId; }
    public void setSourcePersonaId(UUID sourcePersonaId) { this.sourcePersonaId = sourcePersonaId; }

    public UUID getTargetPersonaId() { return targetPersonaId; }
    public void setTargetPersonaId(UUID targetPersonaId) { this.targetPersonaId = targetPersonaId; }

    public StylometricFeaturesDto getSourceFeatures() { return sourceFeatures; }
    public void setSourceFeatures(StylometricFeaturesDto sourceFeatures) { this.sourceFeatures = sourceFeatures; }

    public StylometricFeaturesDto getTargetFeatures() { return targetFeatures; }
    public void setTargetFeatures(StylometricFeaturesDto targetFeatures) { this.targetFeatures = targetFeatures; }

    public Double getTtrSimilarity() { return ttrSimilarity; }
    public void setTtrSimilarity(Double ttrSimilarity) { this.ttrSimilarity = ttrSimilarity; }

    public Double getYulesKSimilarity() { return yulesKSimilarity; }
    public void setYulesKSimilarity(Double yulesKSimilarity) { this.yulesKSimilarity = yulesKSimilarity; }

    public Double getCharTrigramSimilarity() { return charTrigramSimilarity; }
    public void setCharTrigramSimilarity(Double charTrigramSimilarity) { this.charTrigramSimilarity = charTrigramSimilarity; }

    public Double getPunctuationSimilarity() { return punctuationSimilarity; }
    public void setPunctuationSimilarity(Double punctuationSimilarity) { this.punctuationSimilarity = punctuationSimilarity; }

    public Double getSentenceLengthSimilarity() { return sentenceLengthSimilarity; }
    public void setSentenceLengthSimilarity(Double sentenceLengthSimilarity) { this.sentenceLengthSimilarity = sentenceLengthSimilarity; }

    public Double getWordLengthSimilarity() { return wordLengthSimilarity; }
    public void setWordLengthSimilarity(Double wordLengthSimilarity) { this.wordLengthSimilarity = wordLengthSimilarity; }

    public Double getSmileySimilarity() { return smileySimilarity; }
    public void setSmileySimilarity(Double smileySimilarity) { this.smileySimilarity = smileySimilarity; }

    public Double getFunctionWordSimilarity() { return functionWordSimilarity; }
    public void setFunctionWordSimilarity(Double functionWordSimilarity) { this.functionWordSimilarity = functionWordSimilarity; }

    public BigDecimal getOverallStylometricScore() { return overallStylometricScore; }
    public void setOverallStylometricScore(BigDecimal overallStylometricScore) { this.overallStylometricScore = overallStylometricScore; }

    public String getAnalysisDetails() { return analysisDetails; }
    public void setAnalysisDetails(String analysisDetails) { this.analysisDetails = analysisDetails; }
}
