package com.sih.deanonymizer.service.scoring;

import com.sih.deanonymizer.dto.BehavioralComparisonDto;
import com.sih.deanonymizer.dto.BehavioralProfileDto;
import com.sih.deanonymizer.exception.ResourceNotFoundException;
import com.sih.deanonymizer.model.entity.Persona;
import com.sih.deanonymizer.model.entity.TimelineEvent;
import com.sih.deanonymizer.repository.PersonaRepository;
import com.sih.deanonymizer.repository.TimelineEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class BehavioralAnalysisService {

    private final PersonaRepository personaRepository;
    private final TimelineEventRepository timelineEventRepository;

    public BehavioralAnalysisService(
            PersonaRepository personaRepository,
            TimelineEventRepository timelineEventRepository) {
        this.personaRepository = personaRepository;
        this.timelineEventRepository = timelineEventRepository;
    }

    public BehavioralProfileDto extractProfile(UUID personaId) {
        Persona persona = personaRepository.findById(personaId)
                .orElseThrow(() -> new ResourceNotFoundException("Persona", personaId));

        List<TimelineEvent> events = timelineEventRepository.findByPersonaIdOrderByEventTimestampDesc(personaId);

        BehavioralProfileDto profile = new BehavioralProfileDto();
        profile.setPersonaId(personaId);
        profile.setHandle(persona.getHandle());
        profile.setPlatform(persona.getPlatform());
        profile.setTotalEvents(events.size());
        profile.setPrimaryTimezone(persona.getActivityTimezoneEstimated());

        Map<Integer, Integer> hoursMap = new HashMap<>();
        Map<String, Integer> daysMap = new HashMap<>();
        Map<String, Integer> typesMap = new HashMap<>();

        for (int h = 0; h < 24; h++) hoursMap.put(h, 0);
        for (DayOfWeek d : DayOfWeek.values()) daysMap.put(d.name(), 0);

        for (TimelineEvent event : events) {
            OffsetDateTime ts = event.getEventTimestamp();
            if (ts != null) {
                int hour = ts.getHour();
                hoursMap.put(hour, hoursMap.getOrDefault(hour, 0) + 1);

                String day = ts.getDayOfWeek().name();
                daysMap.put(day, daysMap.getOrDefault(day, 0) + 1);
            }

            String type = event.getEventType() != null ? event.getEventType() : "UNKNOWN";
            typesMap.put(type, typesMap.getOrDefault(type, 0) + 1);
        }

        profile.setActiveHoursDistribution(hoursMap);
        profile.setActiveDaysDistribution(daysMap);
        profile.setEventTypesDistribution(typesMap);

        return profile;
    }

    public BehavioralComparisonDto comparePersonas(UUID sourcePersonaId, UUID targetPersonaId) {
        BehavioralProfileDto pA = extractProfile(sourcePersonaId);
        BehavioralProfileDto pB = extractProfile(targetPersonaId);

        BehavioralComparisonDto comparison = new BehavioralComparisonDto();
        comparison.setSourcePersonaId(sourcePersonaId);
        comparison.setTargetPersonaId(targetPersonaId);
        comparison.setSourceProfile(pA);
        comparison.setTargetProfile(pB);

        // 1. Timezone Alignment
        double tzScore = computeTimezoneSimilarity(pA.getPrimaryTimezone(), pB.getPrimaryTimezone());
        comparison.setTimezoneAlignmentScore(round(tzScore, 4));

        // 2. Hour Histogram Cosine Similarity
        double hourSim = computeMapCosine(pA.getActiveHoursDistribution(), pB.getActiveHoursDistribution());
        comparison.setHourDistributionSimilarity(round(hourSim, 4));

        // 3. Day Histogram Cosine Similarity
        double daySim = computeMapCosine(pA.getActiveDaysDistribution(), pB.getActiveDaysDistribution());
        comparison.setDayDistributionSimilarity(round(daySim, 4));

        // 4. Event Types Cosine Similarity
        double typeSim = computeMapCosine(pA.getEventTypesDistribution(), pB.getEventTypesDistribution());
        comparison.setEventTypeSimilarity(round(typeSim, 4));

        // Composite Behavioral Score (0 - 100)
        // Weighted: Timezone (40%), Hour Distribution (30%), Event Types (20%), Day Distribution (10%)
        double composite = (tzScore * 0.40) + (hourSim * 0.30) + (typeSim * 0.20) + (daySim * 0.10);
        BigDecimal score = BigDecimal.valueOf(composite * 100.0).setScale(2, RoundingMode.HALF_UP);
        comparison.setOverallBehavioralScore(score);

        comparison.setAnalysisDetails(String.format(
                "Timezone alignment: %.1f%% (%s vs %s), Active hours correlation: %.1f%%, Modus operandi event overlap: %.1f%%",
                tzScore * 100.0,
                pA.getPrimaryTimezone() != null ? pA.getPrimaryTimezone() : "Unknown",
                pB.getPrimaryTimezone() != null ? pB.getPrimaryTimezone() : "Unknown",
                hourSim * 100.0,
                typeSim * 100.0
        ));

        return comparison;
    }

    private double computeTimezoneSimilarity(String tzA, String tzB) {
        if (tzA == null || tzB == null) return 0.50; // Neutral baseline if unknown
        if (tzA.equalsIgnoreCase(tzB)) return 1.0;
        if (tzA.contains("UTC+3") && tzB.contains("UTC+3")) return 1.0;
        if (tzA.contains("UTC+3") && tzB.contains("UTC+2")) return 0.85;
        if (tzA.contains("UTC-5") && tzB.contains("UTC-5")) return 1.0;
        if (tzA.contains("UTC-5") && tzB.contains("UTC-4")) return 0.85;
        return 0.20; // Divergent timezones
    }

    private <K> double computeMapCosine(Map<K, Integer> m1, Map<K, Integer> m2) {
        if (m1 == null || m2 == null || m1.isEmpty() || m2.isEmpty()) return 0.50;
        Set<K> allKeys = new HashSet<>(m1.keySet());
        allKeys.addAll(m2.keySet());

        double dot = 0.0, normA = 0.0, normB = 0.0;
        for (K k : allKeys) {
            int a = m1.getOrDefault(k, 0);
            int b = m2.getOrDefault(k, 0);
            dot += a * b;
            normA += a * a;
            normB += b * b;
        }

        if (normA == 0.0 && normB == 0.0) return 1.0;
        if (normA == 0.0 || normB == 0.0) return 0.50; // One has no events
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private double round(double val, int decimals) {
        return BigDecimal.valueOf(val).setScale(decimals, RoundingMode.HALF_UP).doubleValue();
    }
}
