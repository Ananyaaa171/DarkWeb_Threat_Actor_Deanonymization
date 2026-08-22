package com.sih.deanonymizer.service;

import com.sih.deanonymizer.dto.*;
import com.sih.deanonymizer.exception.ResourceNotFoundException;
import com.sih.deanonymizer.model.entity.*;
import com.sih.deanonymizer.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ActorService {

    private final ThreatActorRepository actorRepository;
    private final PersonaRepository personaRepository;
    private final IdentifierRepository identifierRepository;
    private final InfrastructureRepository infrastructureRepository;
    private final TimelineEventRepository timelineEventRepository;
    private final DtoMapper dtoMapper;

    public ActorService(
            ThreatActorRepository actorRepository,
            PersonaRepository personaRepository,
            IdentifierRepository identifierRepository,
            InfrastructureRepository infrastructureRepository,
            TimelineEventRepository timelineEventRepository,
            DtoMapper dtoMapper) {
        this.actorRepository = actorRepository;
        this.personaRepository = personaRepository;
        this.identifierRepository = identifierRepository;
        this.infrastructureRepository = infrastructureRepository;
        this.timelineEventRepository = timelineEventRepository;
        this.dtoMapper = dtoMapper;
    }

    public PageResponse<ActorSummaryDto> getActors(String category, BigDecimal minConfidence, String query, Pageable pageable) {
        Page<ThreatActor> actorPage;
        if ((category == null || category.trim().isEmpty()) &&
            minConfidence == null &&
            (query == null || query.trim().isEmpty())) {
            actorPage = actorRepository.findAll(pageable);
        } else {
            String cat = (category != null && !category.trim().isEmpty()) ? category.trim() : null;
            String q = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
            actorPage = actorRepository.findWithFilters(cat, minConfidence, q, pageable);
        }

        List<UUID> actorIds = actorPage.getContent().stream().map(ThreatActor::getId).collect(Collectors.toList());
        List<Persona> allPersonas = actorIds.isEmpty() ? Collections.emptyList() : personaRepository.findByActorIdIn(actorIds);

        Map<UUID, List<Persona>> personasByActor = allPersonas.stream()
                .filter(p -> p.getActor() != null)
                .collect(Collectors.groupingBy(p -> p.getActor().getId()));

        List<ActorSummaryDto> dtos = actorPage.getContent().stream()
                .map(actor -> dtoMapper.toActorSummaryDto(actor, personasByActor.get(actor.getId())))
                .collect(Collectors.toList());

        return PageResponse.of(actorPage, dtos);
    }

    public ActorDetailDto getActorById(UUID id) {
        ThreatActor actor = actorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Threat Actor", id));

        List<Persona> personas = personaRepository.findByActorId(id);
        List<UUID> personaIds = personas.stream().map(Persona::getId).collect(Collectors.toList());

        List<Identifier> identifiers = personaIds.isEmpty() ? Collections.emptyList() : identifierRepository.findByPersonaIdIn(personaIds);
        List<Infrastructure> infrastructure = personaIds.isEmpty() ? Collections.emptyList() : infrastructureRepository.findByPersonaIdIn(personaIds);
        List<TimelineEvent> timelineEvents = personaIds.isEmpty() ? Collections.emptyList() : timelineEventRepository.findByPersonaIdInOrderByEventTimestampDesc(personaIds);

        ActorDetailDto dto = new ActorDetailDto();
        dto.setId(actor.getId());
        dto.setCanonicalName(actor.getCanonicalName());
        dto.setThreatCategory(actor.getThreatCategory());
        dto.setPrimaryMotive(actor.getPrimaryMotive());
        dto.setStatus(actor.getStatus());
        dto.setOverallConfidenceScore(actor.getOverallConfidenceScore());
        dto.setSummary(actor.getSummary());
        dto.setFirstObservedAt(actor.getFirstObservedAt());
        dto.setLastObservedAt(actor.getLastObservedAt());
        dto.setCreatedAt(actor.getCreatedAt());
        dto.setUpdatedAt(actor.getUpdatedAt());

        dto.setPersonas(personas.stream().map(p -> dtoMapper.toPersonaSummaryDto(p, 0, 0)).collect(Collectors.toList()));
        dto.setIdentifiers(identifiers.stream().map(dtoMapper::toIdentifierDto).collect(Collectors.toList()));
        dto.setInfrastructure(infrastructure.stream().map(dtoMapper::toInfrastructureDto).collect(Collectors.toList()));
        dto.setRecentTimeline(timelineEvents.stream().map(dtoMapper::toTimelineEventDto).collect(Collectors.toList()));

        return dto;
    }
}
