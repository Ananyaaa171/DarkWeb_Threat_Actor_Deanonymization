package com.sih.deanonymizer.dto;

import java.util.UUID;

public class StylometryCompareRequest {
    private UUID sourcePersonaId;
    private UUID targetPersonaId;
    private String textA;
    private String textB;

    public StylometryCompareRequest() {}

    public UUID getSourcePersonaId() { return sourcePersonaId; }
    public void setSourcePersonaId(UUID sourcePersonaId) { this.sourcePersonaId = sourcePersonaId; }

    public UUID getTargetPersonaId() { return targetPersonaId; }
    public void setTargetPersonaId(UUID targetPersonaId) { this.targetPersonaId = targetPersonaId; }

    public String getTextA() { return textA; }
    public void setTextA(String textA) { this.textA = textA; }

    public String getTextB() { return textB; }
    public void setTextB(String textB) { this.textB = textB; }
}
