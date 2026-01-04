package com.viettune.dto.response;

import com.viettune.enums.RecordingType;
import com.viettune.enums.Region;
import com.viettune.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordingDTO {
    private Long id;
    private String title;
    private String description;
    private String audioUrl;
    private String coverImageUrl;
    private Integer durationSeconds;
    private RecordingType recordingType;
    private Region region;
    private LocalDate recordingDate;
    private String location;
    private String ceremonialContext;
    private VerificationStatus verificationStatus;
    private Integer playCount;
    private Integer likeCount;
    private Integer downloadCount;
    private UserDTO uploader;
    private EthnicityDTO ethnicity;
    private List<InstrumentDTO> instruments;
    private List<PerformerDTO> performers;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
