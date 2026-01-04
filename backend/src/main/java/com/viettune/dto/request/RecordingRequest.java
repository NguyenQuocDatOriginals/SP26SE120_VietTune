package com.viettune.dto.request;

import com.viettune.enums.RecordingType;
import com.viettune.enums.Region;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordingRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Audio URL is required")
    private String audioUrl;

    private String coverImageUrl;

    private Integer durationSeconds;

    private RecordingType recordingType;

    private Region region;

    private LocalDate recordingDate;

    private String location;

    private String ceremonialContext;

    private Long ethnicityId;

    private List<Long> instrumentIds;

    private List<Long> performerIds;
}
