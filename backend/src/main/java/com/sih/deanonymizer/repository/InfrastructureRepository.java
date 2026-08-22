package com.sih.deanonymizer.repository;

import com.sih.deanonymizer.model.entity.Infrastructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InfrastructureRepository extends JpaRepository<Infrastructure, UUID> {
    List<Infrastructure> findByPersonaId(UUID personaId);
    List<Infrastructure> findByPersonaIdIn(List<UUID> personaIds);
    List<Infrastructure> findByValueContainingIgnoreCase(String value);
}
