package com.emirgenjac.blog.services;

import com.emirgenjac.blog.dto.SearchHitDTO;
import com.emirgenjac.blog.entity.BlogPost;
import com.emirgenjac.blog.repository.BlogPostRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class SearchService {

    private static final int MAX_HITS = 10;
    private static final int SNIPPET_LENGTH = 180;

    private final BlogPostRepository blogPostRepository;

    public SearchService(BlogPostRepository blogPostRepository) {
        this.blogPostRepository = blogPostRepository;
    }

    public List<SearchHitDTO> searchPosts(String rawQuery) {
        String query = SearchQuery.requireValid(rawQuery);
        String pattern = SearchQuery.likePattern(query);
        List<BlogPost> posts = blogPostRepository.searchByTerm(pattern, PageRequest.of(0, MAX_HITS));
        return posts.stream()
                .map(post -> toHit(post, query))
                .toList();
    }

    private SearchHitDTO toHit(BlogPost post, String query) {
        return new SearchHitDTO(
                "post",
                post.getId(),
                post.getTitle(),
                snippet(post, query),
                "/blog/" + post.getId()
        );
    }

    private String snippet(BlogPost post, String query) {
        String fromTagline = excerpt(post.getTagline(), query);
        if (fromTagline != null) {
            return fromTagline;
        }
        String fromContent = excerpt(post.getContent(), query);
        if (fromContent != null) {
            return fromContent;
        }
        String fromTitle = excerpt(post.getTitle(), query);
        if (fromTitle != null) {
            return fromTitle;
        }
        String tagline = post.getTagline();
        return tagline == null ? "" : tagline;
    }

    private String excerpt(String text, String query) {
        if (text == null || text.isBlank()) {
            return null;
        }
        String lowerText = text.toLowerCase(Locale.ROOT);
        String lowerQuery = query.toLowerCase(Locale.ROOT);
        int matchAt = lowerText.indexOf(lowerQuery);
        if (matchAt < 0) {
            return null;
        }
        int start = Math.max(0, matchAt - 40);
        int end = Math.min(text.length(), start + SNIPPET_LENGTH);
        String excerpt = text.substring(start, end).strip();
        if (start > 0) {
            excerpt = "…" + excerpt;
        }
        if (end < text.length()) {
            excerpt = excerpt + "…";
        }
        return excerpt;
    }
}
