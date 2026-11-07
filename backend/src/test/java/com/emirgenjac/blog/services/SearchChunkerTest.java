package com.emirgenjac.blog.services;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SearchChunkerTest {

    @Test
    void shortPostBecomesSingleChunk() {
        List<String> chunks = SearchChunker.chunkPost(
                "HttpOnly JWT",
                "Cookies beat localStorage",
                "Short body."
        );
        assertEquals(1, chunks.size());
        assertTrue(chunks.get(0).contains("HttpOnly JWT"));
        assertTrue(chunks.get(0).contains("Short body."));
    }

    @Test
    void longContentSplitsNearTargetBounds() {
        String paragraph = "word ".repeat(80).strip();
        String content = paragraph + "\n\n" + paragraph + "\n\n" + paragraph;
        List<String> chunks = SearchChunker.chunkPost("Title", "Tagline", content);

        assertTrue(chunks.size() >= 2);
        for (String chunk : chunks) {
            assertFalse(chunk.isBlank());
            assertTrue(chunk.length() <= SearchChunker.MAX_CHARS + 120);
        }
    }

    @Test
    void blankCorpusYieldsNoChunks() {
        assertTrue(SearchChunker.chunkPost("  ", null, "").isEmpty());
    }
}
