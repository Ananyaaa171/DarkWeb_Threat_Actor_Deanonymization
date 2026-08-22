package com.sih.deanonymizer.repository;

import com.sih.deanonymizer.model.entity.LinkageAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LinkageAnalysisRepository extends JpaRepository<LinkageAnalysis, UUID> {
    List<LinkageAnalysis> findBySourcePersonaIdOrTargetPersonaId(UUID sourceId, UUID targetId);
    List<LinkageAnalysis> findBySourcePersonaIdInOrTargetPersonaIdIn(List<UUID> sourceIds, List<UUID> targetIds);
    Optional<LinkageAnalysis> findBySourcePersonaIdAndTargetPersonaId(UUID sourceId, UUID targetId);
    List<LinkageAnalysis> findAllByOrderByAttributionScoreDesc();
}
