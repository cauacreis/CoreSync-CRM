package com.coresync.crm.service;

import com.coresync.crm.model.Lead;
import com.coresync.crm.repository.LeadRepository;
import com.coresync.crm.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;

    public Lead createLead(Lead lead) {
        UUID companyId = TenantContext.getTenantId();
        if (companyId == null) {
            throw new IllegalStateException("Acesso negado: TenantContext não possui companyId");
        }
        
        lead.setCompanyId(companyId);
        return leadRepository.save(lead);
    }

    public List<Lead> getLeads() {
        UUID companyId = TenantContext.getTenantId();
        if (companyId == null) {
            throw new IllegalStateException("Acesso negado: TenantContext não possui companyId");
        }
        
        return leadRepository.findAllByCompanyId(companyId);
    }
}
