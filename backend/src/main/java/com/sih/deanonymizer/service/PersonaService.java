package com.sih.deanonymizer.service;

import com.sih.deanonymizer.dto.PersonaDetailDto;
import com.sih.deanonymizer.exception.ResourceNotFoundException;
import com.sih.deanonymizer.model.entity.*;
import com.sih.deanonymizer.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PersonaService {

    private final PersonaRepository personaRepository;
    private final IdentifierRepository identifierRepository;
    private final InfrastructureRepository infrastructureRepository;
    private final TimelineEventRepository timelineEventRepository;
    private final StylometricSampleRepository stylometricSampleRepository;
    private final DtoMapper dtoMapper;

    public PersonaService(
            PersonaRepository personaRepository,
            IdentifierRepository identifierRepository,
            InfrastructureRepository infrastructureRepository,
            TimelineEventRepository timelineEventRepository,
            StylometricSampleRepository stylometricSampleRepository,
            DtoMapper dtoMapper) {
        this.personaRepository = personaRepository;
        this.identifierRepository = identifierRepository;
        this.infrastructureRepository = infrastructureRepository;
        this.timelineEventRepository = timelineEventRepository;
        this.stylometricSampleRepository = stylometricSampleRepository;
        this.dtoMapper = dtoMapper;
    }

    public PersonaDetailDto getPersonaById(UUID id) {
        Persona persona = personaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Persona", id));

        List<Identifier> identifiers = identifierRepository.findByPersonaId(id);
        List<Infrastructure> infrastructure = infrastructureRepository.findByPersonaId(id);
        List<TimelineEvent> timelineEvents = timelineEventRepository.findByPersonaIdOrderByEventTimestampDesc(id);
        List<StylometricSample> samples = stylometricSampleRepository.findByPersonaId(id);

        PersonaDetailDto dto = new PersonaDetailDto();
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
        dto.setCreatedAt(persona.getCreatedAt());

        dto.setIdentifiers(identifiers.stream().map(dtoMapper::toIdentifierDto).collect(Collectors.toList()));
        dto.setInfrastructure(infrastructure.stream().map(dtoMapper::toInfrastructureDto).collect(Collectors.toList()));
        dto.setTimelineEvents(timelineEvents.stream().map(dtoMapper::toTimelineEventDto).collect(Collectors.toList()));
        dto.setStylometricSamples(samples.stream().map(dtoMapper::toStylometricSampleDto).collect(Collectors.toList()));

        return dto;
    }
}
