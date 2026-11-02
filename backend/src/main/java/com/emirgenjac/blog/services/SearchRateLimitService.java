package com.emirgenjac.blog.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SearchRateLimitService {

    private final InMemoryRateLimiter limiter;

    public SearchRateLimitService(
            @Value("${app.rate-limit.search.max-attempts:30}") int maxAttempts,
            @Value("${app.rate-limit.search.window-seconds:60}") long windowSeconds) {
        this.limiter = new InMemoryRateLimiter(maxAttempts, windowSeconds);
    }

    public boolean allowAttempt(String clientKey) {
        return limiter.allowAttempt(clientKey);
    }
}
