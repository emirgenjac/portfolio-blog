package com.emirgenjac.blog.services;

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
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class SearchIndexServiceTest {

    @Autowired
    private BlogPostService blogPostService;

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Autowired
    private SearchChunkRepository searchChunkRepository;

    @Autowired
    private FakeEmbeddingClient embeddingClient;

    @BeforeEach
    void resetEmbeddings() {
        embeddingClient.reset();
    }

    @Test
    void createUpdateDeleteReindexesChunks() {
        BlogPost post = new BlogPost();
        post.setTitle("Chunked JWT guide");
        post.setTagline("HttpOnly cookies");
        post.setContent("A".repeat(200) + "\n\n" + "B".repeat(200) + "\n\n" + "C".repeat(200));
        post.setCoverImageUrl("https://example.com/cover.jpg");
        post.setAuthor("Emir Genjac");

        BlogPost saved = blogPostService.createPost(post);
        int postId = saved.getId();
        assertTrue(searchChunkRepository.countByBlogPostId(postId) >= 1);
        List<String> created = searchChunkRepository.findContentsByBlogPostId(postId);
        assertTrue(created.get(0).contains("Chunked JWT guide"));

        BlogPost update = new BlogPost();
        update.setTitle("Updated CSRF notes");
        update.setTagline("Double submit");
        update.setContent("CSRF protection with cookies.");
        update.setCoverImageUrl("https://example.com/cover.jpg");
        update.setAuthor("Emir Genjac");

        blogPostService.updatePost(postId, update);
        List<String> updated = searchChunkRepository.findContentsByBlogPostId(postId);
        assertEquals(1, updated.size());
        assertTrue(updated.get(0).contains("Updated CSRF notes"));
        assertTrue(updated.get(0).contains("CSRF protection"));

        blogPostService.deletePost(postId);
        assertEquals(0, searchChunkRepository.countByBlogPostId(postId));
        assertTrue(blogPostRepository.findById(postId).isEmpty());
    }

    @Test
    void reindexStoresEmbeddingWhenVendorSucceeds() {
        embeddingClient.setDocumentFn(text -> Optional.of(new float[]{0.1f, 0.2f, 0.3f}));

        BlogPost post = new BlogPost();
        post.setTitle("Embedded JWT notes");
        post.setTagline("Cookies");
        post.setContent("HttpOnly JWT cookies stay out of localStorage.");
        post.setCoverImageUrl("https://example.com/cover.jpg");
        post.setAuthor("Emir Genjac");

        BlogPost saved = blogPostService.createPost(post);
        assertEquals(1, searchChunkRepository.countByBlogPostId(saved.getId()));
        assertEquals(1, searchChunkRepository.countEmbeddedByBlogPostId(saved.getId()));
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
