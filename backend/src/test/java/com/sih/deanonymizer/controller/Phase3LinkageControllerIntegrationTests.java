package com.sih.deanonymizer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.deanonymizer.dto.LinkageComputeRequest;
import com.sih.deanonymizer.dto.StylometryCompareRequest;
import com.sih.deanonymizer.model.entity.Persona;
import com.sih.deanonymizer.model.entity.StylometricSample;
import com.sih.deanonymizer.model.entity.ThreatActor;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class Phase3LinkageControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ThreatActorRepository actorRepository;

    @Autowired
    private PersonaRepository personaRepository;

    @Autowired
    private IdentifierRepository identifierRepository;

    @Autowired
    private InfrastructureRepository infrastructureRepository;

    @Autowired
    private TimelineEventRepository timelineEventRepository;

    @Autowired
    private StylometricSampleRepository stylometricSampleRepository;

    @Autowired
    private LinkageAnalysisRepository linkageAnalysisRepository;

    @Autowired
    private EvidenceItemRepository evidenceItemRepository;

    private Persona persona1;
    private Persona persona2;

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

        ThreatActor actor = new ThreatActor();
        actor.setCanonicalName("LockBit Syndicate");
        actor.setThreatCategory("RANSOMWARE");
        actor.setStatus("ACTIVE");
        actor = actorRepository.save(actor);

        persona1 = new Persona();
        persona1.setActor(actor);
        persona1.setHandle("bassterlord_xss");
        persona1.setPlatform("XSS.is");
        persona1.setStatus("MIGRATED");
        persona1.setActivityTimezoneEstimated("UTC+3 (MSK)");
        persona1 = personaRepository.save(persona1);

        persona2 = new Persona();
        persona2.setActor(actor);
        persona2.setHandle("basster_rampv2");
        persona2.setPlatform("Ramp Forum");
        persona2.setStatus("ACTIVE");
        persona2.setActivityTimezoneEstimated("UTC+3 (MSK)");
        persona2 = personaRepository.save(persona2);

        StylometricSample sample1 = new StylometricSample();
        sample1.setPersona(persona1);
        sample1.setSampleTitle("Post 1");
        sample1.setRawText("Always inspect domain trusts first before payload deploy. Do not touch CIS countries under any circumstances)))");
        stylometricSampleRepository.save(sample1);

        StylometricSample sample2 = new StylometricSample();
        sample2.setPersona(persona2);
        sample2.setSampleTitle("Post 2");
        sample2.setRawText("Never target CIS government entities under any circumstances))) Reach out on tox or pgp verified message.");
        stylometricSampleRepository.save(sample2);
    }

    @Test
    void testCompareStylometry_DirectTexts() throws Exception {
        StylometryCompareRequest request = new StylometryCompareRequest();
        request.setTextA("Always inspect domain trusts first before payload deploy)))");
        request.setTextB("Never target CIS infrastructure under any circumstances)))");

        mockMvc.perform(post("/api/v1/stylometry/compare")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overallStylometricScore").exists())
                .andExpect(jsonPath("$.smileySimilarity").value(1.0))
                .andExpect(jsonPath("$.charTrigramSimilarity").exists());
    }

    @Test
    void testCompareStylometry_PersonaIds() throws Exception {
        StylometryCompareRequest request = new StylometryCompareRequest();
        request.setSourcePersonaId(persona1.getId());
        request.setTargetPersonaId(persona2.getId());

        mockMvc.perform(post("/api/v1/stylometry/compare")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sourcePersonaId").value(persona1.getId().toString()))
                .andExpect(jsonPath("$.targetPersonaId").value(persona2.getId().toString()))
                .andExpect(jsonPath("$.overallStylometricScore").exists());
    }

    @Test
    void testComputeLinkage_FullPipeline() throws Exception {
        LinkageComputeRequest request = new LinkageComputeRequest();
        request.setSourcePersonaId(persona1.getId());
        request.setTargetPersonaId(persona2.getId());
        request.setIncludeAiExplanation(true);

        mockMvc.perform(post("/api/v1/linkages/compute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.attributionScore").exists())
                .andExpect(jsonPath("$.confidenceLevel").exists())
                .andExpect(jsonPath("$.identifierScore").exists())
                .andExpect(jsonPath("$.stylometricScore").exists())
                .andExpect(jsonPath("$.behavioralScore").exists())
                .andExpect(jsonPath("$.infrastructureScore").exists())
                .andExpect(jsonPath("$.aiExplanationSummary").exists())
                .andExpect(jsonPath("$.evidenceItems", hasSize(greaterThanOrEqualTo(3))));
    }

    @Test
    void testComputeLinkage_SamePersona_ReturnsBadRequest() throws Exception {
        LinkageComputeRequest request = new LinkageComputeRequest();
        request.setSourcePersonaId(persona1.getId());
        request.setTargetPersonaId(persona1.getId());

        mockMvc.perform(post("/api/v1/linkages/compute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void testComputeLinkage_MissingPersona_ReturnsNotFound() throws Exception {
        LinkageComputeRequest request = new LinkageComputeRequest();
        request.setSourcePersonaId(persona1.getId());
        request.setTargetPersonaId(UUID.randomUUID());

        mockMvc.perform(post("/api/v1/linkages/compute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
