package com.sih.deanonymizer.repository;

import com.sih.deanonymizer.model.entity.EvidenceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EvidenceItemRepository extends JpaRepository<EvidenceItem, UUID> {
    List<EvidenceItem> findByLinkageId(UUID linkageId);
}
