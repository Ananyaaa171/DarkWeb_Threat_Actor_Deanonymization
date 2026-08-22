package com.sih.deanonymizer.repository;

import com.sih.deanonymizer.model.entity.ThreatActor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ThreatActorRepository extends JpaRepository<ThreatActor, UUID> {

    Optional<ThreatActor> findByCanonicalNameIgnoreCase(String canonicalName);

    List<ThreatActor> findByCanonicalNameContainingIgnoreCase(String query);

    @Query("SELECT a FROM ThreatActor a WHERE " +
           "(:category IS NULL OR LOWER(a.threatCategory) = LOWER(:category)) AND " +
           "(:minConfidence IS NULL OR a.overallConfidenceScore >= :minConfidence) AND " +
           "(:query IS NULL OR LOWER(a.canonicalName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(a.summary) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<ThreatActor> findWithFilters(
            @Param("category") String category,
            @Param("minConfidence") BigDecimal minConfidence,
            @Param("query") String query,
            Pageable pageable
    );
}
