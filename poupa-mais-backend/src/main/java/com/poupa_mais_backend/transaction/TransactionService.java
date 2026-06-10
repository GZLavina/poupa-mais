package com.poupa_mais_backend.transaction;

import com.poupa_mais_backend.category.Category;
import com.poupa_mais_backend.category.CategoryRepository;
import com.poupa_mais_backend.common.NotFoundException;
import com.poupa_mais_backend.user.User;
import com.poupa_mais_backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public TransactionService(
            TransactionRepository transactionRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TransactionResponse create(Long userId, CreateTransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Category category = categoryRepository.findByIdAndUserId(request.categoryId(), userId)
                .orElseThrow(() -> new NotFoundException("Category not found"));

        Transaction transaction = new Transaction();
        transaction.setType(request.type());
        transaction.setAmount(request.amount());
        transaction.setDate(request.date());
        transaction.setDescription(request.description() == null ? null : request.description().trim());
        transaction.setCategory(category);
        transaction.setUser(user);

        return toResponse(transactionRepository.save(transaction));
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> list(Long userId) {
        return transactionRepository.findByUserIdOrderByDateDescIdDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    private TransactionResponse toResponse(Transaction transaction) {
        Category category = transaction.getCategory();
        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getDate(),
                transaction.getDescription(),
                category.getId(),
                category.getName()
        );
    }
}
