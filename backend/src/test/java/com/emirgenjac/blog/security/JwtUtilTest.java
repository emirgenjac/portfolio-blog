package com.emirgenjac.blog.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtUtilTest {

    private static final String SECRET = "test-jwt-secret-key-at-least-32-bytes-long";
    private static final String EMAIL = "admin@example.com";

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(SECRET);
    }

    @Test
    void generateTokenCanBeValidatedAndEmailExtracted() {
        String token = jwtUtil.generateToken(EMAIL);

        assertTrue(jwtUtil.validateToken(token));
        assertEquals(EMAIL, jwtUtil.extractEmail(token));
    }

    @Test
    void validateTokenRejectsGarbage() {
        assertFalse(jwtUtil.validateToken("not-a-jwt"));
        assertFalse(jwtUtil.validateToken(""));
    }

    @Test
    void validateTokenRejectsTamperedToken() {
        String token = jwtUtil.generateToken(EMAIL);
        String tampered = token.substring(0, token.length() - 2) + "xx";

        assertFalse(jwtUtil.validateToken(tampered));
        assertThrows(JwtException.class, () -> jwtUtil.extractEmail(tampered));
    }

    @Test
    void validateTokenRejectsTokenSignedWithAnotherKey() {
        SecretKey otherKey = Keys.hmacShaKeyFor("other-secret-key-at-least-32-bytes-long!".getBytes(StandardCharsets.UTF_8));
        String foreign = Jwts.builder()
                .setSubject(EMAIL)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(otherKey)
                .compact();

        assertFalse(jwtUtil.validateToken(foreign));
    }

    @Test
    void validateTokenRejectsExpiredToken() {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        String expired = Jwts.builder()
                .setSubject(EMAIL)
                .setIssuedAt(new Date(System.currentTimeMillis() - 10_000))
                .setExpiration(new Date(System.currentTimeMillis() - 1_000))
                .signWith(key)
                .compact();

        assertFalse(jwtUtil.validateToken(expired));
    }
}
