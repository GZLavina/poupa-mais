package com.poupa_mais_backend.category;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.InsufficientAuthenticationException;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class CategoryControllerTest {

    private final CategoryService categoryService = mock(CategoryService.class);
    private final CategoryController categoryController = new CategoryController(categoryService);

    @Test
    void shouldThrowUnauthorizedWhenPrincipalIsNullOnCreate() {
        CreateCategoryRequest request = new CreateCategoryRequest("Casa", "desc");

        assertThrows(InsufficientAuthenticationException.class, () -> categoryController.create(null, request));
    }
}
