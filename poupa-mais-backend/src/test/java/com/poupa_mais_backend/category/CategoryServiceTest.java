package com.poupa_mais_backend.category;

import com.poupa_mais_backend.common.ConflictException;
import com.poupa_mais_backend.common.NotFoundException;
import com.poupa_mais_backend.user.User;
import com.poupa_mais_backend.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    void shouldFailCreateWhenDuplicateNameForUser() {
        when(categoryRepository.existsByUserIdAndNameIgnoreCase(1L, "Casa")).thenReturn(true);

        assertThrows(ConflictException.class,
                () -> categoryService.create(1L, new CreateCategoryRequest("Casa", "desc")));
    }

    @Test
    void shouldFailUpdateWhenCategoryNotOwnedByUser() {
        when(categoryRepository.findByIdAndUserId(7L, 1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class,
                () -> categoryService.update(1L, 7L, new UpdateCategoryRequest("Nova", "desc")));
    }

    @Test
    void shouldFailDeleteWhenCategoryNotOwnedByUser() {
        when(categoryRepository.findByIdAndUserId(7L, 1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> categoryService.delete(1L, 7L));
    }

    @Test
    void shouldUpdateCategoryWhenNameDidNotChangeCaseInsensitive() {
        Category category = new Category();
        category.setName("Casa");
        category.setDescription("old");

        when(categoryRepository.findByIdAndUserId(7L, 1L)).thenReturn(Optional.of(category));
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> inv.getArgument(0));

        assertDoesNotThrow(() -> categoryService.update(1L, 7L, new UpdateCategoryRequest("casa", "new")));
    }

    @Test
    void shouldCreateCategoryWhenValid() {
        User user = new User();
        try {
            java.lang.reflect.Field idField = User.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(user, 1L);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        when(categoryRepository.existsByUserIdAndNameIgnoreCase(1L, "Casa")).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> inv.getArgument(0));

        assertDoesNotThrow(() -> categoryService.create(1L, new CreateCategoryRequest("Casa", "desc")));
    }
}
