package com.sih.deanonymizer.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class TimelineEventDto {
    private UUID id;
    private UUID personaId;
    private String personaHandle;
    private UUID actorId;
    private String actorName;
    private String eventType;
    private String title;
    private String description;
    private OffsetDateTime eventTimestamp;
    private String sourceReference;
    private String severity;
    private OffsetDateTime createdAt;

    public TimelineEventDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getPersonaId() { return personaId; }
    public void setPersonaId(UUID personaId) { this.personaId = personaId; }

    public String getPersonaHandle() { return personaHandle; }
    public void setPersonaHandle(String personaHandle) { this.personaHandle = personaHandle; }

    public UUID getActorId() { return actorId; }
    public void setActorId(UUID actorId) { this.actorId = actorId; }

    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public OffsetDateTime getEventTimestamp() { return eventTimestamp; }
    public void setEventTimestamp(OffsetDateTime eventTimestamp) { this.eventTimestamp = eventTimestamp; }

    public String getSourceReference() { return sourceReference; }
    public void setSourceReference(String sourceReference) { this.sourceReference = sourceReference; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
