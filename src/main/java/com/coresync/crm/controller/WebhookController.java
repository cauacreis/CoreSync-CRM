package com.coresync.crm.controller;

import com.coresync.crm.dto.LeadRequest;
import com.coresync.crm.model.Lead;
import com.coresync.crm.model.LeadStatus;
import com.coresync.crm.security.TenantContext;
import com.coresync.crm.service.LeadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final LeadService leadService;

    @PostMapping("/leads/{companyId}")
    public ResponseEntity<String> receiveLead(
            @PathVariable UUID companyId,
            @Valid @RequestBody LeadRequest request) {
        
        try {
            // Isolamento manual do Tenant (já que não há token JWT)
            TenantContext.setTenantId(companyId);
            TenantContext.setUserEmail("webhook@system.com"); // Auditoria invisível

            Lead lead = Lead.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .phone(request.getPhone())
                    // Webhooks sempre entram como NEW
                    .status(LeadStatus.NEW) 
                    .estimatedValue(request.getEstimatedValue())
                    .build();

            leadService.createLead(lead);

            return ResponseEntity.status(HttpStatus.CREATED).body("Lead recebido com sucesso via Webhook.");
        } finally {
            // Limpa o contexto para não vazar memória/thread
            TenantContext.clear();
        }
    }
}
