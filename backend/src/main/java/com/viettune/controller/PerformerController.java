package com.viettune.controller;

import com.viettune.dto.response.PerformerDTO;
import com.viettune.service.PerformerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/performers")
@RequiredArgsConstructor
public class PerformerController {

    private final PerformerService performerService;

    @GetMapping
    public ResponseEntity<List<PerformerDTO>> getAllPerformers() {
        return ResponseEntity.ok(performerService.getAllPerformers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PerformerDTO> getPerformerById(@PathVariable Long id) {
        return ResponseEntity.ok(performerService.getPerformerById(id));
    }

    @GetMapping("/masters")
    public ResponseEntity<List<PerformerDTO>> getMasterPerformers() {
        return ResponseEntity.ok(performerService.getMasterPerformers());
    }
}
