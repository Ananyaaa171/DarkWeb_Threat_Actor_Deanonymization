package com.sih.deanonymizer.model.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "personas", uniqueConstraints = {
    @UniqueConstraint(name = "uq_persona_handle_platform", columnNames = {"handle", "platform"})
})
public class Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private ThreatActor actor;

    @Column(name = "handle", nullable = false, length = 100)
    private String handle;

    @Column(name = "platform", nullable = false, length = 100)
    private String platform;

    @Column(name = "profile_url", length = 500)
    private String profileUrl;

    @Column(name = "reputation_score", precision = 5, scale = 2)
    private BigDecimal reputationScore = BigDecimal.ZERO;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "ACTIVE";

    @Column(name = "activity_timezone_estimated", length = 50)
    private String activityTimezoneEstimated;

    @Column(name = "first_seen_at")
    private OffsetDateTime firstSeenAt;

    @Column(name = "last_seen_at")
    private OffsetDateTime lastSeenAt;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Persona() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public ThreatActor getActor() { return actor; }
    public void setActor(ThreatActor actor) { this.actor = actor; }

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
}
