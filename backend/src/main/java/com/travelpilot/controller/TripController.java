package com.travelpilot.controller;

import com.travelpilot.dto.*;
import com.travelpilot.service.TripService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "TravelPilot"));
    }

    @PostMapping("/trips")
    public ResponseEntity<TripResponse> createTrip(@RequestBody TripRequest request) {
        TripResponse response = tripService.createTrip(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/trips/{tripId}")
    public ResponseEntity<TripResponse> getTrip(@PathVariable Long tripId) {
        try {
            TripResponse response = tripService.getTrip(tripId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/trips/{tripId}/itinerary")
    public ResponseEntity<List<ItineraryItemResponse>> getItinerary(@PathVariable Long tripId) {
        try {
            List<ItineraryItemResponse> items = tripService.getItinerary(tripId);
            return ResponseEntity.ok(items);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/trips/{tripId}/events")
    public ResponseEntity<List<EventResponse>> getEvents(@PathVariable Long tripId) {
        try {
            List<EventResponse> events = tripService.getEvents(tripId);
            return ResponseEntity.ok(events);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/trips/{tripId}/disruptions")
    public ResponseEntity<EventResponse> simulateDisruption(
            @PathVariable Long tripId,
            @RequestBody DisruptionRequest request) {
        try {
            EventResponse response = tripService.simulateDisruption(tripId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/trips/{tripId}/replan")
    public ResponseEntity<ReplanResponse> replan(@PathVariable Long tripId) {
        try {
            ReplanResponse response = tripService.replan(tripId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
