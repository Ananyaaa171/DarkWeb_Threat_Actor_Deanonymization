package com.sih.deanonymizer.service;

import com.sih.deanonymizer.dto.*;
import com.sih.deanonymizer.exception.BadRequestException;
import com.sih.deanonymizer.exception.ResourceNotFoundException;
import com.sih.deanonymizer.model.entity.EvidenceItem;
import com.sih.deanonymizer.model.entity.LinkageAnalysis;
import com.sih.deanonymizer.model.entity.Persona;
import com.sih.deanonymizer.repository.EvidenceItemRepository;
import com.sih.deanonymizer.repository.LinkageAnalysisRepository;
import com.sih.deanonymizer.repository.PersonaRepository;
import com.sih.deanonymizer.service.ai.GeminiExplanationService;
import com.sih.deanonymizer.service.scoring.AttributionScoringService;
import com.sih.deanonymizer.service.scoring.AttributionScoringService.AttributionResult;
import com.sih.deanonymizer.service.scoring.BehavioralAnalysisService;
import com.sih.deanonymizer.service.scoring.IdentifierAnalysisService;
import com.sih.deanonymizer.service.scoring.InfrastructureAnalysisService;
import com.sih.deanonymizer.service.stylometry.StylometryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LinkageService {

    private final LinkageAnalysisRepository linkageAnalysisRepository;
    private final EvidenceItemRepository evidenceItemRepository;
    private final PersonaRepository personaRepository;
    private final StylometryService stylometryService;
    private final BehavioralAnalysisService behavioralAnalysisService;
    private final IdentifierAnalysisService identifierAnalysisService;
    private final InfrastructureAnalysisService infrastructureAnalysisService;
    private final AttributionScoringService attributionScoringService;
    private final GeminiExplanationService geminiExplanationService;
    private final DtoMapper dtoMapper;

    public LinkageService(
            LinkageAnalysisRepository linkageAnalysisRepository,
            EvidenceItemRepository evidenceItemRepository,
            PersonaRepository personaRepository,
            StylometryService stylometryService,
            BehavioralAnalysisService behavioralAnalysisService,
            IdentifierAnalysisService identifierAnalysisService,
            InfrastructureAnalysisService infrastructureAnalysisService,
            AttributionScoringService attributionScoringService,
            GeminiExplanationService geminiExplanationService,
            DtoMapper dtoMapper) {
        this.linkageAnalysisRepository = linkageAnalysisRepository;
        this.evidenceItemRepository = evidenceItemRepository;
        this.personaRepository = personaRepository;
        this.stylometryService = stylometryService;
        this.behavioralAnalysisService = behavioralAnalysisService;
        this.identifierAnalysisService = identifierAnalysisService;
        this.infrastructureAnalysisService = infrastructureAnalysisService;
        this.attributionScoringService = attributionScoringService;
        this.geminiExplanationService = geminiExplanationService;
        this.dtoMapper = dtoMapper;
    }

    @Transactional(readOnly = true)
    public LinkageAnalysisDto getLinkageById(UUID id) {
        LinkageAnalysis linkage = linkageAnalysisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Linkage Analysis", id));

        List<EvidenceItem> evidenceItems = evidenceItemRepository.findByLinkageId(id);
        return dtoMapper.toLinkageAnalysisDto(linkage, evidenceItems);
    }

    @Transactional(readOnly = true)
    public List<EvidenceItemDto> getEvidenceByLinkageId(UUID linkageId) {
        if (!linkageAnalysisRepository.existsById(linkageId)) {
            throw new ResourceNotFoundException("Linkage Analysis", linkageId);
        }

        List<EvidenceItem> items = evidenceItemRepository.findByLinkageId(linkageId);
        return items.stream()
                .map(dtoMapper::toEvidenceItemDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public LinkageAnalysisDto computeLinkage(UUID sourcePersonaId, UUID targetPersonaId, Boolean includeAiExplanation) {
        if (sourcePersonaId == null || targetPersonaId == null) {
            throw new BadRequestException("Both sourcePersonaId and targetPersonaId must be provided.");
        }
        if (sourcePersonaId.equals(targetPersonaId)) {
            throw new BadRequestException("Cannot compute linkage between a persona and itself.");
        }

        Persona sourcePersona = personaRepository.findById(sourcePersonaId)
                .orElseThrow(() -> new ResourceNotFoundException("Source Persona", sourcePersonaId));
        Persona targetPersona = personaRepository.findById(targetPersonaId)
                .orElseThrow(() -> new ResourceNotFoundException("Target Persona", targetPersonaId));

        // 1. Run component analysis
        StylometricComparisonDto styComparison = stylometryService.comparePersonas(sourcePersonaId, targetPersonaId);
        BehavioralComparisonDto behComparison = behavioralAnalysisService.comparePersonas(sourcePersonaId, targetPersonaId);
        IdentifierComparisonDto idComparison = identifierAnalysisService.compareIdentifiers(sourcePersonaId, targetPersonaId);
        InfrastructureComparisonDto infraComparison = infrastructureAnalysisService.compareInfrastructure(sourcePersonaId, targetPersonaId);

        // 2. Deterministic 4-factor scoring
        AttributionResult scoringResult = attributionScoringService.calculateAttribution(
                idComparison.getOverallIdentifierScore(),
                styComparison.getOverallStylometricScore(),
                behComparison.getOverallBehavioralScore(),
                infraComparison.getOverallInfrastructureScore(),
                idComparison, styComparison, behComparison, infraComparison
        );

        // 3. AI Explanation Synthesis (with graceful fallback)
        String aiExplanation = null;
        if (includeAiExplanation == null || includeAiExplanation) {
            PersonaSummaryDto pADto = dtoMapper.toPersonaSummaryDto(sourcePersona, 0, 0);
            PersonaSummaryDto pBDto = dtoMapper.toPersonaSummaryDto(targetPersona, 0, 0);
            aiExplanation = geminiExplanationService.generateExplanation(
                    pADto, pBDto, scoringResult,
                    styComparison, behComparison, idComparison, infraComparison
            );
        }

        // 4. Save or update LinkageAnalysis record in database
        Optional<LinkageAnalysis> existingOpt = linkageAnalysisRepository.findBySourcePersonaIdAndTargetPersonaId(sourcePersonaId, targetPersonaId);
        LinkageAnalysis linkage = existingOpt.orElseGet(LinkageAnalysis::new);

        linkage.setSourcePersona(sourcePersona);
        linkage.setTargetPersona(targetPersona);
        linkage.setAttributionScore(scoringResult.getTotalScore());
        linkage.setConfidenceLevel(scoringResult.getConfidenceLevel());
        linkage.setIdentifierScore(scoringResult.getIdentifierScore());
        linkage.setStylometricScore(scoringResult.getStylometricScore());
        linkage.setBehavioralScore(scoringResult.getBehavioralScore());
        linkage.setInfrastructureScore(scoringResult.getInfrastructureScore());
        linkage.setAiExplanationSummary(aiExplanation);
        linkage.setAnalystReviewStatus("PENDING");
        linkage.setComputedAt(OffsetDateTime.now());

        linkage = linkageAnalysisRepository.save(linkage);

        // 5. Persist evidence items
        if (existingOpt.isPresent()) {
            List<EvidenceItem> oldItems = evidenceItemRepository.findByLinkageId(linkage.getId());
            evidenceItemRepository.deleteAll(oldItems);
        }

        List<EvidenceItem> savedEvidence = new ArrayList<>();
        for (EvidenceItemDto itemDto : scoringResult.getEvidenceItems()) {
            EvidenceItem item = new EvidenceItem();
            item.setLinkage(linkage);
            item.setFactorCategory(itemDto.getFactorCategory());
            item.setTitle(itemDto.getTitle());
            item.setContributionPoints(itemDto.getContributionPoints());
            item.setDetails(itemDto.getDetails());
            item.setEvidenceSnippet(itemDto.getEvidenceSnippet());
            savedEvidence.add(evidenceItemRepository.save(item));
        }

        return dtoMapper.toLinkageAnalysisDto(linkage, savedEvidence);
    }
}
