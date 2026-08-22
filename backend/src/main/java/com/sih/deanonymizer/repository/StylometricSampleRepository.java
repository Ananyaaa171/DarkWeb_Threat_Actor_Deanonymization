package com.sih.deanonymizer.repository;

import com.sih.deanonymizer.model.entity.StylometricSample;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StylometricSampleRepository extends JpaRepository<StylometricSample, UUID> {
    List<StylometricSample> findByPersonaId(UUID personaId);
    List<StylometricSample> findByPersonaIdIn(List<UUID> personaIds);
}
