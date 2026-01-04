package com.viettune.controller;

import com.viettune.dto.request.RecordingRequest;
import com.viettune.dto.response.MessageResponse;
import com.viettune.dto.response.RecordingDTO;
import com.viettune.enums.RecordingType;
import com.viettune.enums.Region;
import com.viettune.service.RecordingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recordings")
@RequiredArgsConstructor
public class RecordingController {

    private final RecordingService recordingService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RecordingDTO> createRecording(@Valid @RequestBody RecordingRequest request) {
        return ResponseEntity.ok(recordingService.createRecording(request));
    }

    @GetMapping
    public ResponseEntity<List<RecordingDTO>> getAllRecordings() {
        return ResponseEntity.ok(recordingService.getAllRecordings());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<RecordingDTO>> getRecentRecordings(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(recordingService.getRecentRecordings(limit));
    }

    @GetMapping("/popular")
    public ResponseEntity<List<RecordingDTO>> getPopularRecordings(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(recordingService.getPopularRecordings(limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecordingDTO> getRecordingById(@PathVariable Long id) {
        return ResponseEntity.ok(recordingService.getRecordingById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<RecordingDTO>> searchRecordings(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) RecordingType type,
            @RequestParam(required = false) Region region,
            @RequestParam(required = false) Long ethnicityId) {
        return ResponseEntity.ok(recordingService.searchRecordings(keyword, type, region, ethnicityId));
    }

    @PostMapping("/{id}/play")
    public ResponseEntity<MessageResponse> incrementPlayCount(@PathVariable Long id) {
        recordingService.incrementPlayCount(id);
        return ResponseEntity.ok(MessageResponse.builder()
                .message("Play count incremented")
                .success(true)
                .build());
    }

    @PostMapping("/{id}/download")
    public ResponseEntity<MessageResponse> incrementDownloadCount(@PathVariable Long id) {
        recordingService.incrementDownloadCount(id);
        return ResponseEntity.ok(MessageResponse.builder()
                .message("Download count incremented")
                .success(true)
                .build());
    }

    @PostMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> toggleLike(@PathVariable Long id) {
        recordingService.toggleLike(id);
        return ResponseEntity.ok(MessageResponse.builder()
                .message("Like toggled successfully")
                .success(true)
                .build());
    }
}
