package com.viettune.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "ethnicities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ethnicity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private String population;

    @Column(length = 200)
    private String location;

    @Column(name = "image_url")
    private String imageUrl;

    @Builder.Default
    @OneToMany(mappedBy = "ethnicity")
    private Set<Recording> recordings = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "ethnicity")
    private Set<Performer> performers = new HashSet<>();
}
