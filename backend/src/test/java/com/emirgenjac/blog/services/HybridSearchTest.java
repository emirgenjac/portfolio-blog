package com.emirgenjac.blog.services;

import com.emirgenjac.blog.dto.SearchHitDTO;
import com.emirgenjac.blog.entity.BlogPost;
import com.emirgenjac.blog.repository.BlogPostRepository;
import com.emirgenjac.blog.repository.SearchChunkRepository;
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
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class HybridSearchTest {

    private static final float[] JWT_VECTOR = new float[]{1.0f, 0.0f, 0.0f};
    private static final float[] UNRELATED_VECTOR = new float[]{0.0f, 1.0f, 0.0f};
    private static final float[] MEANING_QUERY_VECTOR = new float[]{0.97f, 0.03f, 0.0f};

    @Autowired
    private SearchService searchService;

    @Autowired
    private BlogPostService blogPostService;

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Autowired
    private SearchChunkRepository searchChunkRepository;

    @Autowired
    private FakeEmbeddingClient embeddingClient;

    private int jwtPostId;

    @BeforeEach
    void seed() {
        blogPostRepository.deleteAll();
        embeddingClient.reset();
        embeddingClient.setDocumentFn(text -> {
            if (text.toLowerCase().contains("jwt") || text.toLowerCase().contains("cookie")) {
                return Optional.of(JWT_VECTOR);
            }
            return Optional.of(UNRELATED_VECTOR);
        });

        BlogPost jwtPost = new BlogPost();
        jwtPost.setTitle("HttpOnly JWT cookies");
        jwtPost.setTagline("Tokens live in a cookie");
        jwtPost.setContent("The login token is stored in an HttpOnly cookie, not localStorage.");
        jwtPost.setCoverImageUrl("https://example.com/jwt.jpg");
        jwtPost.setAuthor("Emir Genjac");
        jwtPostId = blogPostService.createPost(jwtPost).getId();

        BlogPost decoy = new BlogPost();
        decoy.setTitle("Unrelated travel notes");
        decoy.setTagline("Road trip");
        decoy.setContent("Mountains and coffee shops with no security talk.");
        decoy.setCoverImageUrl("https://example.com/decoy.jpg");
        decoy.setAuthor("Emir Genjac");
        blogPostService.createPost(decoy);

        assertTrue(searchChunkRepository.countEmbeddedByBlogPostId(jwtPostId) >= 1);
    }

    @Test
    void meaningStyleQueryFindsJwtPostViaVectors() {
        embeddingClient.setQueryFn(text -> Optional.of(MEANING_QUERY_VECTOR));

        List<SearchHitDTO> hits = searchService.search("how do you keep login safe from XSS");
        assertFalse(hits.isEmpty());
        assertEquals(jwtPostId, hits.get(0).id());
        assertEquals("post", hits.get(0).kind());
        assertTrue(hits.get(0).snippet().toLowerCase().contains("cookie")
                || hits.get(0).title().toLowerCase().contains("jwt"));
    }

    @Test
    void embedFailureFallsBackToWordSearch() {
        embeddingClient.setQueryFn(text -> Optional.empty());

        List<SearchHitDTO> hits = searchService.search("jwt");
        assertFalse(hits.isEmpty());
        assertEquals(jwtPostId, hits.get(0).id());
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
