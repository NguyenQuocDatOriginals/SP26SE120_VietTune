package com.viettune.service;

import com.viettune.dto.request.RecordingRequest;
import com.viettune.dto.response.*;
import com.viettune.entity.*;
import com.viettune.enums.RecordingType;
import com.viettune.enums.Region;
import com.viettune.enums.VerificationStatus;
import com.viettune.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecordingService {

    private final RecordingRepository recordingRepository;
    private final UserRepository userRepository;
    private final EthnicityRepository ethnicityRepository;
    private final InstrumentRepository instrumentRepository;
    private final PerformerRepository performerRepository;
    private final RecordingLikeRepository likeRepository;

    @Transactional
    public RecordingDTO createRecording(RecordingRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User uploader = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Recording recording = Recording.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .audioUrl(request.getAudioUrl())
                .coverImageUrl(request.getCoverImageUrl())
                .durationSeconds(request.getDurationSeconds())
                .recordingType(request.getRecordingType())
                .region(request.getRegion())
                .recordingDate(request.getRecordingDate())
                .recordingLocation(request.getLocation())
                .ceremonialContext(request.getCeremonialContext())
                .verificationStatus(VerificationStatus.PENDING)
                .playCount(0L)
                .likeCount(0L)
                .downloadCount(0L)
                .uploader(uploader)
                .build();

        if (request.getEthnicityId() != null) {
            Long ethnicityId = request.getEthnicityId();
            Ethnicity ethnicity = ethnicityRepository.findById(java.util.Objects.requireNonNull(ethnicityId))
                    .orElseThrow(() -> new RuntimeException("Ethnicity not found"));
            recording.setEthnicity(ethnicity);
        }

        if (request.getInstrumentIds() != null && !request.getInstrumentIds().isEmpty()) {
            List<Long> instrumentIds = request.getInstrumentIds();
            List<Instrument> instruments = instrumentRepository
                    .findAllById(java.util.Objects.requireNonNull(instrumentIds));
            recording.setInstruments(new java.util.HashSet<>(instruments));
        }

        if (request.getPerformerIds() != null && !request.getPerformerIds().isEmpty()) {
            List<Long> performerIds = request.getPerformerIds();
            List<Performer> performers = performerRepository
                    .findAllById(java.util.Objects.requireNonNull(performerIds));
            recording.setPerformers(new java.util.HashSet<>(performers));
        }

        recording = recordingRepository.save(java.util.Objects.requireNonNull(recording));
        return convertToDTO(recording);
    }

    public List<RecordingDTO> getAllRecordings() {
        return recordingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public RecordingDTO getRecordingById(Long id) {
        Recording recording = recordingRepository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Recording not found"));
        return convertToDTO(recording);
    }

    public List<RecordingDTO> getRecentRecordings(int limit) {
        List<Recording> recordings = recordingRepository.findRecentRecordings();
        return recordings.stream()
                .limit(limit)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<RecordingDTO> getPopularRecordings(int limit) {
        List<Recording> recordings = recordingRepository.findPopularRecordings();
        return recordings.stream()
                .limit(limit)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<RecordingDTO> searchRecordings(String keyword, RecordingType type, Region region, Long ethnicityId) {
        List<Recording> recordings;

        if (keyword != null && !keyword.isEmpty()) {
            recordings = recordingRepository.searchByKeyword(keyword);
        } else {
            recordings = recordingRepository.findByFilters(type, region, ethnicityId, null);
        }

        return recordings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void incrementPlayCount(Long id) {
        Recording recording = recordingRepository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Recording not found"));
        recording.setPlayCount(recording.getPlayCount() + 1);
        recordingRepository.save(recording);
    }

    @Transactional
    public void incrementDownloadCount(Long id) {
        Recording recording = recordingRepository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Recording not found"));
        recording.setDownloadCount(recording.getDownloadCount() + 1);
        recordingRepository.save(recording);
    }

    @Transactional
    public void toggleLike(Long recordingId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Recording recording = recordingRepository.findById(java.util.Objects.requireNonNull(recordingId))
                .orElseThrow(() -> new RuntimeException("Recording not found"));

        if (likeRepository.existsByUserIdAndRecordingId(user.getId(), recordingId)) {
            likeRepository.deleteByUserIdAndRecordingId(user.getId(), recordingId);
            recording.setLikeCount(recording.getLikeCount() - 1);
        } else {
            RecordingLike like = RecordingLike.builder()
                    .user(user)
                    .recording(recording)
                    .build();
            likeRepository.save(java.util.Objects.requireNonNull(like));
            recording.setLikeCount(recording.getLikeCount() + 1);
        }

        recordingRepository.save(recording);
    }

    private RecordingDTO convertToDTO(Recording recording) {
        return RecordingDTO.builder()
                .id(recording.getId())
                .title(recording.getTitle())
                .description(recording.getDescription())
                .audioUrl(recording.getAudioUrl())
                .coverImageUrl(recording.getCoverImageUrl())
                .durationSeconds(recording.getDurationSeconds())
                .recordingType(recording.getRecordingType())
                .region(recording.getRegion())
                .recordingDate(recording.getRecordingDate())
                .location(recording.getRecordingLocation())
                .ceremonialContext(recording.getCeremonialContext())
                .verificationStatus(recording.getVerificationStatus())
                .playCount(recording.getPlayCount() != null ? recording.getPlayCount().intValue() : 0)
                .likeCount(recording.getLikeCount() != null ? recording.getLikeCount().intValue() : 0)
                .downloadCount(recording.getDownloadCount() != null ? recording.getDownloadCount().intValue() : 0)
                .uploader(convertUserToDTO(recording.getUploader()))
                .ethnicity(recording.getEthnicity() != null ? convertEthnicityToDTO(recording.getEthnicity()) : null)
                .instruments(recording.getInstruments() != null ? recording.getInstruments().stream()
                        .map(this::convertInstrumentToDTO).collect(Collectors.toList()) : null)
                .performers(recording.getPerformers() != null ? recording.getPerformers().stream()
                        .map(this::convertPerformerToDTO).collect(Collectors.toList()) : null)
                .createdAt(recording.getCreatedAt())
                .updatedAt(recording.getUpdatedAt())
                .build();
    }

    private UserDTO convertUserToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private EthnicityDTO convertEthnicityToDTO(Ethnicity ethnicity) {
        return EthnicityDTO.builder()
                .id(ethnicity.getId())
                .name(ethnicity.getName())
                .description(ethnicity.getDescription())
                .population(ethnicity.getPopulation())
                .location(ethnicity.getLocation())
                .imageUrl(ethnicity.getImageUrl())
                .build();
    }

    private InstrumentDTO convertInstrumentToDTO(Instrument instrument) {
        return InstrumentDTO.builder()
                .id(instrument.getId())
                .name(instrument.getName())
                .description(instrument.getDescription())
                .category(instrument.getCategory())
                .originEthnicity(instrument.getOriginEthnicity())
                .imageUrl(instrument.getImageUrl())
                .build();
    }

    private PerformerDTO convertPerformerToDTO(Performer performer) {
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
}
