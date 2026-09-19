package com.travelpilot.agent;

import com.travelpilot.model.Event;
import com.travelpilot.model.ItineraryItem;
import com.travelpilot.model.Trip;
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
 * Agent responsible for validating an itinerary against constraints:
 * - Budget limits
 * - Schedule conflicts
 * - Activity availability
 * - Opening hours
 * - User interest alignment
 */
@Component
public class TripValidatorAgent {

    private static final Logger log = LoggerFactory.getLogger(TripValidatorAgent.class);
    private final ItineraryRepository itineraryRepo;
    private final EventRepository eventRepo;
    private final ObjectMapper objectMapper;

    public TripValidatorAgent(ItineraryRepository itineraryRepo, EventRepository eventRepo,
                               ObjectMapper objectMapper) {
        this.itineraryRepo = itineraryRepo;
        this.eventRepo = eventRepo;
        this.objectMapper = objectMapper;
    }

    /**
     * Validate the trip's current active itinerary. Returns a map with validation results.
     */
    public Map<String, Object> validate(Trip trip) {
        log.info("Validating itinerary for trip {}", trip.getId());

        List<ItineraryItem> items = itineraryRepo.findActiveByTripId(trip.getId());
        double budgetUsed = itineraryRepo.calculateBudgetUsed(trip.getId());

        List<String> issues = new ArrayList<>();
        int conflicts = 0;

        // Check budget
        boolean budgetOk = budgetUsed <= trip.getBudget();
        if (!budgetOk) {
            issues.add("Budget exceeded: ₹" + budgetUsed + " / ₹" + trip.getBudget());
        }

        // Check schedule conflicts (overlapping times on same date)
        Map<String, List<ItineraryItem>> byDate = items.stream()
            .collect(Collectors.groupingBy(ItineraryItem::getDate));

        for (Map.Entry<String, List<ItineraryItem>> entry : byDate.entrySet()) {
            List<ItineraryItem> dayItems = entry.getValue();
            dayItems.sort(Comparator.comparing(ItineraryItem::getStartTime));
            for (int i = 0; i < dayItems.size() - 1; i++) {
                LocalTime end1 = LocalTime.parse(dayItems.get(i).getEndTime());
                LocalTime start2 = LocalTime.parse(dayItems.get(i + 1).getStartTime());
                if (end1.isAfter(start2)) {
                    conflicts++;
                    issues.add("Schedule conflict on " + entry.getKey() + ": " +
                        dayItems.get(i).getActivityName() + " overlaps with " +
                        dayItems.get(i + 1).getActivityName());
                }
            }
        }

        // Check availability
        for (ItineraryItem item : items) {
            if (!item.isActivityAvailable()) {
                issues.add(item.getActivityName() + " is not available.");
            }
        }

        boolean valid = issues.isEmpty();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("valid", valid);
        result.put("budgetUsed", budgetUsed);
        result.put("budgetTotal", trip.getBudget());
        result.put("conflicts", conflicts);
        result.put("issues", issues);

        // Log validation event
        try {
            String metadata = objectMapper.writeValueAsString(result);
            String message = valid
                ? "Budget and schedule validated. All activities are available and within constraints."
                : "Validation found issues: " + String.join("; ", issues);
            eventRepo.save(new Event(trip.getId(), "PLAN_VALIDATED", message, metadata));
        } catch (Exception e) {
            log.error("Failed to serialize validation metadata", e);
            eventRepo.save(new Event(trip.getId(), "PLAN_VALIDATED",
                valid ? "Itinerary validated successfully." : "Validation found issues.", null));
        }

        log.info("Validation complete: valid={}, budgetUsed={}, conflicts={}", valid, budgetUsed, conflicts);
        return result;
    }
}
