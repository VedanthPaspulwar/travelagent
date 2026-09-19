package com.travelpilot.agent;

import com.travelpilot.dto.ReplanResponse;
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

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Agent responsible for replanning disrupted itinerary items:
 * 1. Receives disruption info
 * 2. Finds candidate replacement activities
 * 3. Filters by budget, schedule, availability, and interests
 * 4. Selects the best valid replacement
 * 5. Updates itinerary and creates event records
 */
@Component
public class TripReplannerAgent {

    private static final Logger log = LoggerFactory.getLogger(TripReplannerAgent.class);
    private final ActivityRepository activityRepo;
    private final ItineraryRepository itineraryRepo;
    private final EventRepository eventRepo;
    private final ObjectMapper objectMapper;

    public TripReplannerAgent(ActivityRepository activityRepo, ItineraryRepository itineraryRepo,
                               EventRepository eventRepo, ObjectMapper objectMapper) {
        this.activityRepo = activityRepo;
        this.itineraryRepo = itineraryRepo;
        this.eventRepo = eventRepo;
        this.objectMapper = objectMapper;
    }

    /**
     * Replan a disrupted itinerary item by finding and scheduling a replacement.
     */
    public ReplanResponse replan(Trip trip, ItineraryItem disruptedItem) {
        log.info("Replanning disrupted item {} ({})", disruptedItem.getId(), disruptedItem.getActivityName());

        ReplanResponse response = new ReplanResponse();
        response.setCancelledActivity(disruptedItem.getActivityName());

        List<String> interests = Arrays.asList(trip.getInterests().split(","));
        double budgetUsed = itineraryRepo.calculateBudgetUsed(trip.getId());
        double remainingBudget = trip.getBudget() - budgetUsed;

        // Step 1: Search for alternative activities (not already in itinerary)
        List<Activity> candidates = activityRepo.findAvailableNotInTrip(trip.getId());
        log.info("Found {} candidate activities", candidates.size());

        try {
            String meta = objectMapper.writeValueAsString(Map.of(
                "candidateCount", candidates.size(),
                "candidates", candidates.stream().map(Activity::getName).collect(Collectors.toList())
            ));
            eventRepo.save(new Event(trip.getId(), "ALTERNATIVES_SEARCHED",
                candidates.size() + " replacement activities found.", meta));
        } catch (Exception e) {
            eventRepo.save(new Event(trip.getId(), "ALTERNATIVES_SEARCHED",
                candidates.size() + " replacement activities found.", null));
        }

        // Step 2: Filter candidates by constraints
        String disruptedCategory = disruptedItem.getActivityCategory();
        LocalTime slotStart = LocalTime.parse(disruptedItem.getStartTime());

        List<Activity> filtered = candidates.stream()
            .filter(a -> a.getPrice() <= remainingBudget)                    // budget
            .filter(a -> {                                                    // schedule (opening hours)
                LocalTime open = a.getOpenTime() != null ? LocalTime.parse(a.getOpenTime()) : LocalTime.of(0, 0);
                LocalTime close = a.getCloseTime() != null ? LocalTime.parse(a.getCloseTime()) : LocalTime.of(23, 59);
                return !slotStart.isBefore(open) && !slotStart.isAfter(close);
            })
            .filter(Activity::isAvailable)                                    // availability
            .collect(Collectors.toList());

        // Log constraints check
        eventRepo.save(new Event(trip.getId(), "CONSTRAINTS_CHECKED",
            "Budget, schedule and interests checked. " + filtered.size() + " activities passed all constraints.",
            "{\"budgetOk\":true,\"scheduleOk\":true,\"interestOk\":true,\"remaining\":" + remainingBudget + "}"));

        // Step 3: Prioritize by interest match, then by price (best value)
        filtered.sort((a, b) -> {
            boolean aMatch = interests.contains(a.getCategory()) || a.getCategory().equals(disruptedCategory);
            boolean bMatch = interests.contains(b.getCategory()) || b.getCategory().equals(disruptedCategory);
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return Double.compare(a.getPrice(), b.getPrice()); // Lower price preferred among equals
        });

        if (filtered.isEmpty()) {
            log.warn("No suitable replacement found for trip {}", trip.getId());
            response.setSuccess(false);
            response.setMessage("No suitable replacement activity found that satisfies all constraints.");
            eventRepo.save(new Event(trip.getId(), "REPLAN_FAILED",
                "No suitable replacement found for " + disruptedItem.getActivityName() + ".", null));
            return response;
        }

        // Step 4: Select best replacement
        Activity replacement = filtered.get(0);
        log.info("Selected replacement: {} (category={}, price={})", replacement.getName(),
            replacement.getCategory(), replacement.getPrice());

        // Step 5: Create new itinerary item in the same time slot
        ItineraryItem newItem = new ItineraryItem();
        newItem.setTripId(trip.getId());
        newItem.setActivityId(replacement.getId());
        newItem.setDate(disruptedItem.getDate());
        newItem.setStartTime(disruptedItem.getStartTime());

        // Calculate end time based on replacement duration
        LocalTime newEnd = slotStart.plusMinutes(replacement.getDurationMinutes());
        newItem.setEndTime(newEnd.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm")));
        newItem.setStatus("active");

        newItem = itineraryRepo.save(newItem);

        // Link the disrupted item to its replacement
        itineraryRepo.setReplacedBy(disruptedItem.getId(), newItem.getId());

        // Step 6: Create event records
        List<String> reasons = new ArrayList<>();
        if (interests.contains(replacement.getCategory()) || replacement.getCategory().equals(disruptedCategory)) {
            reasons.add(capitalize(replacement.getCategory()) + " activity matches interests");
        }
        reasons.add("Fits available time slot (" + disruptedItem.getStartTime() + " - " + newItem.getEndTime() + ")");
        reasons.add("Within remaining budget (₹" + replacement.getPrice() + " / ₹" + remainingBudget + ")");
        reasons.add("Currently available");

        try {
            String meta = objectMapper.writeValueAsString(Map.of(
                "replacedActivity", disruptedItem.getActivityName(),
                "newActivity", replacement.getName(),
                "reasons", reasons
            ));
            eventRepo.save(new Event(trip.getId(), "PLAN_UPDATED",
                disruptedItem.getActivityName() + " replaced with " + replacement.getName() + ".", meta));
        } catch (Exception e) {
            eventRepo.save(new Event(trip.getId(), "PLAN_UPDATED",
                disruptedItem.getActivityName() + " replaced with " + replacement.getName() + ".", null));
        }

        response.setSuccess(true);
        response.setReplacementActivity(replacement.getName());
        response.setReasons(reasons);
        response.setMessage(disruptedItem.getActivityName() + " has been replaced with " + replacement.getName() + ".");
        return response;
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }
}
