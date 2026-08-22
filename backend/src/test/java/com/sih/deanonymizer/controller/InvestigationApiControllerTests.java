package com.sih.deanonymizer.controller;

import com.sih.deanonymizer.model.entity.*;
import com.sih.deanonymizer.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class InvestigationApiControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ThreatActorRepository actorRepository;

    @Autowired
    private PersonaRepository personaRepository;

    @Autowired
    private IdentifierRepository identifierRepository;

    @Autowired
    private InfrastructureRepository infrastructureRepository;

    @Autowired
    private StylometricSampleRepository stylometricSampleRepository;

    @Autowired
    private LinkageAnalysisRepository linkageAnalysisRepository;

    @Autowired
    private EvidenceItemRepository evidenceItemRepository;

    @Autowired
    private TimelineEventRepository timelineEventRepository;

    private ThreatActor testActor;
    private Persona testPersona1;
    private Persona testPersona2;
    private Identifier testIdentifier;
    private Infrastructure testInfra;
    private LinkageAnalysis testLinkage;
    private EvidenceItem testEvidence;
    private TimelineEvent testEvent;

    @BeforeEach
    void setUp() {
        evidenceItemRepository.deleteAll();
        linkageAnalysisRepository.deleteAll();
        timelineEventRepository.deleteAll();
        stylometricSampleRepository.deleteAll();
        infrastructureRepository.deleteAll();
        identifierRepository.deleteAll();
        personaRepository.deleteAll();
        actorRepository.deleteAll();

        // 1. Create Actor
        testActor = new ThreatActor();
        testActor.setCanonicalName("LockBit Syndicate Core");
        testActor.setThreatCategory("RANSOMWARE");
        testActor.setPrimaryMotive("FINANCIAL");
        testActor.setStatus("ACTIVE");
        testActor.setOverallConfidenceScore(new BigDecimal("92.50"));
        testActor.setSummary("High profile RaaS group");
        testActor.setFirstObservedAt(OffsetDateTime.now().minusDays(100));
        testActor.setLastObservedAt(OffsetDateTime.now());
        testActor = actorRepository.save(testActor);

        // 2. Create Persona 1
        testPersona1 = new Persona();
        testPersona1.setActor(testActor);
        testPersona1.setHandle("bassterlord_xss");
        testPersona1.setPlatform("XSS.is");
        testPersona1.setReputationScore(new BigDecimal("98.50"));
        testPersona1.setStatus("MIGRATED");
        testPersona1.setActivityTimezoneEstimated("UTC+3 (MSK)");
        testPersona1.setFirstSeenAt(OffsetDateTime.now().minusDays(90));
        testPersona1.setLastSeenAt(OffsetDateTime.now().minusDays(30));
        testPersona1 = personaRepository.save(testPersona1);

        // 3. Create Persona 2
        testPersona2 = new Persona();
        testPersona2.setActor(testActor);
        testPersona2.setHandle("basster_rampv2");
        testPersona2.setPlatform("Ramp Forum");
        testPersona2.setReputationScore(new BigDecimal("94.00"));
        testPersona2.setStatus("ACTIVE");
        testPersona2.setActivityTimezoneEstimated("UTC+3 (MSK)");
        testPersona2.setFirstSeenAt(OffsetDateTime.now().minusDays(29));
        testPersona2.setLastSeenAt(OffsetDateTime.now());
        testPersona2 = personaRepository.save(testPersona2);

        // 4. Create Identifier
        testIdentifier = new Identifier();
        testIdentifier.setPersona(testPersona1);
        testIdentifier.setType("PGP_FINGERPRINT");
        testIdentifier.setValue("94F8 2B31 8AC4 701E D5E2 1198 4A72 B5C1 09E8 33DF");
        testIdentifier.setMetadata("{\"subkey_id\": \"0x4A72B5C1\"}");
        testIdentifier.setIsVerified(true);
        testIdentifier.setFirstSeenAt(OffsetDateTime.now().minusDays(80));
        testIdentifier = identifierRepository.save(testIdentifier);

        // 5. Create Infrastructure
        testInfra = new Infrastructure();
        testInfra.setPersona(testPersona1);
        testInfra.setType("ONION_V3");
        testInfra.setValue("http://lockbit7z275w3k3jshv5729fksu627ahskd8276f5skdl27f6sjd8.onion");
        testInfra.setIpAddress("185.220.101.44");
        testInfra.setAsn("AS200651 Flokinet Ltd");
        testInfra.setIsLive(true);
        testInfra.setLastScannedAt(OffsetDateTime.now());
        testInfra = infrastructureRepository.save(testInfra);

        // 6. Create Stylometric Sample
        StylometricSample sample = new StylometricSample();
        sample.setPersona(testPersona1);
        sample.setSampleTitle("XSS Post #412");
        sample.setRawText("Always inspect domain trusts first before payload execution)))");
        sample.setCleanText("always inspect domain trusts first before payload execution");
        sample.setTokenCount(8);
        sample.setLexicalMetrics("{\"ttr\": 0.85}");
        stylometricSampleRepository.save(sample);

        // 7. Create Linkage Analysis
        testLinkage = new LinkageAnalysis();
        testLinkage.setSourcePersona(testPersona1);
        testLinkage.setTargetPersona(testPersona2);
        testLinkage.setAttributionScore(new BigDecimal("89.50"));
        testLinkage.setConfidenceLevel("HIGH");
        testLinkage.setIdentifierScore(new BigDecimal("95.00"));
        testLinkage.setStylometricScore(new BigDecimal("88.00"));
        testLinkage.setBehavioralScore(new BigDecimal("85.00"));
        testLinkage.setInfrastructureScore(new BigDecimal("86.25"));
        testLinkage.setAiExplanationSummary("High probability migration sharing PGP subkey 0x4A72B5C1");
        testLinkage.setAnalystReviewStatus("CONFIRMED");
        testLinkage = linkageAnalysisRepository.save(testLinkage);

        // 8. Create Evidence Item
        testEvidence = new EvidenceItem();
        testEvidence.setLinkage(testLinkage);
        testEvidence.setFactorCategory("IDENTIFIER");
        testEvidence.setTitle("Matching PGP Subkey ID 0x4A72B5C1");
        testEvidence.setContributionPoints(new BigDecimal("33.25"));
        testEvidence.setDetails("Key fingerprint matches exactly across both user profiles");
        testEvidence.setEvidenceSnippet("PGP Fingerprint: 94F8 2B31...");
        testEvidence = evidenceItemRepository.save(testEvidence);

        // 9. Create Timeline Event
        testEvent = new TimelineEvent();
        testEvent.setPersona(testPersona1);
        testEvent.setEventType("FORUM_POST");
        testEvent.setTitle("Account Registered on XSS.is");
        testEvent.setDescription("Initial registration of handle bassterlord_xss");
        testEvent.setEventTimestamp(OffsetDateTime.now().minusDays(90));
        testEvent.setSourceReference("XSS.is Forum Archive");
        testEvent.setSeverity("INFO");
        testEvent = timelineEventRepository.save(testEvent);
    }

    @Test
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("Dark Web Deanonymizer Backend"))
                .andExpect(jsonPath("$.aiArchitecture.geminiModel").exists());
    }

    @Test
    void testGetActorsList() throws Exception {
        mockMvc.perform(get("/api/v1/actors")
                        .param("category", "RANSOMWARE")
                        .param("minConfidence", "50")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].canonicalName").value("LockBit Syndicate Core"))
                .andExpect(jsonPath("$.content[0].threatCategory").value("RANSOMWARE"))
                .andExpect(jsonPath("$.content[0].personaCount").value(2))
                .andExpect(jsonPath("$.content[0].associatedHandles", hasItems("bassterlord_xss", "basster_rampv2")));
    }

    @Test
    void testGetActorById() throws Exception {
        mockMvc.perform(get("/api/v1/actors/{id}", testActor.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testActor.getId().toString()))
                .andExpect(jsonPath("$.canonicalName").value("LockBit Syndicate Core"))
                .andExpect(jsonPath("$.personas", hasSize(2)))
                .andExpect(jsonPath("$.identifiers", hasSize(1)))
                .andExpect(jsonPath("$.infrastructure", hasSize(1)))
                .andExpect(jsonPath("$.recentTimeline", hasSize(1)));
    }

    @Test
    void testGetActorById_NotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        mockMvc.perform(get("/api/v1/actors/{id}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void testGetPersonaById() throws Exception {
        mockMvc.perform(get("/api/v1/personas/{id}", testPersona1.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testPersona1.getId().toString()))
                .andExpect(jsonPath("$.handle").value("bassterlord_xss"))
                .andExpect(jsonPath("$.platform").value("XSS.is"))
                .andExpect(jsonPath("$.identifiers", hasSize(1)))
                .andExpect(jsonPath("$.infrastructure", hasSize(1)))
                .andExpect(jsonPath("$.stylometricSamples", hasSize(1)))
                .andExpect(jsonPath("$.timelineEvents", hasSize(1)));
    }

    @Test
    void testGetPersonaById_NotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        mockMvc.perform(get("/api/v1/personas/{id}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void testSearchEndpoint() throws Exception {
        // Search by handle
        mockMvc.perform(get("/api/v1/search").param("q", "bassterlord"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].resultType").value("PERSONA"))
                .andExpect(jsonPath("$[0].displayName").value("bassterlord_xss"));

        // Search by wallet/pgp value
        mockMvc.perform(get("/api/v1/search").param("q", "94F8 2B31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].resultType").value("IDENTIFIER"));

        // Search by actor name
        mockMvc.perform(get("/api/v1/search").param("q", "LockBit"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].resultType").value("ACTOR"));
    }

    @Test
    void testTimelineEndpoints() throws Exception {
        // Actor timeline
        mockMvc.perform(get("/api/v1/timeline/actor/{id}", testActor.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].title").value("Account Registered on XSS.is"));

        // Persona timeline
        mockMvc.perform(get("/api/v1/timeline/persona/{id}", testPersona1.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].title").value("Account Registered on XSS.is"));
    }

    @Test
    void testRelationshipGraphEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/actors/{id}/relationships", testActor.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nodes", hasSize(greaterThanOrEqualTo(4)))) // Actor, Persona1, Persona2, Identifier, Infra
                .andExpect(jsonPath("$.edges", hasSize(greaterThanOrEqualTo(4)))) // Controls (x2), UsesId, OperatesInfra, MigratedTo
                .andExpect(jsonPath("$.nodes[?(@.type == 'ACTOR')].label", hasItem("LockBit Syndicate Core")))
                .andExpect(jsonPath("$.edges[?(@.relationship == 'MIGRATED_TO')].confidence", hasItem(0.90)));
    }

    @Test
    void testLinkageAndEvidenceEndpoints() throws Exception {
        // Linkage detail
        mockMvc.perform(get("/api/v1/linkages/{id}", testLinkage.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testLinkage.getId().toString()))
                .andExpect(jsonPath("$.attributionScore").value(89.50))
                .andExpect(jsonPath("$.confidenceLevel").value("HIGH"))
                .andExpect(jsonPath("$.evidenceItems", hasSize(1)))
                .andExpect(jsonPath("$.evidenceItems[0].title").value("Matching PGP Subkey ID 0x4A72B5C1"));

        // Evidence by linkage ID
        mockMvc.perform(get("/api/v1/evidence/linkage/{linkageId}", testLinkage.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].factorCategory").value("IDENTIFIER"))
                .andExpect(jsonPath("$[0].contributionPoints").value(33.25));
    }

    @Test
    void testInvalidParameterFormat_ReturnsBadRequest() throws Exception {
        // Invalid UUID format
        mockMvc.perform(get("/api/v1/actors/{id}", "not-a-valid-uuid"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Invalid Parameter Format"));
    }
}
