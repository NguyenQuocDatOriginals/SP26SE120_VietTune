package com.viettune.entity;

import com.viettune.enums.RecordingType;
import com.viettune.enums.Region;
import com.viettune.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "recordings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recording extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "audio_url", nullable = false)
    private String audioUrl;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Enumerated(EnumType.STRING)
    @Column(name = "recording_type", length = 30)
    private RecordingType recordingType;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private Region region;

    @Column(name = "recording_date")
    private LocalDate recordingDate;

    @Column(name = "recording_location", length = 200)
    private String recordingLocation;

    @Column(name = "ceremonial_context", length = 200)
    private String ceremonialContext;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", length = 20)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Builder.Default
    @Column(name = "play_count")
    private Long playCount = 0L;

    @Builder.Default
    @Column(name = "like_count")
    private Long likeCount = 0L;

    @Builder.Default
    @Column(name = "download_count")
    private Long downloadCount = 0L;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_id", nullable = false)
    private User uploader;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ethnicity_id")
    private Ethnicity ethnicity;

    @Builder.Default
    @ManyToMany
    @JoinTable(name = "recording_instruments", joinColumns = @JoinColumn(name = "recording_id"), inverseJoinColumns = @JoinColumn(name = "instrument_id"))
    private Set<Instrument> instruments = new HashSet<>();

    @Builder.Default
    @ManyToMany
    @JoinTable(name = "recording_performers", joinColumns = @JoinColumn(name = "recording_id"), inverseJoinColumns = @JoinColumn(name = "performer_id"))
    private Set<Performer> performers = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "recording", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<RecordingLike> likes = new HashSet<>();
}
