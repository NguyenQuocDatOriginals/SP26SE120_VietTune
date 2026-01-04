package com.viettune.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "performers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Performer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "death_date")
    private LocalDate deathDate;

    @Builder.Default
    @Column(name = "is_master")
    private boolean isMaster = false;

    @Column(name = "image_url")
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ethnicity_id")
    private Ethnicity ethnicity;

    @Builder.Default
    @ManyToMany
    @JoinTable(name = "performer_instruments", joinColumns = @JoinColumn(name = "performer_id"), inverseJoinColumns = @JoinColumn(name = "instrument_id"))
    private Set<Instrument> instruments = new HashSet<>();

    @Builder.Default
    @ManyToMany(mappedBy = "performers")
    private Set<Recording> recordings = new HashSet<>();
}
