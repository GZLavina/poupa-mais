package com.poupa_mais_backend.transaction;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateTransactionRequest(
        @NotNull TransactionType type,
        @NotNull @Positive @Digits(integer = 13, fraction = 2) BigDecimal amount,
        @NotNull LocalDate date,
        @Size(max = 255) String description,
        @NotNull Long categoryId
) {
}
