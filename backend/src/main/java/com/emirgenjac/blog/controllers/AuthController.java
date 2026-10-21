package com.emirgenjac.blog.controllers;

import com.emirgenjac.blog.dto.AdminLoginDTO;
import com.emirgenjac.blog.dto.CsrfTokenDTO;
import com.emirgenjac.blog.services.AdminService;
import com.emirgenjac.blog.services.JwtService;
import com.emirgenjac.blog.services.LoginRateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final String JWT_COOKIE_NAME = "jwt";

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private LoginRateLimitService loginRateLimitService;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:Lax}")
    private String cookieSameSite;

    @Value("${app.cookie.max-age-seconds:604800}")
    private long cookieMaxAgeSeconds;

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @jakarta.validation.Valid @RequestBody AdminLoginDTO request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {

        String clientKey = resolveClientKey(httpRequest);
        if (!loginRateLimitService.allowAttempt(clientKey)) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many login attempts. Please try again later.");
        }

        boolean authenticated = adminService.authenticate(request.getEmail(), request.getPassword());
        if (!authenticated) {
            return ResponseEntity.status(401).build();
        }

        String token = jwtService.generateToken(request.getEmail());
        setJwtCookie(response, token, cookieMaxAgeSeconds);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        setJwtCookie(response, "", 0);
        return ResponseEntity.ok().build();
    }

    /**
     * CSRF token for the SPA. JS on a different origin (Pages vs Render) cannot read
     * the {@code XSRF-TOKEN} cookie via {@code document.cookie}, so it uses this JSON
     * value as the {@code X-XSRF-TOKEN} header. Same value as the cookie.
     */
    @GetMapping("/csrf")
    public CsrfTokenDTO csrf(CsrfToken csrfToken) {
        return new CsrfTokenDTO(csrfToken.getToken(), csrfToken.getHeaderName());
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok().build();
    }

    private void setJwtCookie(HttpServletResponse response, String token, long maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from(JWT_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite(cookieSameSite)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    /**
     * Prefer first X-Forwarded-For hop when behind a reverse proxy (Render, etc.);
     * otherwise use the direct remote address.
     */
    private String resolveClientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
