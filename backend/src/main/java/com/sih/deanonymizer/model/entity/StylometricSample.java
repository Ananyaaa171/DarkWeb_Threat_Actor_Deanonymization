package com.sih.deanonymizer.model.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "stylometric_samples")
public class StylometricSample {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "persona_id", nullable = false)
    private Persona persona;

    @Column(name = "sample_title", nullable = false, length = 200)
    private String sampleTitle;

    @Column(name = "raw_text", nullable = false, columnDefinition = "TEXT")
    private String rawText;

    @Column(name = "clean_text", columnDefinition = "TEXT")
    private String cleanText;

    @Column(name = "token_count")
    private Integer tokenCount = 0;

    @Column(name = "lexical_metrics", columnDefinition = "JSONB")
    private String lexicalMetrics = "{}";

    @Column(name = "collected_at", updatable = false)
    private OffsetDateTime collectedAt = OffsetDateTime.now();

    public StylometricSample() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Persona getPersona() { return persona; }
    public void setPersona(Persona persona) { this.persona = persona; }

    public String getSampleTitle() { return sampleTitle; }
    public void setSampleTitle(String sampleTitle) { this.sampleTitle = sampleTitle; }

    public String getRawText() { return rawText; }
    public void setRawText(String rawText) { this.rawText = rawText; }

    public String getCleanText() { return cleanText; }
    public void setCleanText(String cleanText) { this.cleanText = cleanText; }

    public Integer getTokenCount() { return tokenCount; }
    public void setTokenCount(Integer tokenCount) { this.tokenCount = tokenCount; }

    public String getLexicalMetrics() { return lexicalMetrics; }
    public void setLexicalMetrics(String lexicalMetrics) { this.lexicalMetrics = lexicalMetrics; }

    public OffsetDateTime getCollectedAt() { return collectedAt; }
    public void setCollectedAt(OffsetDateTime collectedAt) { this.collectedAt = collectedAt; }
}
