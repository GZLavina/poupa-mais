package com.poupa_mais_backend.category;

import com.poupa_mais_backend.user.User;
import com.poupa_mais_backend.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class CategoryRepositoryIntegrationTest {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldMatchExistsByUserAndNameIgnoringCase() {
        User user = new User();
        user.setName("Ana");
        user.setEmail("ana@example.com");
        user.setPasswordHash("hash");
        user = userRepository.save(user);

        Category category = new Category();
        category.setName("Mercado");
        category.setDescription("Compras");
        category.setUser(user);
        categoryRepository.save(category);

        assertTrue(categoryRepository.existsByUserIdAndNameIgnoreCase(user.getId(), "mercado"));
        assertFalse(categoryRepository.existsByUserIdAndNameIgnoreCase(user.getId(), "viagem"));
    }
}
