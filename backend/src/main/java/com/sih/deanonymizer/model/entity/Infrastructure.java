package com.sih.deanonymizer.model.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "infrastructure")
public class Infrastructure {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "persona_id")
    private Persona persona;

    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @Column(name = "\"value\"", nullable = false, length = 500)
    private String value;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "asn", length = 100)
    private String asn;

    @Column(name = "ssl_cert_fingerprint", length = 128)
    private String sslCertFingerprint;

    @Column(name = "is_live")
    private Boolean isLive = true;

    @Column(name = "last_scanned_at")
    private OffsetDateTime lastScannedAt;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Infrastructure() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Persona getPersona() { return persona; }
    public void setPersona(Persona persona) { this.persona = persona; }

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
