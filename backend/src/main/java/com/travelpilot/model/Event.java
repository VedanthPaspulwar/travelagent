package com.travelpilot.model;

/**
 * Represents an agent event in the system event log.
 */
public class Event {
    private Long id;
    private Long tripId;
    private String eventType;
    private String message;
    private String metadata;
    private String createdAt;

    public Event() {}

    public Event(Long tripId, String eventType, String message, String metadata) {
        this.tripId = tripId;
        this.eventType = eventType;
        this.message = message;
        this.metadata = metadata;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
