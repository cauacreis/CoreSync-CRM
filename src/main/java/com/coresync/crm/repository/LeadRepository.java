package com.coresync.crm.repository;

import com.coresync.crm.model.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID> {
    org.springframework.data.domain.Page<Lead> findAllByCompanyId(UUID companyId, org.springframework.data.domain.Pageable pageable);
    List<Lead> findAllByCompanyId(UUID companyId);
    Optional<Lead> findByIdAndCompanyId(UUID id, UUID companyId);
}
