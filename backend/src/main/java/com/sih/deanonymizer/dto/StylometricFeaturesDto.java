package com.sih.deanonymizer.dto;

public class StylometricFeaturesDto {
    private Double ttr;
    private Double yulesK;
    private Double avgSentenceLength;
    private Double avgWordLength;
    private Double punctuationFrequency;
    private Double functionWordRatio;
    private Double smileyPatternFrequency;
    private Integer totalTokens;
    private Integer uniqueTokens;
    private Integer totalSentences;

    public StylometricFeaturesDto() {}

    public Double getTtr() { return ttr; }
    public void setTtr(Double ttr) { this.ttr = ttr; }

    public Double getYulesK() { return yulesK; }
    public void setYulesK(Double yulesK) { this.yulesK = yulesK; }

    public Double getAvgSentenceLength() { return avgSentenceLength; }
    public void setAvgSentenceLength(Double avgSentenceLength) { this.avgSentenceLength = avgSentenceLength; }

    public Double getAvgWordLength() { return avgWordLength; }
    public void setAvgWordLength(Double avgWordLength) { this.avgWordLength = avgWordLength; }

    public Double getPunctuationFrequency() { return punctuationFrequency; }
    public void setPunctuationFrequency(Double punctuationFrequency) { this.punctuationFrequency = punctuationFrequency; }

    public Double getFunctionWordRatio() { return functionWordRatio; }
    public void setFunctionWordRatio(Double functionWordRatio) { this.functionWordRatio = functionWordRatio; }

    public Double getSmileyPatternFrequency() { return smileyPatternFrequency; }
    public void setSmileyPatternFrequency(Double smileyPatternFrequency) { this.smileyPatternFrequency = smileyPatternFrequency; }

    public Integer getTotalTokens() { return totalTokens; }
    public void setTotalTokens(Integer totalTokens) { this.totalTokens = totalTokens; }

    public Integer getUniqueTokens() { return uniqueTokens; }
    public void setUniqueTokens(Integer uniqueTokens) { this.uniqueTokens = uniqueTokens; }

    public Integer getTotalSentences() { return totalSentences; }
    public void setTotalSentences(Integer totalSentences) { this.totalSentences = totalSentences; }
}
