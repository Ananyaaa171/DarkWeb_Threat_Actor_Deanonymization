package com.sih.deanonymizer.repository;

import com.sih.deanonymizer.model.entity.Identifier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IdentifierRepository extends JpaRepository<Identifier, UUID> {
    List<Identifier> findByPersonaId(UUID personaId);
    List<Identifier> findByPersonaIdIn(List<UUID> personaIds);
    List<Identifier> findByValueContainingIgnoreCase(String value);
    List<Identifier> findByTypeAndValue(String type, String value);
}
