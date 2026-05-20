package com.poupa_mais_backend.security;

public record AuthenticatedUser(Long id, String email, String passwordHash) {
}
