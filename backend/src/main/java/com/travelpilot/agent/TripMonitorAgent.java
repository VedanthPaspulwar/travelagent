package com.travelpilot.agent;

import com.travelpilot.model.Event;
import com.travelpilot.model.ItineraryItem;
import com.travelpilot.repository.EventRepository;
import com.travelpilot.repository.ItineraryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Agent responsible for monitoring itinerary events and detecting disruptions
 * such as cancelled or unavailable activities.
 */
@Component
public class TripMonitorAgent {

    private static final Logger log = LoggerFactory.getLogger(TripMonitorAgent.class);
    private final ItineraryRepository itineraryRepo;
    private final EventRepository eventRepo;

    public TripMonitorAgent(ItineraryRepository itineraryRepo, EventRepository eventRepo) {
        this.itineraryRepo = itineraryRepo;
        this.eventRepo = eventRepo;
    }

    /**
     * Detect any disrupted (cancelled) items in the trip that need replanning.
     */
    public List<ItineraryItem> detectDisruptions(Long tripId) {
        log.info("Monitoring trip {} for disruptions", tripId);
        List<ItineraryItem> disrupted = itineraryRepo.findDisruptedByTripId(tripId);
        if (!disrupted.isEmpty()) {
            log.warn("Found {} disrupted items in trip {}", disrupted.size(), tripId);
        }
        return disrupted;
    }

    /**
     * Mark an itinerary item as cancelled due to disruption and create event.
     */
    public void markDisrupted(Long tripId, Long itineraryItemId, String reason) {
        log.info("Marking itinerary item {} as cancelled for trip {}", itineraryItemId, tripId);

        ItineraryItem item = itineraryRepo.findById(itineraryItemId)
            .orElseThrow(() -> new IllegalArgumentException("Itinerary item not found: " + itineraryItemId));

        itineraryRepo.updateStatus(itineraryItemId, "cancelled");

        String message = item.getActivityName() + " was cancelled. Reason: " +
            (reason != null ? reason : "Provider cancelled the activity.");
        eventRepo.save(new Event(tripId, "DISRUPTION_DETECTED", message,
            "{\"activityId\":" + item.getActivityId() + ",\"activityName\":\"" + item.getActivityName() + "\"}"));
    }
}
