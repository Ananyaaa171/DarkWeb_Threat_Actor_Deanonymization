package com.sih.deanonymizer.service;

import com.sih.deanonymizer.dto.PageResponse;
import com.sih.deanonymizer.dto.TimelineEventDto;
import com.sih.deanonymizer.exception.ResourceNotFoundException;
import com.sih.deanonymizer.model.entity.Persona;
import com.sih.deanonymizer.model.entity.TimelineEvent;
import com.sih.deanonymizer.repository.PersonaRepository;
import com.sih.deanonymizer.repository.ThreatActorRepository;
import com.sih.deanonymizer.repository.TimelineEventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class TimelineService {

    private final ThreatActorRepository actorRepository;
    private final PersonaRepository personaRepository;
    private final TimelineEventRepository timelineEventRepository;
    private final DtoMapper dtoMapper;

    public TimelineService(
            ThreatActorRepository actorRepository,
            PersonaRepository personaRepository,
            TimelineEventRepository timelineEventRepository,
            DtoMapper dtoMapper) {
        this.actorRepository = actorRepository;
        this.personaRepository = personaRepository;
        this.timelineEventRepository = timelineEventRepository;
        this.dtoMapper = dtoMapper;
    }

    public PageResponse<TimelineEventDto> getActorTimeline(
            UUID actorId, OffsetDateTime startDate, OffsetDateTime endDate, Pageable pageable) {
        if (!actorRepository.existsById(actorId)) {
            throw new ResourceNotFoundException("Threat Actor", actorId);
        }

        List<Persona> personas = personaRepository.findByActorId(actorId);
        if (personas.isEmpty()) {
            return PageResponse.of(new PageImpl<>(Collections.emptyList(), pageable, 0));
        }

        List<UUID> personaIds = personas.stream().map(Persona::getId).collect(Collectors.toList());
        Page<TimelineEvent> eventPage = timelineEventRepository.findByPersonaIdsWithFilters(
                personaIds, startDate, endDate, pageable);

        List<TimelineEventDto> dtos = eventPage.getContent().stream()
                .map(dtoMapper::toTimelineEventDto)
                .collect(Collectors.toList());

        return PageResponse.of(eventPage, dtos);
    }

    public PageResponse<TimelineEventDto> getPersonaTimeline(
            UUID personaId, OffsetDateTime startDate, OffsetDateTime endDate, Pageable pageable) {
        if (!personaRepository.existsById(personaId)) {
            throw new ResourceNotFoundException("Persona", personaId);
        }

        Page<TimelineEvent> eventPage = timelineEventRepository.findByPersonaIdWithFilters(
                personaId, startDate, endDate, pageable);

        List<TimelineEventDto> dtos = eventPage.getContent().stream()
                .map(dtoMapper::toTimelineEventDto)
                .collect(Collectors.toList());

        return PageResponse.of(eventPage, dtos);
    }
}
