package com.viettune.service;

import com.viettune.dto.response.EthnicityDTO;
import com.viettune.entity.Ethnicity;
import com.viettune.repository.EthnicityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EthnicityService {

    private final EthnicityRepository ethnicityRepository;

    public List<EthnicityDTO> getAllEthnicities() {
        return ethnicityRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public EthnicityDTO getEthnicityById(Long id) {
        Ethnicity ethnicity = ethnicityRepository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Ethnicity not found"));
        return convertToDTO(ethnicity);
    }

    private EthnicityDTO convertToDTO(Ethnicity ethnicity) {
        return EthnicityDTO.builder()
                .id(ethnicity.getId())
                .name(ethnicity.getName())
                .description(ethnicity.getDescription())
                .population(ethnicity.getPopulation())
                .location(ethnicity.getLocation())
                .imageUrl(ethnicity.getImageUrl())
                .build();
    }
}
