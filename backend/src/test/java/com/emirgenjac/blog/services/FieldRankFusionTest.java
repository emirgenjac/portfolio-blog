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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class FieldRankFusionTest {

    private static final float[] QUERY_VECTOR = new float[]{1.0f, 0.0f, 0.0f};
    private static final float[] UNRELATED_VECTOR = new float[]{-1.0f, 0.0f, 0.0f};
    private static final LocalDateTime NOW = LocalDateTime.of(2026, 6, 1, 12, 0);

    @Autowired
    private SearchService searchService;

    @Autowired
    private BlogPostService blogPostService;

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Autowired
    private FakeEmbeddingClient embeddingClient;

    @BeforeEach
    void reset() {
        blogPostRepository.deleteAll();
        embeddingClient.reset();
        embeddingClient.setQueryFn(text -> Optional.empty());
    }

    @Test
    void olderTitleMatchOutranksNewerBodyMentionWhenEmbeddingsAreMissing() {
        int olderTitleId = savePost(
                "Zephyr field guide",
                "Weather notes",
                "Clouds and wind only.",
                NOW.minusDays(30)
        ).getId();
        int newerBodyId = savePost(
                "Garden log",
                "Plants",
                "zephyr zephyr zephyr zephyr zephyr moved through the trees.",
                NOW
        ).getId();

        List<SearchHitDTO> hits = searchService.search("zephyr");

        assertEquals(olderTitleId, hits.get(0).id());
        assertEquals("post", hits.get(0).kind());
        assertEquals("word", hits.get(0).matchedBy());
        assertEquals(newerBodyId, hits.get(1).id());
        assertEquals("word", hits.get(1).matchedBy());
    }

    @Test
    void newerBodyMatchRanksFirstWhenFieldScoresMatch() {
        int olderBodyId = savePost(
                "Older notes",
                "plain",
                "zephyr in the body",
                NOW.minusDays(10)
        ).getId();
        int newerBodyId = savePost(
                "Newer notes",
                "plain",
                "zephyr in the body",
                NOW
        ).getId();

        List<SearchHitDTO> hits = searchService.search("zephyr");

        assertEquals(newerBodyId, hits.get(0).id());
        assertEquals(olderBodyId, hits.get(1).id());
    }

    @Test
    void nullCreatedAtSortsAfterADatedPostWithTheSameFieldScore() {
        int undatedId = savePost(
                "Undated notes",
                "plain",
                "zephyr in the body",
                null
        ).getId();
        int datedId = savePost(
                "Dated notes",
                "plain",
                "zephyr in the body",
                NOW.minusYears(2)
        ).getId();

        List<SearchHitDTO> hits = searchService.search("zephyr");

        assertEquals(datedId, hits.get(0).id());
        assertEquals(undatedId, hits.get(1).id());
    }

    @Test
    void titleMatchIsNotDroppedByTenNewerBodyMentions() {
        int titleId = savePost(
                "Zephyr field guide",
                "Weather notes",
                "Clouds and wind only.",
                NOW.minusDays(30)
        ).getId();
        int newestBodyId = -1;
        for (int i = 0; i < 10; i++) {
            int id = savePost(
                    "Notes " + i,
                    "misc",
                    "zephyr zephyr zephyr in the body " + i,
                    NOW.plusMinutes(i)
            ).getId();
            newestBodyId = id;
        }

        List<SearchHitDTO> hits = searchService.search("zephyr");

        assertEquals(10, hits.size());
        assertEquals(titleId, hits.get(0).id());
        assertEquals(newestBodyId, hits.get(1).id());
    }

    @Test
    void weakestTermFieldScoreBeatsANewerPartialTitleMatch() {
        int taglineId = savePost(
                "Field notes",
                "zephyr lantern",
                "No extra copy.",
                NOW.minusDays(30)
        ).getId();
        int partialTitleId = savePost(
                "Zephyr notes",
                "partial",
                "Bring a lantern.",
                NOW
        ).getId();

        List<SearchHitDTO> hits = searchService.search("zephyr lantern");

        assertEquals(taglineId, hits.get(0).id());
        assertEquals(partialTitleId, hits.get(1).id());
    }

    @Test
    void postOnBothListsBeatsWordRankOneOnly() {
        embeddingClient.setDocumentFn(text -> {
            if (text.toLowerCase(Locale.ROOT).contains("garden")) {
                return Optional.of(QUERY_VECTOR);
            }
            return Optional.of(UNRELATED_VECTOR);
        });
        embeddingClient.setQueryFn(text -> Optional.of(QUERY_VECTOR));

        int titleId = blogPostService.createPost(post(
                "Zephyr field guide",
                "Weather notes",
                "Clouds and wind only."
        )).getId();
        stampCreatedAt(titleId, NOW.minusDays(30));

        int bodyId = blogPostService.createPost(post(
                "Garden log",
                "Plants",
                "A single zephyr moved through the trees."
        )).getId();
        stampCreatedAt(bodyId, NOW);

        List<SearchHitDTO> hits = searchService.search("zephyr");

        assertEquals(bodyId, hits.get(0).id());
        assertEquals("post", hits.get(0).kind());
        assertEquals("both", hits.get(0).matchedBy());
        assertEquals(titleId, hits.get(1).id());
        assertEquals("word", hits.get(1).matchedBy());
    }

    private BlogPost savePost(String title, String tagline, String content, LocalDateTime createdAt) {
        BlogPost saved = blogPostRepository.saveAndFlush(post(title, tagline, content));
        saved.setCreatedAt(createdAt);
        return blogPostRepository.saveAndFlush(saved);
    }

    private void stampCreatedAt(int id, LocalDateTime createdAt) {
        BlogPost saved = blogPostRepository.findById(id).orElseThrow();
        saved.setCreatedAt(createdAt);
        blogPostRepository.saveAndFlush(saved);
    }

    private static BlogPost post(String title, String tagline, String content) {
        BlogPost post = new BlogPost();
        post.setTitle(title);
        post.setTagline(tagline);
        post.setContent(content);
        post.setCoverImageUrl("https://example.com/cover.jpg");
        post.setAuthor("Emir Genjac");
        return post;
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
