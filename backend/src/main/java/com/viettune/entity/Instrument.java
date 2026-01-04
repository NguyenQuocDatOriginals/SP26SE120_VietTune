package com.viettune.entity;

import com.viettune.enums.InstrumentCategory;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "instruments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Instrument extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InstrumentCategory category;

    @Column(name = "origin_ethnicity", length = 100)
    private String originEthnicity;

    @Column(name = "image_url")
    private String imageUrl;

    @Builder.Default
    @ManyToMany(mappedBy = "instruments")
    private Set<Recording> recordings = new HashSet<>();

    @Builder.Default
    @ManyToMany(mappedBy = "instruments")
    private Set<Performer> performers = new HashSet<>();
}
