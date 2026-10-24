package com.emirgenjac.blog.services;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LoginRateLimitServiceTest {

    @Test
    void allowsUpToMaxAttemptsThenBlocksWithinWindow() {
        LoginRateLimitService limiter = new LoginRateLimitService(5, 60);
        String client = "203.0.113.10";

        for (int i = 0; i < 5; i++) {
            assertTrue(limiter.allowAttempt(client), "attempt " + (i + 1) + " should be allowed");
        }

        assertFalse(limiter.allowAttempt(client), "6th attempt should be rate-limited");
        assertFalse(limiter.allowAttempt(client), "further attempts stay blocked inside the window");
    }

    @Test
    void differentClientsHaveSeparateBudgets() {
        LoginRateLimitService limiter = new LoginRateLimitService(5, 60);

        for (int i = 0; i < 5; i++) {
            assertTrue(limiter.allowAttempt("198.51.100.1"));
        }
        assertFalse(limiter.allowAttempt("198.51.100.1"));

        assertTrue(limiter.allowAttempt("198.51.100.2"));
    }

    @Test
    void manyConcurrentRequestsFromSameClientDoNotExceedLimit() throws Exception {
        int maxAttempts = 5;
        LoginRateLimitService limiter = new LoginRateLimitService(maxAttempts, 60);
        String client = "192.0.2.50";

        int workers = 40;
        ExecutorService pool = Executors.newFixedThreadPool(workers);
        AtomicInteger allowed = new AtomicInteger();

        List<Callable<Boolean>> tasks = new ArrayList<>();
        for (int i = 0; i < workers; i++) {
            tasks.add(() -> {
                boolean ok = limiter.allowAttempt(client);
                if (ok) {
                    allowed.incrementAndGet();
                }
                return ok;
            });
        }

        List<Future<Boolean>> futures = pool.invokeAll(tasks);
        pool.shutdown();

        for (Future<Boolean> future : futures) {
            future.get();
        }

        assertEquals(maxAttempts, allowed.get(),
                "concurrent callers must not sneak past the per-client max");
    }
}
