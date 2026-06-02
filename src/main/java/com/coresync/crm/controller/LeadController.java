package com.coresync.crm.controller;

import com.coresync.crm.dto.LeadRequest;
import com.coresync.crm.model.Lead;
import com.coresync.crm.service.LeadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;

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
}
