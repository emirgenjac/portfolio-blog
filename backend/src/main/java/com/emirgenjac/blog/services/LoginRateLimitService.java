package com.emirgenjac.blog.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Iterator;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginRateLimitService {

    private final int maxAttempts;
    private final long windowSeconds;
    private final ConcurrentHashMap<String, Deque<Long>> attemptsByClient = new ConcurrentHashMap<>();

    public LoginRateLimitService(
            @Value("${app.rate-limit.login.max-attempts:5}") int maxAttempts,
            @Value("${app.rate-limit.login.window-seconds:60}") long windowSeconds) {
        this.maxAttempts = maxAttempts;
        this.windowSeconds = windowSeconds;
    }

    public boolean allowAttempt(String clientKey) {
        if (clientKey == null || clientKey.isBlank()) {
            clientKey = "unknown";
        }

        long now = Instant.now().getEpochSecond();
        long cutoff = now - windowSeconds;

        Deque<Long> timestamps = attemptsByClient.computeIfAbsent(clientKey, key -> new ArrayDeque<>());
        synchronized (timestamps) {
            prune(timestamps, cutoff);
            if (timestamps.size() >= maxAttempts) {
                return false;
            }
            timestamps.addLast(now);
            return true;
        }
    }

    private void prune(Deque<Long> timestamps, long cutoff) {
        Iterator<Long> iterator = timestamps.iterator();
        while (iterator.hasNext()) {
            if (iterator.next() < cutoff) {
                iterator.remove();
            } else {
                break;
            }
        }
    }
}
