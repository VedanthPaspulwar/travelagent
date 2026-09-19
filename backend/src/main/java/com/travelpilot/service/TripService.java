package com.travelpilot.service;

import com.travelpilot.agent.TripMonitorAgent;
import com.travelpilot.agent.TripPlannerAgent;
import com.travelpilot.agent.TripReplannerAgent;
import com.travelpilot.agent.TripValidatorAgent;
import com.travelpilot.dto.*;
import com.travelpilot.model.Event;
import com.travelpilot.model.ItineraryItem;
import com.travelpilot.model.Trip;
import com.travelpilot.repository.ActivityRepository;
import com.travelpilot.repository.EventRepository;
import com.travelpilot.repository.ItineraryRepository;
import com.travelpilot.repository.TripRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Main service orchestrating trip lifecycle: creation, planning, validation,
 * disruption handling, and replanning via agent delegation.
 */
@Service
public class TripService {

    private static final Logger log = LoggerFactory.getLogger(TripService.class);

    private final TripRepository tripRepo;
    private final ItineraryRepository itineraryRepo;
    private final EventRepository eventRepo;
    private final ActivityRepository activityRepo;
    private final TripPlannerAgent plannerAgent;
    private final TripValidatorAgent validatorAgent;
    private final TripMonitorAgent monitorAgent;
    private final TripReplannerAgent replannerAgent;

    public TripService(TripRepository tripRepo, ItineraryRepository itineraryRepo,
                       EventRepository eventRepo, ActivityRepository activityRepo,
                       TripPlannerAgent plannerAgent, TripValidatorAgent validatorAgent,
                       TripMonitorAgent monitorAgent, TripReplannerAgent replannerAgent) {
        this.tripRepo = tripRepo;
        this.itineraryRepo = itineraryRepo;
        this.eventRepo = eventRepo;
        this.activityRepo = activityRepo;
        this.plannerAgent = plannerAgent;
        this.validatorAgent = validatorAgent;
        this.monitorAgent = monitorAgent;
        this.replannerAgent = replannerAgent;
    }

    /**
     * Create a new trip and generate an initial itinerary.
     */
    public TripResponse createTrip(TripRequest request) {
        log.info("Creating trip to {}", request.getDestination());

        Trip trip = new Trip();
        trip.setDestination(request.getDestination());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setBudget(request.getBudget());
        trip.setInterests(String.join(",", request.getInterests()));

        trip = tripRepo.save(trip);

        // Agent: Plan itinerary
        plannerAgent.plan(trip);

        // Agent: Validate itinerary
        validatorAgent.validate(trip);

        return toTripResponse(trip);
    }

    /**
     * Get trip details by ID.
     */
    public TripResponse getTrip(Long tripId) {
        Trip trip = tripRepo.findById(tripId)
            .orElseThrow(() -> new IllegalArgumentException("Trip not found: " + tripId));
        return toTripResponse(trip);
    }

    /**
     * Get the itinerary for a trip.
     */
    public List<ItineraryItemResponse> getItinerary(Long tripId) {
        // Verify trip exists
        tripRepo.findById(tripId)
            .orElseThrow(() -> new IllegalArgumentException("Trip not found: " + tripId));

        return itineraryRepo.findByTripId(tripId).stream()
            .map(this::toItineraryItemResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get events for a trip.
     */
    public List<EventResponse> getEvents(Long tripId) {
        // Verify trip exists
        tripRepo.findById(tripId)
            .orElseThrow(() -> new IllegalArgumentException("Trip not found: " + tripId));

        return eventRepo.findByTripId(tripId).stream()
            .map(this::toEventResponse)
            .collect(Collectors.toList());
    }

    /**
     * Simulate a disruption on an itinerary item.
     */
    public EventResponse simulateDisruption(Long tripId, DisruptionRequest request) {
        log.info("Simulating disruption for trip {}, item {}", tripId, request.getItineraryItemId());

        // Verify trip exists
        tripRepo.findById(tripId)
            .orElseThrow(() -> new IllegalArgumentException("Trip not found: " + tripId));

        // Verify itinerary item exists
        ItineraryItem item = itineraryRepo.findById(request.getItineraryItemId())
            .orElseThrow(() -> new IllegalArgumentException("Itinerary item not found: " + request.getItineraryItemId()));

        // Mark the activity as unavailable
        activityRepo.setAvailable(item.getActivityId(), false);

        // Agent: Monitor and detect disruption
        monitorAgent.markDisrupted(tripId, request.getItineraryItemId(),
            request.getReason() != null ? request.getReason() : "Provider cancelled the activity.");

        // Return the latest disruption event
        List<Event> events = eventRepo.findByTripId(tripId);
        Event latestDisruption = events.stream()
            .filter(e -> "DISRUPTION_DETECTED".equals(e.getEventType()))
            .reduce((first, second) -> second) // get last
            .orElseThrow(() -> new RuntimeException("Disruption event not found"));

        return toEventResponse(latestDisruption);
    }

    /**
     * Trigger replanning for a disrupted trip.
     */
    public ReplanResponse replan(Long tripId) {
        log.info("Replanning trip {}", tripId);

        Trip trip = tripRepo.findById(tripId)
            .orElseThrow(() -> new IllegalArgumentException("Trip not found: " + tripId));

        // Agent: Detect disrupted items
        List<ItineraryItem> disrupted = monitorAgent.detectDisruptions(tripId);
        if (disrupted.isEmpty()) {
            ReplanResponse response = new ReplanResponse();
            response.setSuccess(false);
            response.setMessage("No disrupted items found to replan.");
            return response;
        }

        // Agent: Replan the first disrupted item
        ItineraryItem disruptedItem = disrupted.get(0);
        ReplanResponse response = replannerAgent.replan(trip, disruptedItem);

        // Agent: Validate the updated itinerary
        if (response.isSuccess()) {
            validatorAgent.validate(trip);
        }

        return response;
    }

    // ---- DTO Converters ----

    private TripResponse toTripResponse(Trip trip) {
        TripResponse dto = new TripResponse();
        dto.setId(trip.getId());
        dto.setDestination(trip.getDestination());
        dto.setStartDate(trip.getStartDate());
        dto.setEndDate(trip.getEndDate());
        dto.setBudget(trip.getBudget());
        dto.setBudgetUsed(itineraryRepo.calculateBudgetUsed(trip.getId()));
        dto.setInterests(Arrays.asList(trip.getInterests().split(",")));
        dto.setCreatedAt(trip.getCreatedAt());

        // Determine status based on latest events
        List<Event> events = eventRepo.findByTripId(trip.getId());
        boolean hasDisruption = events.stream()
            .anyMatch(e -> "DISRUPTION_DETECTED".equals(e.getEventType()));
        boolean latestValidated = events.stream()
            .reduce((f, s) -> s)
            .map(e -> "PLAN_VALIDATED".equals(e.getEventType()))
            .orElse(false);

        if (latestValidated) {
            dto.setStatus("validated");
        } else if (hasDisruption) {
            dto.setStatus("disrupted");
        } else {
            dto.setStatus("active");
        }

        return dto;
    }

    private ItineraryItemResponse toItineraryItemResponse(ItineraryItem item) {
        ItineraryItemResponse dto = new ItineraryItemResponse();
        dto.setId(item.getId());
        dto.setActivityId(item.getActivityId());
        dto.setActivityName(item.getActivityName());
        dto.setActivityLocation(item.getActivityLocation());
        dto.setActivityCategory(item.getActivityCategory());
        dto.setActivityDescription(item.getActivityDescription());
        dto.setActivityPrice(item.getActivityPrice());
        dto.setActivityDurationMinutes(item.getActivityDurationMinutes());
        dto.setDate(item.getDate());
        dto.setStartTime(item.getStartTime());
        dto.setEndTime(item.getEndTime());
        dto.setStatus(item.getStatus());
        dto.setReplacedBy(item.getReplacedBy());
        return dto;
    }

    private EventResponse toEventResponse(Event event) {
        EventResponse dto = new EventResponse();
        dto.setId(event.getId());
        dto.setEventType(event.getEventType());
        dto.setMessage(event.getMessage());
        dto.setMetadata(event.getMetadata());
        dto.setCreatedAt(event.getCreatedAt());
        return dto;
    }
}
