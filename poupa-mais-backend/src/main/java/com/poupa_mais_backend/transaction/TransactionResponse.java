package com.poupa_mais_backend.transaction;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionResponse(
        Long id,
        TransactionType type,
        BigDecimal amount,
        LocalDate date,
        String description,
        Long categoryId,
        String categoryName
) {
}
