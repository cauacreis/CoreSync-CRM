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
    private final LeadSmartTagWorker smartTagWorker;

    @com.coresync.crm.aop.Auditable(action = "LEAD_CREATED")
    public Lead createLead(Lead lead) {
        UUID companyId = TenantContext.getTenantId();
        if (companyId == null) {
            throw new IllegalStateException("Acesso negado: TenantContext não possui companyId");
        }
        
        lead.setCompanyId(companyId);
        Lead savedLead = leadRepository.save(lead);
        
        smartTagWorker.processSmartTagsAsync(savedLead);
        return savedLead;
    }

    public List<Lead> getLeads() {
        UUID companyId = TenantContext.getTenantId();
        if (companyId == null) {
            throw new IllegalStateException("Acesso negado: TenantContext não possui companyId");
        }
        
        return leadRepository.findAllByCompanyId(companyId);
    }

    @com.coresync.crm.aop.Auditable(action = "LEAD_UPDATED")
    public Lead updateLead(UUID leadId, com.coresync.crm.dto.LeadRequest request, com.coresync.crm.model.Product product) {
        UUID companyId = TenantContext.getTenantId();
        if (companyId == null) {
            throw new IllegalStateException("Acesso negado: TenantContext não possui companyId");
        }

        Lead lead = leadRepository.findByIdAndCompanyId(leadId, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Lead não encontrado ou não pertence a esta empresa"));

        boolean descChanged = request.getDescription() != null && !request.getDescription().equals(lead.getDescription());

        lead.setName(request.getName());
        lead.setEmail(request.getEmail());
        lead.setPhone(request.getPhone());
        if (request.getStatus() != null) {
            lead.setStatus(request.getStatus());
        }
        lead.setEstimatedValue(request.getEstimatedValue());
        lead.setDescription(request.getDescription());
        lead.setProduct(product);

        Lead savedLead = leadRepository.save(lead);
        
        if (descChanged) {
            smartTagWorker.processSmartTagsAsync(savedLead);
        }
        
        return savedLead;
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

    @com.coresync.crm.aop.Auditable(action = "LEAD_INTERACTION_ADDED")
    public Lead appendInteraction(UUID leadId, String message) {
        if (message == null || message.trim().isEmpty()) {
            throw new IllegalArgumentException("A mensagem da interação não pode ser vazia.");
        }
        
        UUID companyId = TenantContext.getTenantId();
        if (companyId == null) {
            throw new IllegalStateException("Acesso negado: TenantContext não possui companyId");
        }

        Lead lead = leadRepository.findByIdAndCompanyId(leadId, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Lead não encontrado ou não pertence a esta empresa"));

        String history = lead.getChatHistory();
        if (history == null) {
            history = "";
        }
        
        String timestamp = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
        String newEntry = String.format("[%s] %s\n", timestamp, message);
        
        lead.setChatHistory(history + newEntry);
        return leadRepository.save(lead);
    }
}
