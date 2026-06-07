package com.coresync.crm.controller;

import com.coresync.crm.dto.DashboardMetricsResponse;
import com.coresync.crm.service.DashboardService;
import com.coresync.crm.document.InvoiceGeneratorService;
import com.coresync.crm.repository.AuditLogRepository;
import com.coresync.crm.model.AuditLog;
import com.coresync.crm.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final InvoiceGeneratorService invoiceGeneratorService;
    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<DashboardMetricsResponse> getMetrics() {
        DashboardMetricsResponse metrics = dashboardService.getMetrics();
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportDashboard() {
        UUID companyId = TenantContext.getTenantId();
        if (companyId == null) {
            return ResponseEntity.status(403).build();
        }

        DashboardMetricsResponse metrics = dashboardService.getMetrics();
        List<AuditLog> auditLogs = auditLogRepository.findAllByCompanyIdOrderByTimestampDesc(companyId);

        byte[] pdfBytes = invoiceGeneratorService.generateDashboardReport(metrics, auditLogs);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "DashboardReport.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
