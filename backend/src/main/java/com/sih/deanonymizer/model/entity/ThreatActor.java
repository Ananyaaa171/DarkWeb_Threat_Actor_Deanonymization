package com.sih.deanonymizer.model.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "threat_actors")
public class ThreatActor {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "canonical_name", nullable = false, unique = true, length = 100)
    private String canonicalName;

    @Column(name = "threat_category", nullable = false, length = 50)
    private String threatCategory;

    @Column(name = "primary_motive", length = 50)
    private String primaryMotive = "FINANCIAL";

    @Column(name = "status", nullable = false, length = 30)
    private String status = "ACTIVE";

    @Column(name = "overall_confidence_score", precision = 5, scale = 2)
    private BigDecimal overallConfidenceScore = BigDecimal.ZERO;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "first_observed_at")
    private OffsetDateTime firstObservedAt;

    @Column(name = "last_observed_at")
    private OffsetDateTime lastObservedAt;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public ThreatActor() {}

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
}
