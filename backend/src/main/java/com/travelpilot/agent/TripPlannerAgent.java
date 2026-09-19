package com.travelpilot.agent;

import com.travelpilot.model.Activity;
import com.travelpilot.model.Event;
import com.travelpilot.model.ItineraryItem;
import com.travelpilot.model.Trip;
import com.travelpilot.repository.ActivityRepository;
import com.travelpilot.repository.EventRepository;
import com.travelpilot.repository.ItineraryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Agent responsible for creating an initial itinerary from trip preferences.
 * Reads destination, dates, budget, and interests to select and schedule activities.
 */
@Component
public class TripPlannerAgent {

    private static final Logger log = LoggerFactory.getLogger(TripPlannerAgent.class);
    private final ActivityRepository activityRepo;
    private final ItineraryRepository itineraryRepo;
    private final EventRepository eventRepo;
    private final ObjectMapper objectMapper;

    public TripPlannerAgent(ActivityRepository activityRepo, ItineraryRepository itineraryRepo,
                            EventRepository eventRepo, ObjectMapper objectMapper) {
        this.activityRepo = activityRepo;
        this.itineraryRepo = itineraryRepo;
        this.eventRepo = eventRepo;
        this.objectMapper = objectMapper;
    }

    /**
     * Create an itinerary for the given trip by selecting activities that match
     * the user's interests and fit within the budget.
     */
    public List<ItineraryItem> plan(Trip trip) {
        log.info("Planning itinerary for trip {} to {}", trip.getId(), trip.getDestination());

        List<String> interests = Arrays.asList(trip.getInterests().split(","));
        List<Activity> available = activityRepo.findAvailable();

        // Score and sort activities by how well they match user interests
        List<Activity> scored = available.stream()
            .sorted((a, b) -> {
                int scoreA = interests.contains(a.getCategory()) ? 1 : 0;
                int scoreB = interests.contains(b.getCategory()) ? 1 : 0;
                return scoreB - scoreA; // Higher interest match first
            })
            .collect(Collectors.toList());

        LocalDate startDate = LocalDate.parse(trip.getStartDate());
        LocalDate endDate = LocalDate.parse(trip.getEndDate());
        long numDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;

        List<ItineraryItem> items = new ArrayList<>();
        double budgetUsed = 0;
        Set<Long> usedActivities = new HashSet<>();

        // Schedule up to 3 activities per day
        for (int day = 0; day < numDays && !scored.isEmpty(); day++) {
            LocalDate currentDate = startDate.plusDays(day);
            String dateStr = currentDate.format(DateTimeFormatter.ISO_LOCAL_DATE);

            // Time slots: morning, afternoon, evening
            String[][] timeSlots = {
                {"09:00", "12:00"},
                {"13:00", "14:30"},
                {"16:00", "19:00"}
            };

            for (String[] slot : timeSlots) {
                Activity best = null;
                for (Activity a : scored) {
                    if (usedActivities.contains(a.getId())) continue;
                    if (budgetUsed + a.getPrice() > trip.getBudget()) continue;

                    // Check if activity fits the time slot
                    LocalTime slotStart = LocalTime.parse(slot[0]);
                    LocalTime actOpen = a.getOpenTime() != null ? LocalTime.parse(a.getOpenTime()) : LocalTime.of(0, 0);
                    LocalTime actClose = a.getCloseTime() != null ? LocalTime.parse(a.getCloseTime()) : LocalTime.of(23, 59);
                    if (slotStart.isBefore(actOpen) || slotStart.isAfter(actClose)) continue;

                    best = a;
                    break;
                }

                if (best != null) {
                    ItineraryItem item = new ItineraryItem();
                    item.setTripId(trip.getId());
                    item.setActivityId(best.getId());
                    item.setDate(dateStr);
                    item.setStartTime(slot[0]);

                    // Calculate end time based on duration
                    LocalTime start = LocalTime.parse(slot[0]);
                    LocalTime end = start.plusMinutes(best.getDurationMinutes());
                    item.setEndTime(end.format(DateTimeFormatter.ofPattern("HH:mm")));

                    item.setStatus("active");
                    item = itineraryRepo.save(item);

                    // Populate activity details
                    item.setActivityName(best.getName());
                    item.setActivityCategory(best.getCategory());
                    item.setActivityPrice(best.getPrice());

                    items.add(item);
                    usedActivities.add(best.getId());
                    budgetUsed += best.getPrice();
                }
            }
        }

        // Log the planning event
        try {
            List<String> activityNames = items.stream()
                .map(ItineraryItem::getActivityName)
                .collect(Collectors.toList());
            String metadata = objectMapper.writeValueAsString(Map.of("activities", activityNames));
            eventRepo.save(new Event(trip.getId(), "PLAN_CREATED",
                "Initial itinerary created for " + trip.getDestination() + " trip.", metadata));
        } catch (Exception e) {
            log.error("Failed to serialize planning event metadata", e);
            eventRepo.save(new Event(trip.getId(), "PLAN_CREATED",
                "Initial itinerary created for " + trip.getDestination() + " trip.", null));
        }

        log.info("Created {} itinerary items, budget used: {}", items.size(), budgetUsed);
        return items;
    }
}
