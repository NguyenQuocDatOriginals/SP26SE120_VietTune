package com.viettune.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "VietTune Archive API is running");
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("endpoints", Map.of(
                "auth", "/api/auth",
                "ethnicities", "/api/ethnicities",
                "instruments", "/api/instruments",
                "performers", "/api/performers",
                "recordings", "/api/recordings",
                "h2-console", "/h2-console"));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
}
