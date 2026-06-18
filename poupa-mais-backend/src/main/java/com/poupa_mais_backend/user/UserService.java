package com.poupa_mais_backend.user;

import com.poupa_mais_backend.common.ConflictException;
import com.poupa_mais_backend.security.AuthenticatedUser;
import com.poupa_mais_backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public RegistrationResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("Email already in use");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        User saved = userRepository.save(user);

        String token = jwtService.generateToken(new AuthenticatedUser(saved.getId(), saved.getEmail(), saved.getPasswordHash()));
        return new RegistrationResponse(saved.getId(), saved.getName(), saved.getEmail(), token, "Bearer");
    }
}
