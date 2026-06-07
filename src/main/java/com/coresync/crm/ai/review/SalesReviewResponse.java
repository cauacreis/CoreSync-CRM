package com.coresync.crm.ai.review;

import java.util.List;

public record SalesReviewResponse(
        int score,
        List<String> detectedErrors,
        List<String> improvementSuggestions,
        String objectionHandlingPerformance
) {}
