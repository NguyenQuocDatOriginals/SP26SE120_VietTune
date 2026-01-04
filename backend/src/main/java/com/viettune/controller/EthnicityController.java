package com.viettune.controller;

import com.viettune.dto.response.EthnicityDTO;
import com.viettune.service.EthnicityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ethnicities")
@RequiredArgsConstructor
public class EthnicityController {

    private final EthnicityService ethnicityService;

    @GetMapping
    public ResponseEntity<List<EthnicityDTO>> getAllEthnicities() {
        return ResponseEntity.ok(ethnicityService.getAllEthnicities());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EthnicityDTO> getEthnicityById(@PathVariable Long id) {
        return ResponseEntity.ok(ethnicityService.getEthnicityById(id));
    }
}
