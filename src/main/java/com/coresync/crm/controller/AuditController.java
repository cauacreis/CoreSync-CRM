package com.coresync.crm.controller;

import com.coresync.crm.model.AuditLog;
import com.coresync.crm.repository.AuditLogRepository;
import com.coresync.crm.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        UUID companyId = TenantContext.getTenantId();
        if (companyId == null) {
            return ResponseEntity.status(403).build();
        }
        
        List<AuditLog> logs = auditLogRepository.findAllByCompanyIdOrderByTimestampDesc(companyId);
        return ResponseEntity.ok(logs);
    }
}
