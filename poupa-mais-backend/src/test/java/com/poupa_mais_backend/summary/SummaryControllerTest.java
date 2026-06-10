package com.poupa_mais_backend.summary;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.InsufficientAuthenticationException;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class SummaryControllerTest {

    private final SummaryService summaryService = mock(SummaryService.class);
    private final SummaryController summaryController = new SummaryController(summaryService);

    @Test
    void shouldThrowUnauthorizedWhenPrincipalIsNullOnBalance() {
        assertThrows(InsufficientAuthenticationException.class,
                () -> summaryController.balance(null, null, null));
    }

    @Test
    void shouldThrowUnauthorizedWhenPrincipalIsNullOnByCategory() {
        assertThrows(InsufficientAuthenticationException.class,
                () -> summaryController.byCategory(null, null, null, null));
    }
}
