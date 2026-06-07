package com.coresync.crm.controller;

import com.coresync.crm.dto.LeadRequest;
import com.coresync.crm.dto.UpdateStatusRequest;
import com.coresync.crm.model.Lead;
import com.coresync.crm.service.LeadService;
import com.coresync.crm.ai.GroqClientService;
import com.coresync.crm.security.TenantContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;
    private final GroqClientService groqClientService;

    @PostMapping
    public ResponseEntity<Lead> createLead(@Valid @RequestBody LeadRequest request) {
        Lead lead = Lead.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .status(request.getStatus())
                .estimatedValue(request.getEstimatedValue())
                .build();
        
        Lead createdLead = leadService.createLead(lead);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdLead);
    }

    @GetMapping
    public ResponseEntity<List<Lead>> getLeads() {
        List<Lead> leads = leadService.getLeads();
        return ResponseEntity.ok(leads);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Lead> updateLeadStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStatusRequest request) {
        Lead updatedLead = leadService.updateLeadStatus(id, request.getStatus());
        return ResponseEntity.ok(updatedLead);
    }

    @PostMapping("/{id}/interactions")
    public ResponseEntity<Lead> addInteraction(
            @PathVariable UUID id,
            @RequestBody java.util.Map<String, String> payload) {
        String message = payload.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Lead updatedLead = leadService.addInteractionToLead(id, message);
        return ResponseEntity.ok(updatedLead);
    }

    @GetMapping("/{id}/review")
    public ResponseEntity<com.coresync.crm.ai.review.SalesReviewResponse> reviewLeadConversation(
            @PathVariable UUID id) {

        Lead lead = leadService.getLeads().stream()
                .filter(l -> l.getId().equals(id))
                .findFirst()
                .orElse(null);

        if (lead == null) {
            return ResponseEntity.notFound().build();
        }

        com.coresync.crm.ai.review.SalesReviewResponse review = groqClientService.reviewConversation(lead.getChatHistory());
        return ResponseEntity.ok(review);
    }
}
