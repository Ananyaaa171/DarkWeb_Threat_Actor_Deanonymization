package com.sih.deanonymizer.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class PersonaDetailDto {
    private UUID id;
    private UUID actorId;
    private String actorName;
    private String handle;
    private String platform;
    private String profileUrl;
    private BigDecimal reputationScore;
    private String status;
    private String activityTimezoneEstimated;
    private OffsetDateTime firstSeenAt;
    private OffsetDateTime lastSeenAt;
    private OffsetDateTime createdAt;

    private List<IdentifierDto> identifiers = new ArrayList<>();
    private List<InfrastructureDto> infrastructure = new ArrayList<>();
    private List<TimelineEventDto> timelineEvents = new ArrayList<>();
    private List<StylometricSampleDto> stylometricSamples = new ArrayList<>();

    public PersonaDetailDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getActorId() { return actorId; }
    public void setActorId(UUID actorId) { this.actorId = actorId; }

    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }

    public String getHandle() { return handle; }
    public void setHandle(String handle) { this.handle = handle; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public String getProfileUrl() { return profileUrl; }
    public void setProfileUrl(String profileUrl) { this.profileUrl = profileUrl; }

    public BigDecimal getReputationScore() { return reputationScore; }
    public void setReputationScore(BigDecimal reputationScore) { this.reputationScore = reputationScore; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getActivityTimezoneEstimated() { return activityTimezoneEstimated; }
    public void setActivityTimezoneEstimated(String activityTimezoneEstimated) { this.activityTimezoneEstimated = activityTimezoneEstimated; }

    public OffsetDateTime getFirstSeenAt() { return firstSeenAt; }
    public void setFirstSeenAt(OffsetDateTime firstSeenAt) { this.firstSeenAt = firstSeenAt; }

    public OffsetDateTime getLastSeenAt() { return lastSeenAt; }
    public void setLastSeenAt(OffsetDateTime lastSeenAt) { this.lastSeenAt = lastSeenAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public List<IdentifierDto> getIdentifiers() { return identifiers; }
    public void setIdentifiers(List<IdentifierDto> identifiers) { this.identifiers = identifiers; }

    public List<InfrastructureDto> getInfrastructure() { return infrastructure; }
    public void setInfrastructure(List<InfrastructureDto> infrastructure) { this.infrastructure = infrastructure; }

    public List<TimelineEventDto> getTimelineEvents() { return timelineEvents; }
    public void setTimelineEvents(List<TimelineEventDto> timelineEvents) { this.timelineEvents = timelineEvents; }

    public List<StylometricSampleDto> getStylometricSamples() { return stylometricSamples; }
    public void setStylometricSamples(List<StylometricSampleDto> stylometricSamples) { this.stylometricSamples = stylometricSamples; }
}
