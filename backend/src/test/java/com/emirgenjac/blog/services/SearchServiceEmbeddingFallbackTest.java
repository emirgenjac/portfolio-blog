package com.emirgenjac.blog.services;

import com.emirgenjac.blog.dto.SearchHitDTO;
import com.emirgenjac.blog.entity.BlogPost;
import com.emirgenjac.blog.repository.BlogPostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class SearchServiceEmbeddingFallbackTest {

    @Autowired
    private SearchService searchService;

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Autowired
    private FakeEmbeddingClient embeddingClient;

    @BeforeEach
    void seed() {
        embeddingClient.reset();
        blogPostRepository.deleteAll();
        BlogPost post = new BlogPost();
        post.setTitle("HttpOnly JWT cookies");
        post.setTagline("Tokens live in a cookie");
        post.setContent("The login token is stored in an HttpOnly cookie, not localStorage.");
        post.setCoverImageUrl("https://example.com/jwt.jpg");
        post.setAuthor("Emir Genjac");
        blogPostRepository.save(post);
    }

    @Test
    void vendorDownStillReturnsWordSearchHits() {
        embeddingClient.setQueryFn(text -> Optional.empty());

        List<SearchHitDTO> hits = searchService.search("jwt");
        assertFalse(hits.isEmpty());
        assertEquals("post", hits.get(0).kind());
    }

    @Test
    void vendorUpWithNoChunkVectorsStillReturnsWordSearchHits() {
        embeddingClient.setQueryFn(text -> Optional.of(new float[]{0.4f, 0.5f, 0.6f}));

        List<SearchHitDTO> hits = searchService.search("jwt");
        assertFalse(hits.isEmpty());
        assertEquals("HttpOnly JWT cookies", hits.get(0).title());
    }

    @TestConfiguration
    static class FakeEmbeddingConfig {
        @Bean
        @Primary
        FakeEmbeddingClient embeddingClient() {
            return new FakeEmbeddingClient();
        }
    }
}
