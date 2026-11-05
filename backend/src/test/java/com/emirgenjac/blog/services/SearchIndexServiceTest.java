package com.emirgenjac.blog.services;

import com.emirgenjac.blog.entity.BlogPost;
import com.emirgenjac.blog.repository.BlogPostRepository;
import com.emirgenjac.blog.repository.SearchChunkRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
}
