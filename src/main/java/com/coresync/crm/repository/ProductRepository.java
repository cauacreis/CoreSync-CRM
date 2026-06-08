package com.coresync.crm.repository;

import com.coresync.crm.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findAllByCompanyId(UUID companyId);
    Optional<Product> findByIdAndCompanyId(UUID id, UUID companyId);
}
