package com.sih.deanonymizer.service;

import com.sih.deanonymizer.dto.SearchResultDto;
import com.sih.deanonymizer.model.entity.*;
import com.sih.deanonymizer.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class SearchService {

    private final ThreatActorRepository actorRepository;
    private final PersonaRepository personaRepository;
    private final IdentifierRepository identifierRepository;
    private final InfrastructureRepository infrastructureRepository;

    public SearchService(
            ThreatActorRepository actorRepository,
            PersonaRepository personaRepository,
            IdentifierRepository identifierRepository,
            InfrastructureRepository infrastructureRepository) {
        this.actorRepository = actorRepository;
        this.personaRepository = personaRepository;
        this.identifierRepository = identifierRepository;
        this.infrastructureRepository = infrastructureRepository;
    }

    public List<SearchResultDto> search(String query, String type, String category, OffsetDateTime startDate, OffsetDateTime endDate) {
        List<SearchResultDto> results = new ArrayList<>();
        if (query == null || query.trim().isEmpty()) {
            return results;
        }

        String q = query.trim();
        String normalizedType = (type != null && !type.trim().isEmpty()) ? type.trim().toUpperCase() : "ALL";

        // 1. Search Threat Actors
        if ("ALL".equals(normalizedType) || "ACTOR".equals(normalizedType)) {
            List<ThreatActor> matchingActors = actorRepository.findByCanonicalNameContainingIgnoreCase(q);
            for (ThreatActor actor : matchingActors) {
                if (category != null && !category.trim().isEmpty() && !actor.getThreatCategory().equalsIgnoreCase(category.trim())) {
                    continue;
                }
                SearchResultDto dto = new SearchResultDto("ACTOR", actor.getId(), actor.getCanonicalName(), actor.getSummary());
                dto.setActorId(actor.getId());
                dto.setActorName(actor.getCanonicalName());
                dto.setCategory(actor.getThreatCategory());
                dto.setConfidence(actor.getOverallConfidenceScore());
                dto.setLastObservedAt(actor.getLastObservedAt());
                dto.getMetadata().put("status", actor.getStatus());
                dto.getMetadata().put("motive", actor.getPrimaryMotive());
                results.add(dto);
            }
        }

        // 2. Search Personas
        if ("ALL".equals(normalizedType) || "PERSONA".equals(normalizedType)) {
            List<Persona> matchingPersonas = personaRepository.findByHandleContainingIgnoreCase(q);
            for (Persona persona : matchingPersonas) {
                if (category != null && !category.trim().isEmpty() &&
                    persona.getActor() != null &&
                    !persona.getActor().getThreatCategory().equalsIgnoreCase(category.trim())) {
                    continue;
                }
                SearchResultDto dto = new SearchResultDto("PERSONA", persona.getId(), persona.getHandle(), "Platform: " + persona.getPlatform());
                dto.setPersonaId(persona.getId());
                dto.setPersonaHandle(persona.getHandle());
                if (persona.getActor() != null) {
                    dto.setActorId(persona.getActor().getId());
                    dto.setActorName(persona.getActor().getCanonicalName());
                    dto.setCategory(persona.getActor().getThreatCategory());
                }
                dto.setConfidence(persona.getReputationScore());
                dto.setLastObservedAt(persona.getLastSeenAt());
                dto.getMetadata().put("platform", persona.getPlatform());
                dto.getMetadata().put("status", persona.getStatus());
                dto.getMetadata().put("timezone", persona.getActivityTimezoneEstimated());
                results.add(dto);
            }
        }

        // 3. Search Identifiers
        if ("ALL".equals(normalizedType) || "IDENTIFIER".equals(normalizedType)) {
            List<Identifier> matchingIdentifiers = identifierRepository.findByValueContainingIgnoreCase(q);
            for (Identifier id : matchingIdentifiers) {
                SearchResultDto dto = new SearchResultDto("IDENTIFIER", id.getId(), id.getValue(), "Type: " + id.getType());
                if (id.getPersona() != null) {
                    dto.setPersonaId(id.getPersona().getId());
                    dto.setPersonaHandle(id.getPersona().getHandle());
                    if (id.getPersona().getActor() != null) {
                        dto.setActorId(id.getPersona().getActor().getId());
                        dto.setActorName(id.getPersona().getActor().getCanonicalName());
                        dto.setCategory(id.getPersona().getActor().getThreatCategory());
                    }
                }
                dto.setLastObservedAt(id.getFirstSeenAt());
                dto.getMetadata().put("identifierType", id.getType());
                dto.getMetadata().put("isVerified", id.getIsVerified());
                results.add(dto);
            }
        }

        // 4. Search Infrastructure
        if ("ALL".equals(normalizedType) || "INFRASTRUCTURE".equals(normalizedType)) {
            List<Infrastructure> matchingInfra = infrastructureRepository.findByValueContainingIgnoreCase(q);
            for (Infrastructure infra : matchingInfra) {
                SearchResultDto dto = new SearchResultDto("INFRASTRUCTURE", infra.getId(), infra.getValue(), "Type: " + infra.getType());
                if (infra.getPersona() != null) {
                    dto.setPersonaId(infra.getPersona().getId());
                    dto.setPersonaHandle(infra.getPersona().getHandle());
                    if (infra.getPersona().getActor() != null) {
                        dto.setActorId(infra.getPersona().getActor().getId());
                        dto.setActorName(infra.getPersona().getActor().getCanonicalName());
                        dto.setCategory(infra.getPersona().getActor().getThreatCategory());
                    }
                }
                dto.setLastObservedAt(infra.getLastScannedAt());
                dto.getMetadata().put("infraType", infra.getType());
                dto.getMetadata().put("ipAddress", infra.getIpAddress());
                dto.getMetadata().put("asn", infra.getAsn());
                dto.getMetadata().put("isLive", infra.getIsLive());
                results.add(dto);
            }
        }

        return results;
    }
}
