package com.viettune.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EthnicityDTO {
    private Long id;
    private String name;
    private String description;
    private String population;
    private String location;
    private String imageUrl;
}
