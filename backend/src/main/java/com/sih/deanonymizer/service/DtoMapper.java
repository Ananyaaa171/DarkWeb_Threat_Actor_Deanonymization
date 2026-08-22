package com.sih.deanonymizer.service;

import com.sih.deanonymizer.dto.*;
import com.sih.deanonymizer.model.entity.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class DtoMapper {

    public ActorSummaryDto toActorSummaryDto(ThreatActor actor, List<Persona> personas) {
        ActorSummaryDto dto = new ActorSummaryDto();
        dto.setId(actor.getId());
        dto.setCanonicalName(actor.getCanonicalName());
        dto.setThreatCategory(actor.getThreatCategory());
        dto.setPrimaryMotive(actor.getPrimaryMotive());
        dto.setStatus(actor.getStatus());
        dto.setOverallConfidenceScore(actor.getOverallConfidenceScore());
        dto.setSummary(actor.getSummary());
        dto.setFirstObservedAt(actor.getFirstObservedAt());
        dto.setLastObservedAt(actor.getLastObservedAt());

        if (personas != null) {
            dto.setPersonaCount(personas.size());
            dto.setAssociatedHandles(personas.stream().map(Persona::getHandle).collect(Collectors.toList()));
        } else {
            dto.setPersonaCount(0);
            dto.setAssociatedHandles(Collections.emptyList());
        }
        return dto;
    }

    public PersonaSummaryDto toPersonaSummaryDto(Persona persona, int identifierCount, int sampleCount) {
        PersonaSummaryDto dto = new PersonaSummaryDto();
        dto.setId(persona.getId());
        if (persona.getActor() != null) {
            dto.setActorId(persona.getActor().getId());
            dto.setActorName(persona.getActor().getCanonicalName());
        }
        dto.setHandle(persona.getHandle());
        dto.setPlatform(persona.getPlatform());
        dto.setProfileUrl(persona.getProfileUrl());
        dto.setReputationScore(persona.getReputationScore());
        dto.setStatus(persona.getStatus());
        dto.setActivityTimezoneEstimated(persona.getActivityTimezoneEstimated());
        dto.setFirstSeenAt(persona.getFirstSeenAt());
        dto.setLastSeenAt(persona.getLastSeenAt());
        dto.setIdentifierCount(identifierCount);
        dto.setSampleCount(sampleCount);
        return dto;
    }

    public IdentifierDto toIdentifierDto(Identifier identifier) {
        IdentifierDto dto = new IdentifierDto();
        dto.setId(identifier.getId());
        if (identifier.getPersona() != null) {
            dto.setPersonaId(identifier.getPersona().getId());
            dto.setPersonaHandle(identifier.getPersona().getHandle());
        }
        dto.setType(identifier.getType());
        dto.setValue(identifier.getValue());
        dto.setMetadata(identifier.getMetadata());
        dto.setIsVerified(identifier.getIsVerified());
        dto.setFirstSeenAt(identifier.getFirstSeenAt());
        dto.setCreatedAt(identifier.getCreatedAt());
        return dto;
    }

    public InfrastructureDto toInfrastructureDto(Infrastructure infra) {
        InfrastructureDto dto = new InfrastructureDto();
        dto.setId(infra.getId());
        if (infra.getPersona() != null) {
            dto.setPersonaId(infra.getPersona().getId());
            dto.setPersonaHandle(infra.getPersona().getHandle());
        }
        dto.setType(infra.getType());
        dto.setValue(infra.getValue());
        dto.setIpAddress(infra.getIpAddress());
        dto.setAsn(infra.getAsn());
        dto.setSslCertFingerprint(infra.getSslCertFingerprint());
        dto.setIsLive(infra.getIsLive());
        dto.setLastScannedAt(infra.getLastScannedAt());
        dto.setCreatedAt(infra.getCreatedAt());
        return dto;
    }

    public StylometricSampleDto toStylometricSampleDto(StylometricSample sample) {
        StylometricSampleDto dto = new StylometricSampleDto();
        dto.setId(sample.getId());
        if (sample.getPersona() != null) {
            dto.setPersonaId(sample.getPersona().getId());
            dto.setPersonaHandle(sample.getPersona().getHandle());
        }
        dto.setSampleTitle(sample.getSampleTitle());
        dto.setRawText(sample.getRawText());
        dto.setCleanText(sample.getCleanText());
        dto.setTokenCount(sample.getTokenCount());
        dto.setLexicalMetrics(sample.getLexicalMetrics());
        dto.setCollectedAt(sample.getCollectedAt());
        return dto;
    }

    public TimelineEventDto toTimelineEventDto(TimelineEvent event) {
        TimelineEventDto dto = new TimelineEventDto();
        dto.setId(event.getId());
        if (event.getPersona() != null) {
            dto.setPersonaId(event.getPersona().getId());
            dto.setPersonaHandle(event.getPersona().getHandle());
            if (event.getPersona().getActor() != null) {
                dto.setActorId(event.getPersona().getActor().getId());
                dto.setActorName(event.getPersona().getActor().getCanonicalName());
            }
        }
        dto.setEventType(event.getEventType());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setEventTimestamp(event.getEventTimestamp());
        dto.setSourceReference(event.getSourceReference());
        dto.setSeverity(event.getSeverity());
        dto.setCreatedAt(event.getCreatedAt());
        return dto;
    }

    public EvidenceItemDto toEvidenceItemDto(EvidenceItem item) {
        EvidenceItemDto dto = new EvidenceItemDto();
        dto.setId(item.getId());
        if (item.getLinkage() != null) {
            dto.setLinkageId(item.getLinkage().getId());
        }
        dto.setFactorCategory(item.getFactorCategory());
        dto.setTitle(item.getTitle());
        dto.setContributionPoints(item.getContributionPoints());
        dto.setDetails(item.getDetails());
        dto.setEvidenceSnippet(item.getEvidenceSnippet());
        dto.setSource("Demonstration Threat Intelligence Feed");
        dto.setSourceReliability("A (Confirmed Open Source Intelligence)");
        dto.setObservationDate(item.getCreatedAt());
        dto.setCreatedAt(item.getCreatedAt());
        return dto;
    }

    public LinkageAnalysisDto toLinkageAnalysisDto(LinkageAnalysis linkage, List<EvidenceItem> evidenceItems) {
        LinkageAnalysisDto dto = new LinkageAnalysisDto();
        dto.setId(linkage.getId());
        if (linkage.getSourcePersona() != null) {
            dto.setSourcePersona(toPersonaSummaryDto(linkage.getSourcePersona(), 0, 0));
        }
        if (linkage.getTargetPersona() != null) {
            dto.setTargetPersona(toPersonaSummaryDto(linkage.getTargetPersona(), 0, 0));
        }
        dto.setAttributionScore(linkage.getAttributionScore());
        dto.setConfidenceLevel(linkage.getConfidenceLevel());
        dto.setIdentifierScore(linkage.getIdentifierScore());
        dto.setStylometricScore(linkage.getStylometricScore());
        dto.setBehavioralScore(linkage.getBehavioralScore());
        dto.setInfrastructureScore(linkage.getInfrastructureScore());
        dto.setAiExplanationSummary(linkage.getAiExplanationSummary());
        dto.setAnalystReviewStatus(linkage.getAnalystReviewStatus());
        dto.setComputedAt(linkage.getComputedAt());

        if (evidenceItems != null) {
            dto.setEvidenceItems(evidenceItems.stream().map(this::toEvidenceItemDto).collect(Collectors.toList()));
        }
        return dto;
    }
}
