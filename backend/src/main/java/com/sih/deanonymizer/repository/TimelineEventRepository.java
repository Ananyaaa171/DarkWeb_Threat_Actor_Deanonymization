package com.sih.deanonymizer.repository;

import com.sih.deanonymizer.model.entity.TimelineEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TimelineEventRepository extends JpaRepository<TimelineEvent, UUID> {

    List<TimelineEvent> findByPersonaIdOrderByEventTimestampDesc(UUID personaId);

    List<TimelineEvent> findByPersonaIdInOrderByEventTimestampDesc(List<UUID> personaIds);

    @Query("SELECT e FROM TimelineEvent e WHERE e.persona.id = :personaId " +
           "AND (:startDate IS NULL OR e.eventTimestamp >= :startDate) " +
           "AND (:endDate IS NULL OR e.eventTimestamp <= :endDate) " +
           "ORDER BY e.eventTimestamp DESC")
    Page<TimelineEvent> findByPersonaIdWithFilters(
            @Param("personaId") UUID personaId,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate,
            Pageable pageable
    );

    @Query("SELECT e FROM TimelineEvent e WHERE e.persona.id IN :personaIds " +
           "AND (:startDate IS NULL OR e.eventTimestamp >= :startDate) " +
           "AND (:endDate IS NULL OR e.eventTimestamp <= :endDate) " +
           "ORDER BY e.eventTimestamp DESC")
    Page<TimelineEvent> findByPersonaIdsWithFilters(
            @Param("personaIds") List<UUID> personaIds,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate,
            Pageable pageable
    );
}
