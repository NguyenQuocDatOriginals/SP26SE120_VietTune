package com.viettune.dto.response;

import com.viettune.enums.InstrumentCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstrumentDTO {
    private Long id;
    private String name;
    private String description;
    private InstrumentCategory category;
    private String originEthnicity;
    private String imageUrl;
}
