package com.travelpilot.dto;

/**
 * Request DTO for simulating a disruption on an itinerary item.
 */
public class DisruptionRequest {
    private Long itineraryItemId;
    private String reason;

    public Long getItineraryItemId() { return itineraryItemId; }
    public void setItineraryItemId(Long itineraryItemId) { this.itineraryItemId = itineraryItemId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
