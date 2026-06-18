package com.poupa_mais_backend.category;

import com.poupa_mais_backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<CategoryResponse> list(@AuthenticationPrincipal AuthenticatedUser user) {
        return categoryService.list(requireUserId(user));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse create(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody CreateCategoryRequest request
    ) {
        return categoryService.create(requireUserId(user), request);
    }

    @PutMapping("/{id}")
    public CategoryResponse update(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request
    ) {
        return categoryService.update(requireUserId(user), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal AuthenticatedUser user, @PathVariable Long id) {
        categoryService.delete(requireUserId(user), id);
    }

    private Long requireUserId(AuthenticatedUser user) {
        if (user == null || user.id() == null) {
            throw new InsufficientAuthenticationException("Authentication required");
        }
        return user.id();
    }
}
