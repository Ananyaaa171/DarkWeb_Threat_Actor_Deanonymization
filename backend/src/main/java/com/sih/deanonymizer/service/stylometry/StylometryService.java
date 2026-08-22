package com.sih.deanonymizer.service.stylometry;

import com.sih.deanonymizer.dto.StylometricComparisonDto;
import com.sih.deanonymizer.exception.ResourceNotFoundException;
import com.sih.deanonymizer.model.entity.Persona;
import com.sih.deanonymizer.model.entity.StylometricSample;
import com.sih.deanonymizer.repository.PersonaRepository;
import com.sih.deanonymizer.repository.StylometricSampleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class StylometryService {

    private final StylometryEngine stylometryEngine;
    private final PersonaRepository personaRepository;
    private final StylometricSampleRepository stylometricSampleRepository;

    public StylometryService(
            StylometryEngine stylometryEngine,
            PersonaRepository personaRepository,
            StylometricSampleRepository stylometricSampleRepository) {
        this.stylometryEngine = stylometryEngine;
        this.personaRepository = personaRepository;
        this.stylometricSampleRepository = stylometricSampleRepository;
    }

    public StylometricComparisonDto compareTexts(String textA, String textB) {
        return stylometryEngine.compareTexts(textA, textB);
    }

    public StylometricComparisonDto comparePersonas(UUID sourcePersonaId, UUID targetPersonaId) {
        Persona sourcePersona = personaRepository.findById(sourcePersonaId)
                .orElseThrow(() -> new ResourceNotFoundException("Source Persona", sourcePersonaId));
        Persona targetPersona = personaRepository.findById(targetPersonaId)
                .orElseThrow(() -> new ResourceNotFoundException("Target Persona", targetPersonaId));

        List<StylometricSample> sourceSamples = stylometricSampleRepository.findByPersonaId(sourcePersonaId);
        List<StylometricSample> targetSamples = stylometricSampleRepository.findByPersonaId(targetPersonaId);

        String textA = sourceSamples.stream().map(StylometricSample::getRawText).collect(Collectors.joining(" \n "));
        String textB = targetSamples.stream().map(StylometricSample::getRawText).collect(Collectors.joining(" \n "));

        if (textA.trim().isEmpty() || textB.trim().isEmpty()) {
            StylometricComparisonDto emptyComparison = new StylometricComparisonDto();
            emptyComparison.setSourcePersonaId(sourcePersonaId);
            emptyComparison.setTargetPersonaId(targetPersonaId);
            emptyComparison.setSourceFeatures(stylometryEngine.extractFeatures(textA));
            emptyComparison.setTargetFeatures(stylometryEngine.extractFeatures(textB));
            emptyComparison.setOverallStylometricScore(BigDecimal.ZERO);
            emptyComparison.setAnalysisDetails("Insufficient textual corpus available for one or both personas to conduct deep statistical stylometric analysis.");
            return emptyComparison;
        }

        StylometricComparisonDto comparison = stylometryEngine.compareTexts(textA, textB);
        comparison.setSourcePersonaId(sourcePersonaId);
        comparison.setTargetPersonaId(targetPersonaId);
        return comparison;
    }
}
