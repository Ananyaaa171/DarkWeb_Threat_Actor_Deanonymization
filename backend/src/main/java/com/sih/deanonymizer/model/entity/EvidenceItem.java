package com.sih.deanonymizer.model.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "evidence_items")
public class EvidenceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linkage_id", nullable = false)
    private LinkageAnalysis linkage;

    @Column(name = "factor_category", nullable = false, length = 50)
    private String factorCategory;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "contribution_points", precision = 5, scale = 2)
    private BigDecimal contributionPoints = BigDecimal.ZERO;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "evidence_snippet", columnDefinition = "TEXT")
    private String evidenceSnippet;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public EvidenceItem() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public LinkageAnalysis getLinkage() { return linkage; }
    public void setLinkage(LinkageAnalysis linkage) { this.linkage = linkage; }

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

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
