package com.sih.deanonymizer.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ActorDetailDto {
    private UUID id;
    private String canonicalName;
    private String threatCategory;
    private String primaryMotive;
    private String status;
    private BigDecimal overallConfidenceScore;
    private String summary;
    private OffsetDateTime firstObservedAt;
    private OffsetDateTime lastObservedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private List<PersonaSummaryDto> personas = new ArrayList<>();
    private List<IdentifierDto> identifiers = new ArrayList<>();
    private List<InfrastructureDto> infrastructure = new ArrayList<>();
    private List<TimelineEventDto> recentTimeline = new ArrayList<>();

    public ActorDetailDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCanonicalName() { return canonicalName; }
    public void setCanonicalName(String canonicalName) { this.canonicalName = canonicalName; }

    public String getThreatCategory() { return threatCategory; }
    public void setThreatCategory(String threatCategory) { this.threatCategory = threatCategory; }

    public String getPrimaryMotive() { return primaryMotive; }
    public void setPrimaryMotive(String primaryMotive) { this.primaryMotive = primaryMotive; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getOverallConfidenceScore() { return overallConfidenceScore; }
    public void setOverallConfidenceScore(BigDecimal overallConfidenceScore) { this.overallConfidenceScore = overallConfidenceScore; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public OffsetDateTime getFirstObservedAt() { return firstObservedAt; }
    public void setFirstObservedAt(OffsetDateTime firstObservedAt) { this.firstObservedAt = firstObservedAt; }

    public OffsetDateTime getLastObservedAt() { return lastObservedAt; }
    public void setLastObservedAt(OffsetDateTime lastObservedAt) { this.lastObservedAt = lastObservedAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<PersonaSummaryDto> getPersonas() { return personas; }
    public void setPersonas(List<PersonaSummaryDto> personas) { this.personas = personas; }

    public List<IdentifierDto> getIdentifiers() { return identifiers; }
    public void setIdentifiers(List<IdentifierDto> identifiers) { this.identifiers = identifiers; }

    public List<InfrastructureDto> getInfrastructure() { return infrastructure; }
    public void setInfrastructure(List<InfrastructureDto> infrastructure) { this.infrastructure = infrastructure; }

    public List<TimelineEventDto> getRecentTimeline() { return recentTimeline; }
    public void setRecentTimeline(List<TimelineEventDto> recentTimeline) { this.recentTimeline = recentTimeline; }
}
