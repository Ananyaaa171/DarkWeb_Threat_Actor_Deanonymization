package com.sih.deanonymizer.dto;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class BehavioralProfileDto {
    private UUID personaId;
    private String handle;
    private String platform;
    private Integer totalEvents;
    private String primaryTimezone;
    private Map<Integer, Integer> activeHoursDistribution = new HashMap<>(); // Hour (0-23) -> Event Count
    private Map<String, Integer> activeDaysDistribution = new HashMap<>();   // MON..SUN -> Count
    private Map<String, Integer> eventTypesDistribution = new HashMap<>();   // Event Type -> Count
    private Double avgIntervalHours;

    public BehavioralProfileDto() {}

    public UUID getPersonaId() { return personaId; }
    public void setPersonaId(UUID personaId) { this.personaId = personaId; }

    public String getHandle() { return handle; }
    public void setHandle(String handle) { this.handle = handle; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public Integer getTotalEvents() { return totalEvents; }
    public void setTotalEvents(Integer totalEvents) { this.totalEvents = totalEvents; }

    public String getPrimaryTimezone() { return primaryTimezone; }
    public void setPrimaryTimezone(String primaryTimezone) { this.primaryTimezone = primaryTimezone; }

    public Map<Integer, Integer> getActiveHoursDistribution() { return activeHoursDistribution; }
    public void setActiveHoursDistribution(Map<Integer, Integer> activeHoursDistribution) { this.activeHoursDistribution = activeHoursDistribution; }

    public Map<String, Integer> getActiveDaysDistribution() { return activeDaysDistribution; }
    public void setActiveDaysDistribution(Map<String, Integer> activeDaysDistribution) { this.activeDaysDistribution = activeDaysDistribution; }

    public Map<String, Integer> getEventTypesDistribution() { return eventTypesDistribution; }
    public void setEventTypesDistribution(Map<String, Integer> eventTypesDistribution) { this.eventTypesDistribution = eventTypesDistribution; }

    public Double getAvgIntervalHours() { return avgIntervalHours; }
    public void setAvgIntervalHours(Double avgIntervalHours) { this.avgIntervalHours = avgIntervalHours; }
}
