package com.sih.deanonymizer.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class InfrastructureDto {
    private UUID id;
    private UUID personaId;
    private String personaHandle;
    private String type;
    private String value;
    private String ipAddress;
    private String asn;
    private String sslCertFingerprint;
    private Boolean isLive;
    private OffsetDateTime lastScannedAt;
    private OffsetDateTime createdAt;

    public InfrastructureDto() {}

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

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getAsn() { return asn; }
    public void setAsn(String asn) { this.asn = asn; }

    public String getSslCertFingerprint() { return sslCertFingerprint; }
    public void setSslCertFingerprint(String sslCertFingerprint) { this.sslCertFingerprint = sslCertFingerprint; }

    public Boolean getIsLive() { return isLive; }
    public void setIsLive(Boolean isLive) { this.isLive = isLive; }

    public OffsetDateTime getLastScannedAt() { return lastScannedAt; }
    public void setLastScannedAt(OffsetDateTime lastScannedAt) { this.lastScannedAt = lastScannedAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
