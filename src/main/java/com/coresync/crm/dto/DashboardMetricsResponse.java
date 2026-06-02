package com.coresync.crm.dto;

import java.math.BigDecimal;

public record DashboardMetricsResponse(
        long totalLeads,
        long totalWonLeads,
        double conversionRate,
        BigDecimal totalPipelineValue,
        BigDecimal totalRevenueWon
) {
}
