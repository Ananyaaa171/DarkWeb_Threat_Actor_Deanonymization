package com.sih.deanonymizer.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class InfrastructureComparisonDto {
    private List<String> matchedInfrastructure = new ArrayList<>();
    private Double onionScore;
    private Double sslScore;
    private Double ipAsnScore;
    private BigDecimal overallInfrastructureScore;
    private String analysisDetails;

    public InfrastructureComparisonDto() {}

    public List<String> getMatchedInfrastructure() { return matchedInfrastructure; }
    public void setMatchedInfrastructure(List<String> matchedInfrastructure) { this.matchedInfrastructure = matchedInfrastructure; }

    public Double getOnionScore() { return onionScore; }
    public void setOnionScore(Double onionScore) { this.onionScore = onionScore; }

    public Double getSslScore() { return sslScore; }
    public void setSslScore(Double sslScore) { this.sslScore = sslScore; }

    public Double getIpAsnScore() { return ipAsnScore; }
    public void setIpAsnScore(Double ipAsnScore) { this.ipAsnScore = ipAsnScore; }

    public BigDecimal getOverallInfrastructureScore() { return overallInfrastructureScore; }
    public void setOverallInfrastructureScore(BigDecimal overallInfrastructureScore) { this.overallInfrastructureScore = overallInfrastructureScore; }

    public String getAnalysisDetails() { return analysisDetails; }
    public void setAnalysisDetails(String analysisDetails) { this.analysisDetails = analysisDetails; }
}
