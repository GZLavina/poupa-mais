package com.poupa_mais_backend.summary;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BalanceResponse(
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal balance
) {
}
