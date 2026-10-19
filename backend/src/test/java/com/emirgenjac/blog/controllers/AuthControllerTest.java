package com.emirgenjac.blog.controllers;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AuthControllerTest {

    private final AuthController authController = new AuthController();

    @Test
    void meReturnsUnauthorizedWhenNoRealAuthenticationExists() {
        assertEquals(401, authController.me(null).getStatusCode().value());
        assertEquals(401, authController.me(new AnonymousAuthenticationToken("key", "anonymousUser", AuthorityUtils.createAuthorityList("ROLE_ANONYMOUS"))).getStatusCode().value());
    }

    @Test
    void meReturnsOkForAuthenticatedUser() {
        var authentication = new TestingAuthenticationToken("admin@example.com", null);
        authentication.setAuthenticated(true);

        assertEquals(200, authController.me(authentication).getStatusCode().value());
    }
}


