package com.sih.deanonymizer.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class LinkageAnalysisDto {
    private UUID id;
    private PersonaSummaryDto sourcePersona;
    private PersonaSummaryDto targetPersona;
    private BigDecimal attributionScore;
    private String confidenceLevel;
    private BigDecimal identifierScore;
    private BigDecimal stylometricScore;
    private BigDecimal behavioralScore;
    private BigDecimal infrastructureScore;
    private String aiExplanationSummary;
    private String analystReviewStatus;
    private OffsetDateTime computedAt;

    private List<EvidenceItemDto> evidenceItems = new ArrayList<>();

    public LinkageAnalysisDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public PersonaSummaryDto getSourcePersona() { return sourcePersona; }
    public void setSourcePersona(PersonaSummaryDto sourcePersona) { this.sourcePersona = sourcePersona; }

    public PersonaSummaryDto getTargetPersona() { return targetPersona; }
    public void setTargetPersona(PersonaSummaryDto targetPersona) { this.targetPersona = targetPersona; }

    public BigDecimal getAttributionScore() { return attributionScore; }
    public void setAttributionScore(BigDecimal attributionScore) { this.attributionScore = attributionScore; }

    public String getConfidenceLevel() { return confidenceLevel; }
    public void setConfidenceLevel(String confidenceLevel) { this.confidenceLevel = confidenceLevel; }

    public BigDecimal getIdentifierScore() { return identifierScore; }
    public void setIdentifierScore(BigDecimal identifierScore) { this.identifierScore = identifierScore; }

    public BigDecimal getStylometricScore() { return stylometricScore; }
    public void setStylometricScore(BigDecimal stylometricScore) { this.stylometricScore = stylometricScore; }

    public BigDecimal getBehavioralScore() { return behavioralScore; }
    public void setBehavioralScore(BigDecimal behavioralScore) { this.behavioralScore = behavioralScore; }

    public BigDecimal getInfrastructureScore() { return infrastructureScore; }
    public void setInfrastructureScore(BigDecimal infrastructureScore) { this.infrastructureScore = infrastructureScore; }

    public String getAiExplanationSummary() { return aiExplanationSummary; }
    public void setAiExplanationSummary(String aiExplanationSummary) { this.aiExplanationSummary = aiExplanationSummary; }

    public String getAnalystReviewStatus() { return analystReviewStatus; }
    public void setAnalystReviewStatus(String analystReviewStatus) { this.analystReviewStatus = analystReviewStatus; }

    public OffsetDateTime getComputedAt() { return computedAt; }
    public void setComputedAt(OffsetDateTime computedAt) { this.computedAt = computedAt; }

    public List<EvidenceItemDto> getEvidenceItems() { return evidenceItems; }
    public void setEvidenceItems(List<EvidenceItemDto> evidenceItems) { this.evidenceItems = evidenceItems; }
}
