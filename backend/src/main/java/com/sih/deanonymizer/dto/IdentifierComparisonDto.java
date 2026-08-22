package com.sih.deanonymizer.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class IdentifierComparisonDto {
    private List<String> matchedIdentifiers = new ArrayList<>();
    private Double pgpScore;
    private Double walletScore;
    private Double contactScore;
    private BigDecimal overallIdentifierScore;
    private String analysisDetails;

    public IdentifierComparisonDto() {}

    public List<String> getMatchedIdentifiers() { return matchedIdentifiers; }
    public void setMatchedIdentifiers(List<String> matchedIdentifiers) { this.matchedIdentifiers = matchedIdentifiers; }

    public Double getPgpScore() { return pgpScore; }
    public void setPgpScore(Double pgpScore) { this.pgpScore = pgpScore; }

    public Double getWalletScore() { return walletScore; }
    public void setWalletScore(Double walletScore) { this.walletScore = walletScore; }

    public Double getContactScore() { return contactScore; }
    public void setContactScore(Double contactScore) { this.contactScore = contactScore; }

    public BigDecimal getOverallIdentifierScore() { return overallIdentifierScore; }
    public void setOverallIdentifierScore(BigDecimal overallIdentifierScore) { this.overallIdentifierScore = overallIdentifierScore; }

    public String getAnalysisDetails() { return analysisDetails; }
    public void setAnalysisDetails(String analysisDetails) { this.analysisDetails = analysisDetails; }
}
