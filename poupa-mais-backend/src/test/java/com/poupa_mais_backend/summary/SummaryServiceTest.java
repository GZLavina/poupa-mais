package com.poupa_mais_backend.summary;

import com.poupa_mais_backend.common.BadRequestException;
import com.poupa_mais_backend.transaction.CategoryTotal;
import com.poupa_mais_backend.transaction.TransactionRepository;
import com.poupa_mais_backend.transaction.TransactionType;
import com.poupa_mais_backend.transaction.TransactionTypeTotal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SummaryServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private SummaryService summaryService;

    @Test
    void shouldComputeBalanceFromAggregatedTotals() {
        when(transactionRepository.sumAmountByTypeForUser(any(), any(), any())).thenReturn(List.of(
                total(TransactionType.INCOME, "5200.00"),
                total(TransactionType.EXPENSE, "85.90")
        ));

        BalanceResponse response = summaryService.balance(1L, null, null);

        assertEquals(new BigDecimal("5200.00"), response.totalIncome());
        assertEquals(new BigDecimal("85.90"), response.totalExpense());
        assertEquals(new BigDecimal("5114.10"), response.balance());
    }

    @Test
    void shouldDefaultMissingTypeToZero() {
        when(transactionRepository.sumAmountByTypeForUser(any(), any(), any())).thenReturn(List.of(
                total(TransactionType.EXPENSE, "120.00")
        ));

        BalanceResponse response = summaryService.balance(1L, null, null);

        assertEquals(new BigDecimal("0.00"), response.totalIncome());
        assertEquals(new BigDecimal("120.00"), response.totalExpense());
        assertEquals(new BigDecimal("-120.00"), response.balance());
    }

    @Test
    void shouldReturnZeroBalanceWhenNoTransactions() {
        when(transactionRepository.sumAmountByTypeForUser(any(), any(), any())).thenReturn(List.of());

        BalanceResponse response = summaryService.balance(1L, null, null);

        assertEquals(new BigDecimal("0.00"), response.totalIncome());
        assertEquals(new BigDecimal("0.00"), response.totalExpense());
        assertEquals(new BigDecimal("0.00"), response.balance());
    }

    @Test
    void shouldRejectStartDateAfterEndDate() {
        assertThrows(BadRequestException.class,
                () -> summaryService.balance(1L, LocalDate.of(2026, 6, 30), LocalDate.of(2026, 6, 1)));
    }

    @Test
    void shouldComputeCategorySummaryWithPercentages() {
        when(transactionRepository.sumAmountByCategoryForUser(any(), any(), any(), any())).thenReturn(List.of(
                categoryTotal(3L, "Moradia", TransactionType.EXPENSE, "1200.00"),
                categoryTotal(5L, "Mercado", TransactionType.EXPENSE, "600.00")
        ));

        CategorySummaryResponse response = summaryService.byCategory(1L, null, null, TransactionType.EXPENSE);

        assertEquals(new BigDecimal("1800.00"), response.total());
        assertEquals(2, response.items().size());

        CategorySummaryItem moradia = response.items().get(0);
        assertEquals("Moradia", moradia.categoryName());
        assertEquals(new BigDecimal("1200.00"), moradia.total());
        assertEquals(new BigDecimal("66.67"), moradia.percentage());

        CategorySummaryItem mercado = response.items().get(1);
        assertEquals(new BigDecimal("33.33"), mercado.percentage());
    }

    @Test
    void shouldReturnEmptyCategorySummaryWhenNoTransactions() {
        when(transactionRepository.sumAmountByCategoryForUser(any(), any(), any(), any())).thenReturn(List.of());

        CategorySummaryResponse response = summaryService.byCategory(1L, null, null, null);

        assertEquals(new BigDecimal("0.00"), response.total());
        assertEquals(List.of(), response.items());
    }

    @Test
    void shouldRejectStartDateAfterEndDateOnCategorySummary() {
        assertThrows(BadRequestException.class,
                () -> summaryService.byCategory(1L, LocalDate.of(2026, 6, 30), LocalDate.of(2026, 6, 1), null));
    }

    private TransactionTypeTotal total(TransactionType type, String amount) {
        return new TransactionTypeTotal() {
            @Override
            public TransactionType getType() {
                return type;
            }

            @Override
            public BigDecimal getTotal() {
                return new BigDecimal(amount);
            }
        };
    }

    private CategoryTotal categoryTotal(Long categoryId, String categoryName, TransactionType type, String amount) {
        return new CategoryTotal() {
            @Override
            public Long getCategoryId() {
                return categoryId;
            }

            @Override
            public String getCategoryName() {
                return categoryName;
            }

            @Override
            public TransactionType getType() {
                return type;
            }

            @Override
            public BigDecimal getTotal() {
                return new BigDecimal(amount);
            }
        };
    }
}
