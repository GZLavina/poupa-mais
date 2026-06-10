package com.poupa_mais_backend.summary;

import com.poupa_mais_backend.transaction.TransactionType;

import java.math.BigDecimal;

/**
 * One row of the category summary: a category's total within the period and its
 * share (percentage) of the summary total.
 */
public record CategorySummaryItem(
        Long categoryId,
        String categoryName,
        TransactionType type,
        BigDecimal total,
        BigDecimal percentage
) {
}
