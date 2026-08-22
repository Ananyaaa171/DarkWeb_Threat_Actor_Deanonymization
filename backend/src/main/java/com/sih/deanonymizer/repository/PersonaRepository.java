package com.sih.deanonymizer.repository;

import com.sih.deanonymizer.model.entity.Persona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PersonaRepository extends JpaRepository<Persona, UUID> {
    List<Persona> findByActorId(UUID actorId);
    List<Persona> findByActorIdIn(List<UUID> actorIds);
    Optional<Persona> findByHandleIgnoreCaseAndPlatformIgnoreCase(String handle, String platform);
    List<Persona> findByHandleContainingIgnoreCase(String handle);
}
