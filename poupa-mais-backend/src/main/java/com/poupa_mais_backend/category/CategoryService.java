package com.poupa_mais_backend.category;

import com.poupa_mais_backend.common.ConflictException;
import com.poupa_mais_backend.common.NotFoundException;
import com.poupa_mais_backend.user.User;
import com.poupa_mais_backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CategoryService(CategoryRepository categoryRepository, UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CategoryResponse create(Long userId, CreateCategoryRequest request) {
        String normalizedName = request.name().trim();
        if (categoryRepository.existsByUserIdAndNameIgnoreCase(userId, normalizedName)) {
            throw new ConflictException("Category name already exists for this user");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Category category = new Category();
        category.setName(normalizedName);
        category.setDescription(request.description() == null ? null : request.description().trim());
        category.setUser(user);

        Category saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    @Transactional
    public CategoryResponse update(Long userId, Long id, UpdateCategoryRequest request) {
        Category category = categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Category not found"));

        String normalizedName = request.name().trim();
        if (!category.getName().equalsIgnoreCase(normalizedName)
                && categoryRepository.existsByUserIdAndNameIgnoreCase(userId, normalizedName)) {
            throw new ConflictException("Category name already exists for this user");
        }

        category.setName(normalizedName);
        category.setDescription(request.description() == null ? null : request.description().trim());

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long userId, Long id) {
        Category category = categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Category not found"));
        categoryRepository.delete(category);
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getDescription());
    }
}
