package com.travelpilot.controller;

import com.travelpilot.model.Activity;
import com.travelpilot.repository.ActivityRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ActivityController {

    private final ActivityRepository activityRepo;

    public ActivityController(ActivityRepository activityRepo) {
        this.activityRepo = activityRepo;
    }

    @GetMapping("/activities")
    public ResponseEntity<List<Activity>> getActivities() {
        return ResponseEntity.ok(activityRepo.findAll());
    }
}
