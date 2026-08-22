package com.sih.deanonymizer.service.scoring;

import com.sih.deanonymizer.dto.InfrastructureComparisonDto;
import com.sih.deanonymizer.model.entity.Infrastructure;
import com.sih.deanonymizer.repository.InfrastructureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class InfrastructureAnalysisService {

    private final InfrastructureRepository infrastructureRepository;

    public InfrastructureAnalysisService(InfrastructureRepository infrastructureRepository) {
        this.infrastructureRepository = infrastructureRepository;
    }

    public InfrastructureComparisonDto compareInfrastructure(UUID sourcePersonaId, UUID targetPersonaId) {
        List<Infrastructure> infraA = infrastructureRepository.findByPersonaId(sourcePersonaId);
        List<Infrastructure> infraB = infrastructureRepository.findByPersonaId(targetPersonaId);

        InfrastructureComparisonDto result = new InfrastructureComparisonDto();
        List<String> matched = new ArrayList<>();

        double maxOnion = 0.0;
        double maxSsl = 0.0;
        double maxIpAsn = 0.0;

        for (Infrastructure a : infraA) {
            for (Infrastructure b : infraB) {
                String valA = a.getValue().trim();
                String valB = b.getValue().trim();
                String sslA = a.getSslCertFingerprint();
                String sslB = b.getSslCertFingerprint();
                String ipA = a.getIpAddress();
                String ipB = b.getIpAddress();
                String asnA = a.getAsn();
                String asnB = b.getAsn();

                // 1. Onion / Domain Match
                if (valA.equalsIgnoreCase(valB)) {
                    maxOnion = Math.max(maxOnion, 100.0);
                    matched.add("Identical Darknet Service Indicator: " + valA);
                }

                // 2. SSL Fingerprint Match
                if (sslA != null && sslB != null && !sslA.isEmpty() && sslA.equalsIgnoreCase(sslB)) {
                    maxSsl = Math.max(maxSsl, 90.0);
                    matched.add("Shared SSL Certificate Fingerprint: " + sslA);
                }

                // 3. IP / ASN Co-location
                if (ipA != null && ipB != null && !ipA.isEmpty() && ipA.equalsIgnoreCase(ipB)) {
                    maxIpAsn = Math.max(maxIpAsn, 80.0);
                    matched.add("Co-located Backend Server IP: " + ipA);
                } else if (asnA != null && asnB != null && !asnA.isEmpty() && asnA.equalsIgnoreCase(asnB)) {
                    maxIpAsn = Math.max(maxIpAsn, 50.0);
                    matched.add("Co-located Autonomous System (ASN): " + asnA);
                }
            }
        }

        result.setMatchedInfrastructure(matched);
        result.setOnionScore(maxOnion);
        result.setSslScore(maxSsl);
        result.setIpAsnScore(maxIpAsn);

        double baseScore = Math.max(maxOnion, Math.max(maxSsl, maxIpAsn));
        if (matched.size() > 1 && baseScore > 0) {
            baseScore = Math.min(100.0, baseScore + 5.0);
        }

        BigDecimal overall = BigDecimal.valueOf(baseScore).setScale(2, RoundingMode.HALF_UP);
        result.setOverallInfrastructureScore(overall);

        if (matched.isEmpty()) {
            result.setAnalysisDetails("No overlapping darknet onion portals, backend IPs, or SSL certificate fingerprints identified.");
        } else {
            result.setAnalysisDetails(String.format("Found %d infrastructure link(s). Top proximity score: %.1f%%", matched.size(), baseScore));
        }

        return result;
    }
}
