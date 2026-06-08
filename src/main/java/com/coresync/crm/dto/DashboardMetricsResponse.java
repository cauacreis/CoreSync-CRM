package com.coresync.crm.dto;

import java.math.BigDecimal;
import java.util.Map;

public record DashboardMetricsResponse(
        long totalLeads,
        long totalWonLeads,
        double conversionRate,
        BigDecimal totalPipelineValue,
        BigDecimal totalRevenueWon,
        Map<String, Long> leadsByStatus,
        Map<String, BigDecimal> revenueByStatus
) {
}
