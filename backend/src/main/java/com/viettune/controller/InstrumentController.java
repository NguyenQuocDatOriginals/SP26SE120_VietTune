package com.viettune.controller;

import com.viettune.dto.response.InstrumentDTO;
import com.viettune.enums.InstrumentCategory;
import com.viettune.service.InstrumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/instruments")
@RequiredArgsConstructor
public class InstrumentController {

    private final InstrumentService instrumentService;

    @GetMapping
    public ResponseEntity<List<InstrumentDTO>> getAllInstruments() {
        return ResponseEntity.ok(instrumentService.getAllInstruments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InstrumentDTO> getInstrumentById(@PathVariable Long id) {
        return ResponseEntity.ok(instrumentService.getInstrumentById(id));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<InstrumentDTO>> getInstrumentsByCategory(@PathVariable InstrumentCategory category) {
        return ResponseEntity.ok(instrumentService.getInstrumentsByCategory(category));
    }
}
