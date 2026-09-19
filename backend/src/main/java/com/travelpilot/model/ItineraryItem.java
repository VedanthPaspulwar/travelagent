package com.travelpilot.model;

/**
 * Represents a scheduled activity in a trip's itinerary.
 */
public class ItineraryItem {
    private Long id;
    private Long tripId;
    private Long activityId;
    private String date;
    private String startTime;
    private String endTime;
    private String status; // active, cancelled, replaced
    private Long replacedBy;
    private String createdAt;

    // Joined fields (populated by queries)
    private String activityName;
    private String activityLocation;
    private String activityCategory;
    private String activityDescription;
    private double activityPrice;
    private int activityDurationMinutes;
    private boolean activityAvailable;
    private Double activityLatitude;
    private Double activityLongitude;

    public ItineraryItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }
    public Long getActivityId() { return activityId; }
    public void setActivityId(Long activityId) { this.activityId = activityId; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getReplacedBy() { return replacedBy; }
    public void setReplacedBy(Long replacedBy) { this.replacedBy = replacedBy; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getActivityName() { return activityName; }
    public void setActivityName(String activityName) { this.activityName = activityName; }
    public String getActivityLocation() { return activityLocation; }
    public void setActivityLocation(String activityLocation) { this.activityLocation = activityLocation; }
    public String getActivityCategory() { return activityCategory; }
    public void setActivityCategory(String activityCategory) { this.activityCategory = activityCategory; }
    public String getActivityDescription() { return activityDescription; }
    public void setActivityDescription(String activityDescription) { this.activityDescription = activityDescription; }
    public double getActivityPrice() { return activityPrice; }
    public void setActivityPrice(double activityPrice) { this.activityPrice = activityPrice; }
    public int getActivityDurationMinutes() { return activityDurationMinutes; }
    public void setActivityDurationMinutes(int activityDurationMinutes) { this.activityDurationMinutes = activityDurationMinutes; }
    public boolean isActivityAvailable() { return activityAvailable; }
    public void setActivityAvailable(boolean activityAvailable) { this.activityAvailable = activityAvailable; }
    public Double getActivityLatitude() { return activityLatitude; }
    public void setActivityLatitude(Double activityLatitude) { this.activityLatitude = activityLatitude; }
    public Double getActivityLongitude() { return activityLongitude; }
    public void setActivityLongitude(Double activityLongitude) { this.activityLongitude = activityLongitude; }
}
