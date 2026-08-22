package com.sih.deanonymizer.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class IdentifierDto {
    private UUID id;
    private UUID personaId;
    private String personaHandle;
    private String type;
    private String value;
    private String metadata;
    private Boolean isVerified;
    private OffsetDateTime firstSeenAt;
    private OffsetDateTime createdAt;

    public IdentifierDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getPersonaId() { return personaId; }
    public void setPersonaId(UUID personaId) { this.personaId = personaId; }

    public String getPersonaHandle() { return personaHandle; }
    public void setPersonaHandle(String personaHandle) { this.personaHandle = personaHandle; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public OffsetDateTime getFirstSeenAt() { return firstSeenAt; }
    public void setFirstSeenAt(OffsetDateTime firstSeenAt) { this.firstSeenAt = firstSeenAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
