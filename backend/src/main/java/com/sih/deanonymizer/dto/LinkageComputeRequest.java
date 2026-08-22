package com.sih.deanonymizer.dto;

import java.util.UUID;

public class LinkageComputeRequest {
    private UUID sourcePersonaId;
    private UUID targetPersonaId;
    private Boolean includeAiExplanation = true;

    public LinkageComputeRequest() {}

    public UUID getSourcePersonaId() { return sourcePersonaId; }
    public void setSourcePersonaId(UUID sourcePersonaId) { this.sourcePersonaId = sourcePersonaId; }

    public UUID getTargetPersonaId() { return targetPersonaId; }
    public void setTargetPersonaId(UUID targetPersonaId) { this.targetPersonaId = targetPersonaId; }

    public Boolean getIncludeAiExplanation() { return includeAiExplanation; }
    public void setIncludeAiExplanation(Boolean includeAiExplanation) { this.includeAiExplanation = includeAiExplanation; }
}
