package com.emirgenjac.blog.services;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SearchRateLimitServiceTest {

    @Test
    void allowsUpToMaxAttemptsThenBlocksWithinWindow() {
        SearchRateLimitService limiter = new SearchRateLimitService(5, 60);
        String client = "203.0.113.20";

        for (int i = 0; i < 5; i++) {
            assertTrue(limiter.allowAttempt(client), "attempt " + (i + 1) + " should be allowed");
        }

        assertFalse(limiter.allowAttempt(client), "6th attempt should be rate-limited");
    }

    @Test
    void differentClientsHaveSeparateBudgets() {
        SearchRateLimitService limiter = new SearchRateLimitService(5, 60);

        for (int i = 0; i < 5; i++) {
            assertTrue(limiter.allowAttempt("198.51.100.11"));
        }
        assertFalse(limiter.allowAttempt("198.51.100.11"));
        assertTrue(limiter.allowAttempt("198.51.100.12"));
    }
}
