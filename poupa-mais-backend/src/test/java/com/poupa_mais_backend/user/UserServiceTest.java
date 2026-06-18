package com.poupa_mais_backend.user;

import com.poupa_mais_backend.common.ConflictException;
import com.poupa_mais_backend.security.AuthenticatedUser;
import com.poupa_mais_backend.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private UserService userService;

    @Test
    void shouldCreateUser() {
        CreateUserRequest request = new CreateUserRequest("Maria", "maria@mail.com", "12345678");
        when(userRepository.existsByEmailIgnoreCase("maria@mail.com")).thenReturn(false);
        when(passwordEncoder.encode("12345678")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            java.lang.reflect.Field idField = User.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(user, 1L);
            return user;
        });
        when(jwtService.generateToken(any(AuthenticatedUser.class))).thenReturn("test-jwt-token");

        RegistrationResponse response = userService.createUser(request);

        assertEquals(1L, response.id());
        assertEquals("Maria", response.name());
        assertEquals("maria@mail.com", response.email());
        assertEquals("test-jwt-token", response.token());
        assertEquals("Bearer", response.tokenType());
    }

    @Test
    void shouldFailWhenEmailAlreadyExists() {
        when(userRepository.existsByEmailIgnoreCase("maria@mail.com")).thenReturn(true);

        assertThrows(ConflictException.class,
                () -> userService.createUser(new CreateUserRequest("Maria", "maria@mail.com", "12345678")));
    }
}
