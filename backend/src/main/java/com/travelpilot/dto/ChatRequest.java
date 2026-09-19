package com.travelpilot.dto;

/**
 * Request DTO for AI chat messages.
 */
public class ChatRequest {
    private Long tripId;
    private String message;

    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
