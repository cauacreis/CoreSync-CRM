package com.coresync.crm.service;

import com.coresync.crm.dto.DashboardMetricsResponse;
import com.coresync.crm.model.Lead;
import com.coresync.crm.model.LeadStatus;
import com.coresync.crm.repository.LeadRepository;
import com.coresync.crm.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LeadRepository leadRepository;

    public DashboardMetricsResponse getMetrics() {
        UUID companyId = TenantContext.getTenantId();
        if (companyId == null) {
            throw new IllegalStateException("Acesso negado: TenantContext não possui companyId");
        }

        List<Lead> leads = leadRepository.findAllByCompanyId(companyId);

        long totalLeads = leads.size();
        long totalWonLeads = leads.stream()
                .filter(lead -> lead.getStatus() == LeadStatus.WON)
                .count();

        double conversionRate = 0.0;
        if (totalLeads > 0) {
            conversionRate = ((double) totalWonLeads / totalLeads) * 100.0;
        }

        BigDecimal totalPipelineValue = leads.stream()
                .filter(lead -> lead.getStatus() != LeadStatus.LOST)
                .map(lead -> lead.getEstimatedValue() != null ? lead.getEstimatedValue() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRevenueWon = leads.stream()
                .filter(lead -> lead.getStatus() == LeadStatus.WON)
                .map(lead -> lead.getEstimatedValue() != null ? lead.getEstimatedValue() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardMetricsResponse(
                totalLeads,
                totalWonLeads,
                conversionRate,
                totalPipelineValue,
                totalRevenueWon
        );
    }
}
