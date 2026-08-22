package com.sih.deanonymizer.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class BehavioralComparisonDto {
    private UUID sourcePersonaId;
    private UUID targetPersonaId;
    private BehavioralProfileDto sourceProfile;
    private BehavioralProfileDto targetProfile;
    private Double hourDistributionSimilarity;
    private Double dayDistributionSimilarity;
    private Double timezoneAlignmentScore;
    private Double eventTypeSimilarity;
    private BigDecimal overallBehavioralScore;
    private String analysisDetails;

    public BehavioralComparisonDto() {}

    public UUID getSourcePersonaId() { return sourcePersonaId; }
    public void setSourcePersonaId(UUID sourcePersonaId) { this.sourcePersonaId = sourcePersonaId; }

    public UUID getTargetPersonaId() { return targetPersonaId; }
    public void setTargetPersonaId(UUID targetPersonaId) { this.targetPersonaId = targetPersonaId; }

    public BehavioralProfileDto getSourceProfile() { return sourceProfile; }
    public void setSourceProfile(BehavioralProfileDto sourceProfile) { this.sourceProfile = sourceProfile; }

    public BehavioralProfileDto getTargetProfile() { return targetProfile; }
    public void setTargetProfile(BehavioralProfileDto targetProfile) { this.targetProfile = targetProfile; }

    public Double getHourDistributionSimilarity() { return hourDistributionSimilarity; }
    public void setHourDistributionSimilarity(Double hourDistributionSimilarity) { this.hourDistributionSimilarity = hourDistributionSimilarity; }

    public Double getDayDistributionSimilarity() { return dayDistributionSimilarity; }
    public void setDayDistributionSimilarity(Double dayDistributionSimilarity) { this.dayDistributionSimilarity = dayDistributionSimilarity; }

    public Double getTimezoneAlignmentScore() { return timezoneAlignmentScore; }
    public void setTimezoneAlignmentScore(Double timezoneAlignmentScore) { this.timezoneAlignmentScore = timezoneAlignmentScore; }

    public Double getEventTypeSimilarity() { return eventTypeSimilarity; }
    public void setEventTypeSimilarity(Double eventTypeSimilarity) { this.eventTypeSimilarity = eventTypeSimilarity; }

    public BigDecimal getOverallBehavioralScore() { return overallBehavioralScore; }
    public void setOverallBehavioralScore(BigDecimal overallBehavioralScore) { this.overallBehavioralScore = overallBehavioralScore; }

    public String getAnalysisDetails() { return analysisDetails; }
    public void setAnalysisDetails(String analysisDetails) { this.analysisDetails = analysisDetails; }
}
