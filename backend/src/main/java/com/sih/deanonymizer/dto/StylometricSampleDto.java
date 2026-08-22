package com.sih.deanonymizer.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class StylometricSampleDto {
    private UUID id;
    private UUID personaId;
    private String personaHandle;
    private String sampleTitle;
    private String rawText;
    private String cleanText;
    private Integer tokenCount;
    private String lexicalMetrics;
    private OffsetDateTime collectedAt;

    public StylometricSampleDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getPersonaId() { return personaId; }
    public void setPersonaId(UUID personaId) { this.personaId = personaId; }

    public String getPersonaHandle() { return personaHandle; }
    public void setPersonaHandle(String personaHandle) { this.personaHandle = personaHandle; }

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
