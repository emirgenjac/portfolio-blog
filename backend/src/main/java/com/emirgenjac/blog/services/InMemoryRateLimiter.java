package com.emirgenjac.blog.services;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Iterator;
import java.util.concurrent.ConcurrentHashMap;

final class InMemoryRateLimiter {

    private final int maxAttempts;
    private final long windowSeconds;
    private final ConcurrentHashMap<String, Deque<Long>> attemptsByClient = new ConcurrentHashMap<>();

    InMemoryRateLimiter(int maxAttempts, long windowSeconds) {
        this.maxAttempts = maxAttempts;
        this.windowSeconds = windowSeconds;
    }

    boolean allowAttempt(String clientKey) {
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
