package com.sih.deanonymizer.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class EvidenceItemDto {
    private UUID id;
    private UUID linkageId;
    private String factorCategory;
    private String title;
    private BigDecimal contributionPoints;
    private String details;
    private String evidenceSnippet;
    private String source;
    private String sourceReliability;
    private OffsetDateTime observationDate;
    private OffsetDateTime createdAt;

    public EvidenceItemDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getLinkageId() { return linkageId; }
    public void setLinkageId(UUID linkageId) { this.linkageId = linkageId; }

    public String getFactorCategory() { return factorCategory; }
    public void setFactorCategory(String factorCategory) { this.factorCategory = factorCategory; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public BigDecimal getContributionPoints() { return contributionPoints; }
    public void setContributionPoints(BigDecimal contributionPoints) { this.contributionPoints = contributionPoints; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getEvidenceSnippet() { return evidenceSnippet; }
    public void setEvidenceSnippet(String evidenceSnippet) { this.evidenceSnippet = evidenceSnippet; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getSourceReliability() { return sourceReliability; }
    public void setSourceReliability(String sourceReliability) { this.sourceReliability = sourceReliability; }

    public OffsetDateTime getObservationDate() { return observationDate; }
    public void setObservationDate(OffsetDateTime observationDate) { this.observationDate = observationDate; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
