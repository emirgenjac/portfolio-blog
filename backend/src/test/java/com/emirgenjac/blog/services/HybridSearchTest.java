package com.emirgenjac.blog.services;

import com.emirgenjac.blog.dto.SearchHitDTO;
import com.emirgenjac.blog.entity.BlogPost;
import com.emirgenjac.blog.repository.BlogPostRepository;
import com.emirgenjac.blog.repository.SearchChunkRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
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
    private static final float[] UNRELATED_VECTOR = new float[]{-1.0f, 0.0f, 0.0f};
    private static final float[] FAR_QUERY_VECTOR = new float[]{0.0f, 1.0f, 0.0f};
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
    private int decoyPostId;

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
        decoyPostId = blogPostService.createPost(decoy).getId();

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
        assertTrue(hits.stream().noneMatch(hit -> hit.id() == decoyPostId));
    }

    @Test
    void embedFailureFallsBackToWordSearch() {
        embeddingClient.setQueryFn(text -> Optional.empty());

        List<SearchHitDTO> hits = searchService.search("jwt");
        assertFalse(hits.isEmpty());
        assertEquals(jwtPostId, hits.get(0).id());
    }

    @Test
    void weakVectorMatchesAreDroppedBySimilarityThreshold() {
        embeddingClient.setDocumentFn(text -> {
            if (text.toLowerCase().contains("jwt") || text.toLowerCase().contains("cookie")) {
                return Optional.of(JWT_VECTOR);
            }
            return Optional.of(new float[]{0.6f, 0.8f, 0.0f});
        });
        blogPostService.updatePost(decoyPostId, blogPostRepository.findById(decoyPostId).orElseThrow());

        embeddingClient.setQueryFn(text -> Optional.of(JWT_VECTOR));

        List<SearchHitDTO> hits = searchService.search("how do you keep login safe from XSS");
        assertFalse(hits.isEmpty());
        assertEquals(jwtPostId, hits.get(0).id());
        assertTrue(hits.stream().noneMatch(hit -> hit.id() == decoyPostId && "post".equals(hit.kind())));
    }

    @Test
    void embedFailureOnMeaningQueryDoesNotInventVectorHits() {
        embeddingClient.setQueryFn(text -> Optional.empty());

        List<SearchHitDTO> hits = searchService.search("how do you keep login safe from XSS");
        assertTrue(hits.stream().noneMatch(hit -> "post".equals(hit.kind()) && hit.id() == jwtPostId));
        assertTrue(hits.stream().noneMatch(hit -> hit.id() == decoyPostId));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "' OR 1=1 --",
            "\" OR \"\"=\"",
            "1; DROP TABLE blog_post;--",
            "%",
            "_",
            "%' OR 1=1 --",
            "&|!:()*",
            ":* & !"
    })
    void injectionPayloadsStaySafeWhenHybridPathRuns(String payload) {
        embeddingClient.setQueryFn(text -> Optional.of(FAR_QUERY_VECTOR));

        List<SearchHitDTO> hits = searchService.search(payload);
        assertTrue(hits.stream().noneMatch(hit -> hit.id() == decoyPostId));
        assertTrue(hits.stream().noneMatch(hit -> "post".equals(hit.kind()) && hit.id() == jwtPostId));
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
