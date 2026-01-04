package com.viettune.service;

import com.viettune.dto.response.EthnicityDTO;
import com.viettune.dto.response.PerformerDTO;
import com.viettune.entity.Performer;
import com.viettune.repository.PerformerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PerformerService {

    private final PerformerRepository performerRepository;

    public List<PerformerDTO> getAllPerformers() {
        return performerRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PerformerDTO getPerformerById(Long id) {
        if (id == null) {
            throw new RuntimeException("Performer ID cannot be null");
        }
        Performer performer = performerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Performer not found"));
        return convertToDTO(performer);
    }

    public List<PerformerDTO> getMasterPerformers() {
        return performerRepository.findByIsMaster(true).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private PerformerDTO convertToDTO(Performer performer) {
        return PerformerDTO.builder()
                .id(performer.getId())
                .name(performer.getName())
                .bio(performer.getBio())
                .birthDate(performer.getBirthDate())
                .deathDate(performer.getDeathDate())
                .isMaster(performer.isMaster())
                .imageUrl(performer.getImageUrl())
                .ethnicity(performer.getEthnicity() != null ? convertEthnicityToDTO(performer.getEthnicity()) : null)
                .build();
    }

    private EthnicityDTO convertEthnicityToDTO(com.viettune.entity.Ethnicity ethnicity) {
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
