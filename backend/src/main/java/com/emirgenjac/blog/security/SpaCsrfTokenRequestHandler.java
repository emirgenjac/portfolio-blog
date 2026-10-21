package com.emirgenjac.blog.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;

import java.util.function.Supplier;

/**
 * SPA CSRF handler. Uses the plain token (not XOR) so GET /auth/csrf, the
 * {@code XSRF-TOKEN} cookie, and the {@code X-XSRF-TOKEN} header all share one value.
 * XOR encoding would break cross-origin clients that cannot read the cookie and must
 * send the JSON token instead. BREACH is not a concern for this JSON API.
 */
public final class SpaCsrfTokenRequestHandler implements CsrfTokenRequestHandler {

    private final CsrfTokenRequestHandler plain = new CsrfTokenRequestAttributeHandler();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, Supplier<CsrfToken> csrfToken) {
        plain.handle(request, response, csrfToken);
        // Force token load so CookieCsrfTokenRepository can add the cookie to the response
        csrfToken.get();
    }

    @Override
    public String resolveCsrfTokenValue(HttpServletRequest request, CsrfToken csrfToken) {
        return plain.resolveCsrfTokenValue(request, csrfToken);
    }
}
