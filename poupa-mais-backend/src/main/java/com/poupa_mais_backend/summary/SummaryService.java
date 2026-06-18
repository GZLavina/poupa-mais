package com.poupa_mais_backend.summary;

import com.poupa_mais_backend.common.BadRequestException;
import com.poupa_mais_backend.transaction.CategoryTotal;
import com.poupa_mais_backend.transaction.TransactionRepository;
import com.poupa_mais_backend.transaction.TransactionType;
import com.poupa_mais_backend.transaction.TransactionTypeTotal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class SummaryService {

    private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2);

    private final TransactionRepository transactionRepository;

    public SummaryService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public BalanceResponse balance(Long userId, LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new BadRequestException("startDate must be on or before endDate");
        }

        BigDecimal income = ZERO;
        BigDecimal expense = ZERO;

        for (TransactionTypeTotal row : transactionRepository.sumAmountByTypeForUser(userId, startDate, endDate)) {
            if (row.getType() == TransactionType.INCOME) {
                income = row.getTotal();
            } else if (row.getType() == TransactionType.EXPENSE) {
                expense = row.getTotal();
            }
        }

        return new BalanceResponse(startDate, endDate, income, expense, income.subtract(expense));
    }

    /**
     * Aggregates transaction totals by category for the period, optionally narrowed to a
     * single transaction type. Each item carries its share (percentage) of the summary total.
     * Percentages are computed in the backend so the frontend never owns financial math.
     */
    @Transactional(readOnly = true)
    public CategorySummaryResponse byCategory(Long userId, LocalDate startDate, LocalDate endDate, TransactionType type) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new BadRequestException("startDate must be on or before endDate");
        }

        List<CategoryTotal> rows = transactionRepository.sumAmountByCategoryForUser(userId, startDate, endDate, type);

        BigDecimal total = ZERO;
        for (CategoryTotal row : rows) {
            total = total.add(row.getTotal());
        }

        List<CategorySummaryItem> items = new ArrayList<>(rows.size());
        for (CategoryTotal row : rows) {
            items.add(new CategorySummaryItem(
                    row.getCategoryId(),
                    row.getCategoryName(),
                    row.getType(),
                    row.getTotal().setScale(2, RoundingMode.HALF_UP),
                    percentageOf(row.getTotal(), total)));
        }

        return new CategorySummaryResponse(startDate, endDate, type, total.setScale(2, RoundingMode.HALF_UP), items);
    }

    private BigDecimal percentageOf(BigDecimal part, BigDecimal total) {
        if (total.signum() == 0) {
            return ZERO;
        }
        return part.multiply(BigDecimal.valueOf(100)).divide(total, 2, RoundingMode.HALF_UP);
    }
}
