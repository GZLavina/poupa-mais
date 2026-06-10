package com.poupa_mais_backend.transaction;

import java.math.BigDecimal;

/**
 * Read-model projection for aggregated transaction totals grouped by type.
 */
public interface TransactionTypeTotal {
    TransactionType getType();
    BigDecimal getTotal();
}
