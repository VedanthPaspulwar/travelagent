package com.travelpilot.dto;

import java.util.List;

/**
 * Response DTO for trip details.
 */
public class TripResponse {
    private Long id;
    private String destination;
    private String startDate;
    private String endDate;
    private double budget;
    private double budgetUsed;
    private List<String> interests;
    private String status;
    private String createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public double getBudget() { return budget; }
    public void setBudget(double budget) { this.budget = budget; }
    public double getBudgetUsed() { return budgetUsed; }
    public void setBudgetUsed(double budgetUsed) { this.budgetUsed = budgetUsed; }
    public List<String> getInterests() { return interests; }
    public void setInterests(List<String> interests) { this.interests = interests; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
