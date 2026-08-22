package com.sih.deanonymizer.model.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "linkage_analysis", uniqueConstraints = {
    @UniqueConstraint(name = "uq_persona_linkage_pair", columnNames = {"source_persona_id", "target_persona_id"})
})
public class LinkageAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_persona_id", nullable = false)
    private Persona sourcePersona;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_persona_id", nullable = false)
    private Persona targetPersona;

    @Column(name = "attribution_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal attributionScore;

    @Column(name = "confidence_level", nullable = false, length = 20)
    private String confidenceLevel;

    @Column(name = "identifier_score", precision = 5, scale = 2)
    private BigDecimal identifierScore = BigDecimal.ZERO;

    @Column(name = "stylometric_score", precision = 5, scale = 2)
    private BigDecimal stylometricScore = BigDecimal.ZERO;

    @Column(name = "behavioral_score", precision = 5, scale = 2)
    private BigDecimal behavioralScore = BigDecimal.ZERO;

    @Column(name = "infrastructure_score", precision = 5, scale = 2)
    private BigDecimal infrastructureScore = BigDecimal.ZERO;

    @Column(name = "ai_explanation_summary", columnDefinition = "TEXT")
    private String aiExplanationSummary;

    @Column(name = "analyst_review_status", length = 30)
    private String analystReviewStatus = "PENDING";

    @Column(name = "computed_at", updatable = false)
    private OffsetDateTime computedAt = OffsetDateTime.now();

    public LinkageAnalysis() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Persona getSourcePersona() { return sourcePersona; }
    public void setSourcePersona(Persona sourcePersona) { this.sourcePersona = sourcePersona; }

    public Persona getTargetPersona() { return targetPersona; }
    public void setTargetPersona(Persona targetPersona) { this.targetPersona = targetPersona; }

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
}
