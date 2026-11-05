package com.emirgenjac.blog.services;

import com.emirgenjac.blog.dto.SearchHitDTO;
import com.emirgenjac.blog.entity.BlogPost;
import com.emirgenjac.blog.repository.BlogPostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class SearchServiceEmbeddingFallbackTest {

    @Autowired
    private SearchService searchService;

    @Autowired
    private BlogPostRepository blogPostRepository;

    @MockBean
    private EmbeddingService embeddingService;

    @BeforeEach
    void seed() {
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
        when(embeddingService.embedQuery(anyString())).thenReturn(Optional.empty());

        List<SearchHitDTO> hits = searchService.search("jwt");
        assertFalse(hits.isEmpty());
        assertEquals("post", hits.get(0).kind());
    }

    @Test
    void vendorUpStillReturnsWordSearchHitsUntilHybrid() {
        when(embeddingService.embedQuery(anyString()))
                .thenReturn(Optional.of(new float[]{0.4f, 0.5f, 0.6f}));

        List<SearchHitDTO> hits = searchService.search("jwt");
        assertFalse(hits.isEmpty());
        assertEquals("HttpOnly JWT cookies", hits.get(0).title());
    }
}
