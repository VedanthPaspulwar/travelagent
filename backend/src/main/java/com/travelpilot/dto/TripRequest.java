package com.travelpilot.dto;

import java.util.List;

/**
 * Request DTO for creating a new trip.
 */
public class TripRequest {
    private String destination;
    private String startDate;
    private String endDate;
    private double budget;
    private List<String> interests;

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public double getBudget() { return budget; }
    public void setBudget(double budget) { this.budget = budget; }
    public List<String> getInterests() { return interests; }
    public void setInterests(List<String> interests) { this.interests = interests; }
}
