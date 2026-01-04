package com.viettune.repository;

import com.viettune.entity.Instrument;
import com.viettune.enums.InstrumentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstrumentRepository extends JpaRepository<Instrument, Long> {
    Optional<Instrument> findByName(String name);

    List<Instrument> findByCategory(InstrumentCategory category);

    List<Instrument> findByOriginEthnicity(String originEthnicity);
}
