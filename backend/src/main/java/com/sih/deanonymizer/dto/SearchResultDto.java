package com.sih.deanonymizer.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class SearchResultDto {
    private String resultType; // ACTOR, PERSONA, IDENTIFIER, INFRASTRUCTURE
    private UUID entityId;
    private String displayName;
    private String secondaryText;
    private UUID actorId;
    private String actorName;
    private UUID personaId;
    private String personaHandle;
    private String category;
    private BigDecimal confidence;
    private OffsetDateTime lastObservedAt;
    private Map<String, Object> metadata = new HashMap<>();

    public SearchResultDto() {}

    public SearchResultDto(String resultType, UUID entityId, String displayName, String secondaryText) {
        this.resultType = resultType;
        this.entityId = entityId;
        this.displayName = displayName;
        this.secondaryText = secondaryText;
    }

    public String getResultType() { return resultType; }
    public void setResultType(String resultType) { this.resultType = resultType; }

    public UUID getEntityId() { return entityId; }
    public void setEntityId(UUID entityId) { this.entityId = entityId; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getSecondaryText() { return secondaryText; }
    public void setSecondaryText(String secondaryText) { this.secondaryText = secondaryText; }

    public UUID getActorId() { return actorId; }
    public void setActorId(UUID actorId) { this.actorId = actorId; }

    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }

    public UUID getPersonaId() { return personaId; }
    public void setPersonaId(UUID personaId) { this.personaId = personaId; }

    public String getPersonaHandle() { return personaHandle; }
    public void setPersonaHandle(String personaHandle) { this.personaHandle = personaHandle; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getConfidence() { return confidence; }
    public void setConfidence(BigDecimal confidence) { this.confidence = confidence; }

    public OffsetDateTime getLastObservedAt() { return lastObservedAt; }
    public void setLastObservedAt(OffsetDateTime lastObservedAt) { this.lastObservedAt = lastObservedAt; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
}
