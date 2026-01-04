package com.viettune.service;

import com.viettune.dto.response.InstrumentDTO;
import com.viettune.entity.Instrument;
import com.viettune.enums.InstrumentCategory;
import com.viettune.repository.InstrumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InstrumentService {

    private final InstrumentRepository instrumentRepository;

    public List<InstrumentDTO> getAllInstruments() {
        return instrumentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public InstrumentDTO getInstrumentById(Long id) {
        Instrument instrument = instrumentRepository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Instrument not found"));
        return convertToDTO(instrument);
    }

    public List<InstrumentDTO> getInstrumentsByCategory(InstrumentCategory category) {
        return instrumentRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private InstrumentDTO convertToDTO(Instrument instrument) {
        return InstrumentDTO.builder()
                .id(instrument.getId())
                .name(instrument.getName())
                .description(instrument.getDescription())
                .category(instrument.getCategory())
                .originEthnicity(instrument.getOriginEthnicity())
                .imageUrl(instrument.getImageUrl())
                .build();
    }
}
