package com.viettune.repository;

import com.viettune.entity.Performer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerformerRepository extends JpaRepository<Performer, Long> {
    List<Performer> findByEthnicityId(Long ethnicityId);
    List<Performer> findByIsMaster(boolean isMaster);
    List<Performer> findByNameContainingIgnoreCase(String name);
}
