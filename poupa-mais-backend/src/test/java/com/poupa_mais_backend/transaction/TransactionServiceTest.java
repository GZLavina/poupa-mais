package com.poupa_mais_backend.transaction;

import com.poupa_mais_backend.category.Category;
import com.poupa_mais_backend.category.CategoryRepository;
import com.poupa_mais_backend.common.NotFoundException;
import com.poupa_mais_backend.user.User;
import com.poupa_mais_backend.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TransactionService transactionService;

    @Test
    void shouldFailCreateWhenCategoryNotOwnedByUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        when(categoryRepository.findByIdAndUserId(5L, 1L)).thenReturn(Optional.empty());

        CreateTransactionRequest request = new CreateTransactionRequest(
                TransactionType.EXPENSE, new BigDecimal("10.00"), LocalDate.now(), "Mercado", 5L);

        assertThrows(NotFoundException.class, () -> transactionService.create(1L, request));
    }

    @Test
    void shouldFailCreateWhenUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        CreateTransactionRequest request = new CreateTransactionRequest(
                TransactionType.EXPENSE, new BigDecimal("10.00"), LocalDate.now(), "Mercado", 5L);

        assertThrows(NotFoundException.class, () -> transactionService.create(1L, request));
    }

    @Test
    void shouldCreateTransactionWhenValid() {
        User user = new User();
        Category category = new Category();
        category.setName("Mercado");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(categoryRepository.findByIdAndUserId(3L, 1L)).thenReturn(Optional.of(category));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateTransactionRequest request = new CreateTransactionRequest(
                TransactionType.INCOME, new BigDecimal("1500.00"), LocalDate.of(2026, 5, 1), "Salário", 3L);

        TransactionResponse response = transactionService.create(1L, request);

        assertEquals(TransactionType.INCOME, response.type());
        assertEquals(new BigDecimal("1500.00"), response.amount());
        assertEquals(LocalDate.of(2026, 5, 1), response.date());
        assertEquals("Mercado", response.categoryName());
    }
}
