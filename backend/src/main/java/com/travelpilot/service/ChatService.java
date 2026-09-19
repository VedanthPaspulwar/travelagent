package com.travelpilot.service;

import com.travelpilot.dto.ChatRequest;
import com.travelpilot.dto.ChatResponse;
import com.travelpilot.model.Activity;
import com.travelpilot.model.ItineraryItem;
import com.travelpilot.model.Trip;
import com.travelpilot.repository.ActivityRepository;
import com.travelpilot.repository.ItineraryRepository;
import com.travelpilot.repository.TripRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for handling AI chat conversations.
 * Uses LLM API if configured, otherwise falls back to deterministic responses.
 */
@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    @Value("${travelpilot.llm.api-key:}")
    private String llmApiKey;

    @Value("${travelpilot.llm.api-url:}")
    private String llmApiUrl;

    @Value("${travelpilot.llm.provider:}")
    private String llmProvider;

    private final TripRepository tripRepo;
    private final ItineraryRepository itineraryRepo;
    private final ActivityRepository activityRepo;
    private final HttpClient httpClient;

    public ChatService(TripRepository tripRepo, ItineraryRepository itineraryRepo,
                       ActivityRepository activityRepo) {
        this.tripRepo = tripRepo;
        this.itineraryRepo = itineraryRepo;
        this.activityRepo = activityRepo;
        this.httpClient = HttpClient.newHttpClient();
    }

    public ChatResponse chat(ChatRequest request) {
        if (llmApiKey != null && !llmApiKey.isBlank()) {
            try {
                return callLlm(request);
            } catch (Exception e) {
                log.error("LLM call failed, using fallback", e);
                return fallbackResponse(request);
            }
        }
        return fallbackResponse(request);
    }

    /**
     * Deterministic fallback when no LLM API key is configured.
     */
    private ChatResponse fallbackResponse(ChatRequest request) {
        String msg = request.getMessage().toLowerCase();
        Trip trip = null;
        if (request.getTripId() != null) {
            trip = tripRepo.findById(request.getTripId()).orElse(null);
        }

        String reply;

        if (msg.contains("budget") || msg.contains("cost") || msg.contains("spend")) {
            if (trip != null) {
                double used = itineraryRepo.calculateBudgetUsed(trip.getId());
                double remaining = trip.getBudget() - used;
                reply = String.format("Your trip to %s has a total budget of ₹%.0f. " +
                    "You've spent ₹%.0f so far, leaving ₹%.0f remaining. " +
                    "You have room for additional activities within budget!",
                    trip.getDestination(), trip.getBudget(), used, remaining);
            } else {
                reply = "I'd be happy to help with budget questions! Please make sure you have an active trip first.";
            }
        } else if (msg.contains("adventure") || msg.contains("activity") || msg.contains("add")) {
            List<Activity> available = trip != null
                ? activityRepo.findAvailableNotInTrip(trip.getId())
                : activityRepo.findAvailable();
            List<String> adventureActivities = available.stream()
                .filter(a -> "adventure".equals(a.getCategory()))
                .map(a -> a.getName() + " (₹" + (int) a.getPrice() + ")")
                .collect(Collectors.toList());

            if (!adventureActivities.isEmpty()) {
                reply = "Here are available adventure activities: " +
                    String.join(", ", adventureActivities) +
                    ". Would you like me to add any of these to your itinerary?";
            } else {
                reply = "All adventure activities are already in your itinerary or currently unavailable. " +
                    "Consider trying activities from other categories like food or sightseeing!";
            }
        } else if (msg.contains("itinerary") || msg.contains("plan") || msg.contains("schedule")) {
            if (trip != null) {
                List<ItineraryItem> items = itineraryRepo.findActiveByTripId(trip.getId());
                String activities = items.stream()
                    .map(i -> i.getStartTime() + " - " + i.getActivityName())
                    .collect(Collectors.joining(", "));
                reply = String.format("Your current itinerary for %s includes: %s. " +
                    "I'm actively monitoring for any disruptions.", trip.getDestination(), activities);
            } else {
                reply = "Create a trip first, and I'll help you manage your itinerary!";
            }
        } else if (msg.contains("weather") || msg.contains("rain")) {
            reply = trip != null
                ? "October in " + trip.getDestination() + " is post-monsoon season. " +
                  "Expect pleasant weather with temperatures around 28-32°C. " +
                  "Occasional light showers are possible, so keep a rain jacket handy!"
                : "I can provide weather insights once you have an active trip!";
        } else if (msg.contains("food") || msg.contains("eat") || msg.contains("restaurant")) {
            reply = "Goa is famous for its seafood and Portuguese-influenced cuisine! " +
                "Don't miss the Goan fish curry, prawn balchão, and bebinca for dessert. " +
                "Your itinerary includes a Goan Thali Lunch — a perfect introduction to local flavors.";
        } else if (msg.contains("hello") || msg.contains("hi") || msg.contains("hey")) {
            reply = trip != null
                ? "Hello! I'm TravelPilot, your AI travel assistant. " +
                  "I'm currently managing your trip to " + trip.getDestination() + ". " +
                  "How can I help you today?"
                : "Hello! I'm TravelPilot, your AI travel assistant. " +
                  "Create a trip and I'll help you plan and manage everything!";
        } else {
            reply = trip != null
                ? "I'm TravelPilot, your AI travel assistant for your " + trip.getDestination() + " trip. " +
                  "I can help with budget questions, suggest activities, provide weather info, " +
                  "or give you details about your itinerary. What would you like to know?"
                : "I'm TravelPilot, your AI travel assistant. I can help with trip planning, " +
                  "budget management, activity suggestions, and more. Create a trip to get started!";
        }

        return new ChatResponse(reply, "fallback");
    }

    /**
     * Call external LLM API (supports Gemini format).
     */
    private ChatResponse callLlm(ChatRequest request) throws Exception {
        Trip trip = request.getTripId() != null
            ? tripRepo.findById(request.getTripId()).orElse(null) : null;

        // Build context for the LLM
        StringBuilder context = new StringBuilder();
        context.append("You are TravelPilot, an AI travel assistant. ");
        if (trip != null) {
            double budgetUsed = itineraryRepo.calculateBudgetUsed(trip.getId());
            context.append("The user has a trip to ").append(trip.getDestination())
                .append(" from ").append(trip.getStartDate()).append(" to ").append(trip.getEndDate())
                .append(". Budget: ₹").append(trip.getBudget()).append(", Used: ₹").append(budgetUsed)
                .append(". Interests: ").append(trip.getInterests()).append(". ");

            List<ItineraryItem> items = itineraryRepo.findActiveByTripId(trip.getId());
            context.append("Current itinerary: ");
            for (ItineraryItem item : items) {
                context.append(item.getDate()).append(" ").append(item.getStartTime())
                    .append(" ").append(item.getActivityName()).append("; ");
            }

            List<Activity> available = activityRepo.findAvailableNotInTrip(trip.getId());
            context.append("Available activities: ");
            for (Activity a : available) {
                context.append(a.getName()).append(" (₹").append(a.getPrice())
                    .append(", ").append(a.getCategory()).append("); ");
            }
        }
        context.append("Respond helpfully and concisely. Do not modify the database directly.");

        String requestBody = String.format(
            "{\"contents\":[{\"parts\":[{\"text\":\"%s\\n\\nUser: %s\"}]}]}",
            context.toString().replace("\"", "\\\""),
            request.getMessage().replace("\"", "\\\"")
        );

        String url = llmApiUrl + "?key=" + llmApiKey;
        HttpRequest httpRequest = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();

        HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

        if (httpResponse.statusCode() == 200) {
            // Extract text from Gemini response (simple extraction)
            String body = httpResponse.body();
            int textStart = body.indexOf("\"text\":\"") + 8;
            int textEnd = body.indexOf("\"", textStart);
            if (textStart > 7 && textEnd > textStart) {
                String text = body.substring(textStart, textEnd);
                return new ChatResponse(text, "llm");
            }
        }

        log.warn("LLM returned status {}, falling back", httpResponse.statusCode());
        return fallbackResponse(request);
    }
}
