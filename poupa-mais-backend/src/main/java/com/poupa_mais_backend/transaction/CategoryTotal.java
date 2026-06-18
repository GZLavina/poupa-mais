package com.poupa_mais_backend.transaction;

import java.math.BigDecimal;

/**
 * Read-model projection for aggregated transaction totals grouped by category and type.
 */
public interface CategoryTotal {
    Long getCategoryId();
    String getCategoryName();
    TransactionType getType();
    BigDecimal getTotal();
}
