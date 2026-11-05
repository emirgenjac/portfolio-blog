package com.emirgenjac.blog.services;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class EmbeddingServiceTest {

    @Test
    void blankApiKeyMeansUnavailableAndEmptyEmbeddings() {
        EmbeddingService service = new EmbeddingService(
                true,
                "",
                "https://example.invalid",
                "text-embedding-004",
                768,
                500
        );

        assertTrue(service.embedDocument("jwt cookie").isEmpty());
        assertTrue(service.embedQuery("safe login").isEmpty());
    }

    @Test
    void disabledMeansUnavailable() {
        EmbeddingService service = new EmbeddingService(
                false,
                "not-a-real-key",
                "https://example.invalid",
                "text-embedding-004",
                768,
                500
        );

        assertTrue(service.embedQuery("csrf").isEmpty());
    }
}
