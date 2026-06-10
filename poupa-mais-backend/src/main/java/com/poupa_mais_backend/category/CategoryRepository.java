package com.poupa_mais_backend.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByUserIdAndNameIgnoreCase(Long userId, String name);
    Optional<Category> findByIdAndUserId(Long id, Long userId);
    List<Category> findByUserIdOrderByNameAsc(Long userId);
}
