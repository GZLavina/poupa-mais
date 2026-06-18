package com.poupa_mais_backend.transaction;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.InsufficientAuthenticationException;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class TransactionControllerTest {

    private final TransactionService transactionService = mock(TransactionService.class);
    private final TransactionController transactionController = new TransactionController(transactionService);

    @Test
    void shouldThrowUnauthorizedWhenPrincipalIsNullOnCreate() {
        CreateTransactionRequest request = new CreateTransactionRequest(
                TransactionType.EXPENSE, new BigDecimal("10.00"), LocalDate.now(), "desc", 1L);

        assertThrows(InsufficientAuthenticationException.class, () -> transactionController.create(null, request));
    }

    @Test
    void shouldThrowUnauthorizedWhenPrincipalIsNullOnList() {
        assertThrows(InsufficientAuthenticationException.class, () -> transactionController.list(null));
    }
}
