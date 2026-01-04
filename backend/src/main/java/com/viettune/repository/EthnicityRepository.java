package com.viettune.repository;

import com.viettune.entity.Ethnicity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EthnicityRepository extends JpaRepository<Ethnicity, Long> {
    Optional<Ethnicity> findByName(String name);
    List<Ethnicity> findByLocationContainingIgnoreCase(String location);
}
