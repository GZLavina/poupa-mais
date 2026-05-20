package com.poupa_mais_backend.security;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    @Test
    void shouldGenerateAndParseToken() {
        JwtService jwtService = new JwtService("0123456789012345678901234567890123456789012345678901234567890123", 3600);

        String token = jwtService.generateToken(new AuthenticatedUser(5L, "ana@mail.com", "hash"));

        var claims = jwtService.parse(token);
        assertEquals("5", claims.getSubject());
        assertEquals("ana@mail.com", claims.get("email", String.class));
    }

    @Test
    void shouldRejectInvalidToken() {
        JwtService jwtService = new JwtService("0123456789012345678901234567890123456789012345678901234567890123", 3600);
        assertThrows(JwtException.class, () -> jwtService.parse("abc.def.ghi"));
    }
}
