package com.emirgenjac.blog.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class LoginRateLimitService {

    private final InMemoryRateLimiter limiter;

    public LoginRateLimitService(
            @Value("${app.rate-limit.login.max-attempts:5}") int maxAttempts,
            @Value("${app.rate-limit.login.window-seconds:60}") long windowSeconds) {
        this.limiter = new InMemoryRateLimiter(maxAttempts, windowSeconds);
    }

    public boolean allowAttempt(String clientKey) {
        return limiter.allowAttempt(clientKey);
    }
}
