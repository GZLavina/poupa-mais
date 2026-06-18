package com.poupa_mais_backend.user;

public record RegistrationResponse(Long id, String name, String email, String token, String tokenType) {
}
