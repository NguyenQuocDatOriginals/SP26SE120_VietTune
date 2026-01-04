package com.viettune.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformerDTO {
    private Long id;
    private String name;
    private String bio;
    private LocalDate birthDate;
    private LocalDate deathDate;
    private boolean isMaster;
    private String imageUrl;
    private EthnicityDTO ethnicity;
}
