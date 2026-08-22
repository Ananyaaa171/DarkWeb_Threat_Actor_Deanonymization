package com.sih.deanonymizer.service.scoring;

import com.sih.deanonymizer.dto.IdentifierComparisonDto;
import com.sih.deanonymizer.model.entity.Identifier;
import com.sih.deanonymizer.repository.IdentifierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class IdentifierAnalysisService {

    private final IdentifierRepository identifierRepository;

    public IdentifierAnalysisService(IdentifierRepository identifierRepository) {
        this.identifierRepository = identifierRepository;
    }

    public IdentifierComparisonDto compareIdentifiers(UUID sourcePersonaId, UUID targetPersonaId) {
        List<Identifier> idsA = identifierRepository.findByPersonaId(sourcePersonaId);
        List<Identifier> idsB = identifierRepository.findByPersonaId(targetPersonaId);

        IdentifierComparisonDto result = new IdentifierComparisonDto();
        List<String> matched = new ArrayList<>();

        double maxPgp = 0.0;
        double maxWallet = 0.0;
        double maxContact = 0.0;

        for (Identifier a : idsA) {
            for (Identifier b : idsB) {
                String valA = a.getValue().trim();
                String valB = b.getValue().trim();
                String metaA = a.getMetadata() != null ? a.getMetadata() : "";
                String metaB = b.getMetadata() != null ? b.getMetadata() : "";

                // 1. PGP Matching
                if ("PGP_FINGERPRINT".equalsIgnoreCase(a.getType()) && "PGP_FINGERPRINT".equalsIgnoreCase(b.getType())) {
                    if (valA.equalsIgnoreCase(valB)) {
                        maxPgp = Math.max(maxPgp, 100.0);
                        matched.add("Exact PGP Master Fingerprint Match: " + valA);
                    } else if (metaA.contains("subkey_id") && metaB.contains("subkey_id")) {
                        String subA = extractSubkeyId(metaA);
                        String subB = extractSubkeyId(metaB);
                        if (subA != null && subA.equalsIgnoreCase(subB)) {
                            maxPgp = Math.max(maxPgp, 95.0);
                            matched.add("Matching PGP Subkey ID: " + subA);
                        }
                    }
                }

                // 2. Crypto Wallet Matching
                if (a.getType().contains("WALLET") && b.getType().contains("WALLET")) {
                    if (valA.equalsIgnoreCase(valB)) {
                        maxWallet = Math.max(maxWallet, 90.0);
                        matched.add("Identical Cryptocurrency Address (" + a.getType() + "): " + valA);
                    }
                }

                // 3. Contact / Email / Tox Matching
                if (("TOX_ID".equalsIgnoreCase(a.getType()) || "EMAIL".equalsIgnoreCase(a.getType())) &&
                    a.getType().equalsIgnoreCase(b.getType())) {
                    if (valA.equalsIgnoreCase(valB)) {
                        maxContact = Math.max(maxContact, 85.0);
                        matched.add("Matching " + a.getType() + ": " + valA);
                    } else if ("EMAIL".equalsIgnoreCase(a.getType()) && valA.contains("@") && valB.contains("@")) {
                        String domainA = valA.substring(valA.indexOf("@"));
                        String domainB = valB.substring(valB.indexOf("@"));
                        if (domainA.equalsIgnoreCase(domainB) && (domainA.contains("cock.li") || domainA.contains("proton"))) {
                            maxContact = Math.max(maxContact, 50.0);
                            matched.add("Co-located Secure Webmail Provider (" + domainA + ")");
                        }
                    }
                }
            }
        }

        result.setMatchedIdentifiers(matched);
        result.setPgpScore(maxPgp);
        result.setWalletScore(maxWallet);
        result.setContactScore(maxContact);

        // Overall score is highest matching cryptographic/on-chain indicator, with bonus for multi-factor matches
        double baseScore = Math.max(maxPgp, Math.max(maxWallet, maxContact));
        if (matched.size() > 1 && baseScore > 0) {
            baseScore = Math.min(100.0, baseScore + 5.0); // Multi-identifier match confidence bonus
        }

        BigDecimal overall = BigDecimal.valueOf(baseScore).setScale(2, RoundingMode.HALF_UP);
        result.setOverallIdentifierScore(overall);

        if (matched.isEmpty()) {
            result.setAnalysisDetails("No overlapping PGP fingerprints, cryptocurrency deposit wallets, or contact identifiers identified.");
        } else {
            result.setAnalysisDetails(String.format("Found %d corroborating digital identifier match(es). Top match confidence: %.1f%%", matched.size(), baseScore));
        }

        return result;
    }

    private String extractSubkeyId(String json) {
        if (json == null) return null;
        int idx = json.indexOf("subkey_id");
        if (idx == -1) return null;
        int startQuote = json.indexOf("\"", idx + 10);
        if (startQuote == -1) return null;
        int endQuote = json.indexOf("\"", startQuote + 1);
        if (endQuote == -1) return null;
        return json.substring(startQuote + 1, endQuote);
    }
}
