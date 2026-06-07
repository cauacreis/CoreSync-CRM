package com.coresync.crm.service;

import com.coresync.crm.event.LeadStatusChangedEvent;
import com.coresync.crm.model.Lead;
import com.coresync.crm.model.LeadStatus;
import com.coresync.crm.repository.LeadRepository;
import com.coresync.crm.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;
    private final ApplicationEventPublisher eventPublisher;

    @com.coresync.crm.aop.Auditable(action = "LEAD_CREATED")
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

    @com.coresync.crm.aop.Auditable(action = "LEAD_STATUS_UPDATED")
    public Lead updateLeadStatus(UUID leadId, LeadStatus newStatus) {
        UUID companyId = TenantContext.getTenantId();
        if (companyId == null) {
            throw new IllegalStateException("Acesso negado: TenantContext não possui companyId");
        }

        Lead lead = leadRepository.findByIdAndCompanyId(leadId, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Lead não encontrado ou não pertence a esta empresa"));

        LeadStatus oldStatus = lead.getStatus();
        lead.setStatus(newStatus);
        Lead savedLead = leadRepository.save(lead);
        
        if (oldStatus != newStatus) {
            eventPublisher.publishEvent(new LeadStatusChangedEvent(this, companyId, savedLead.getId(), savedLead.getName(), oldStatus, newStatus));
        }
        
        return savedLead;
    }
}
