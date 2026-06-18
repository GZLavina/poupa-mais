package com.poupa_mais_backend.summary;

import com.poupa_mais_backend.transaction.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Aggregated financial summary grouped by category for the requested period and
 * optional transaction type. {@code total} is the sum of all returned items.
 */
public record CategorySummaryResponse(
        LocalDate startDate,
        LocalDate endDate,
        TransactionType type,
        BigDecimal total,
        List<CategorySummaryItem> items
) {
}
