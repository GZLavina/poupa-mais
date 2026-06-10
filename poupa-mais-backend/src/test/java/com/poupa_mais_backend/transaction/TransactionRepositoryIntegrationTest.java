package com.poupa_mais_backend.transaction;

import com.poupa_mais_backend.category.Category;
import com.poupa_mais_backend.category.CategoryRepository;
import com.poupa_mais_backend.user.User;
import com.poupa_mais_backend.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@Transactional
class TransactionRepositoryIntegrationTest {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldListTransactionsByUserOrderedByDateDescending() {
        User user = new User();
        user.setName("Ana");
        user.setEmail("ana.tx@example.com");
        user.setPasswordHash("hash");
        user = userRepository.save(user);

        Category category = new Category();
        category.setName("Mercado");
        category.setUser(user);
        category = categoryRepository.save(category);

        transactionRepository.save(newTransaction(user, category,
                TransactionType.EXPENSE, "50.00", LocalDate.of(2026, 1, 1)));
        transactionRepository.save(newTransaction(user, category,
                TransactionType.INCOME, "1500.00", LocalDate.of(2026, 2, 1)));

        List<Transaction> result = transactionRepository.findByUserIdOrderByDateDescIdDesc(user.getId());

        assertEquals(2, result.size());
        assertEquals(LocalDate.of(2026, 2, 1), result.get(0).getDate());
        assertEquals(TransactionType.INCOME, result.get(0).getType());
        assertEquals("Mercado", result.get(0).getCategory().getName());
    }

    private Transaction newTransaction(User user, Category category, TransactionType type,
                                       String amount, LocalDate date) {
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setCategory(category);
        transaction.setType(type);
        transaction.setAmount(new BigDecimal(amount));
        transaction.setDate(date);
        transaction.setDescription("test");
        return transaction;
    }
}
