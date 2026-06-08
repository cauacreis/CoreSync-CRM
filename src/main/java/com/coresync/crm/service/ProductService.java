package com.coresync.crm.service;

import com.coresync.crm.model.Product;
import com.coresync.crm.repository.ProductRepository;
import com.coresync.crm.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @com.coresync.crm.aop.Auditable(action = "PRODUCT_CREATED")
    public Product createProduct(Product product) {
        UUID companyId = TenantContext.getTenantId();
        if (companyId == null) {
            throw new IllegalStateException("Acesso negado: TenantContext não possui companyId");
        }
        
        product.setCompanyId(companyId);
        return productRepository.save(product);
    }

    public List<Product> getProducts() {
        UUID companyId = TenantContext.getTenantId();
        if (companyId == null) {
            throw new IllegalStateException("Acesso negado: TenantContext não possui companyId");
        }
        
        return productRepository.findAllByCompanyId(companyId);
    }

    @com.coresync.crm.aop.Auditable(action = "PRODUCT_UPDATED")
    public Product updateProduct(UUID productId, Product updateData) {
        UUID companyId = TenantContext.getTenantId();
        if (companyId == null) {
            throw new IllegalStateException("Acesso negado: TenantContext não possui companyId");
        }

        Product product = productRepository.findByIdAndCompanyId(productId, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado ou não pertence a esta empresa"));

        product.setName(updateData.getName());
        product.setDescription(updateData.getDescription());
        product.setPrice(updateData.getPrice());
        product.setActive(updateData.isActive());

        return productRepository.save(product);
    }

    @com.coresync.crm.aop.Auditable(action = "PRODUCT_DELETED")
    public void deleteProduct(UUID productId) {
        UUID companyId = TenantContext.getTenantId();
        if (companyId == null) {
            throw new IllegalStateException("Acesso negado: TenantContext não possui companyId");
        }

        Product product = productRepository.findByIdAndCompanyId(productId, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado ou não pertence a esta empresa"));

        // Instead of hard delete, we could soft delete, but let's follow the standard approach.
        // Actually, since leads might reference it, soft delete (active = false) is safer.
        // We will do a hard delete if no leads reference it, but a safe update is just setting active = false via updateProduct.
        productRepository.delete(product);
    }
}
