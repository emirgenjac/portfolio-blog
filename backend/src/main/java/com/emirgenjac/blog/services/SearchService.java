package com.emirgenjac.blog.services;

import com.emirgenjac.blog.dto.SearchHitDTO;
import com.emirgenjac.blog.entity.BlogPost;
import com.emirgenjac.blog.repository.BlogPostRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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
        List<SearchHitDTO> hits = new ArrayList<>();

        String pattern = SearchQuery.likePattern(query);
        List<BlogPost> posts = blogPostRepository.searchByTerm(pattern, PageRequest.of(0, MAX_HITS));
        for (BlogPost post : posts) {
            hits.add(toHit(post, query));
        }

        if (hits.size() < MAX_HITS) {
            int remaining = MAX_HITS - hits.size();
            SiteSearchCorpus.documents().stream()
                    .filter(document -> matches(document, query))
                    .limit(remaining)
                    .map(document -> toHit(document, query))
                    .forEach(hits::add);
        }

        return List.copyOf(hits);
    }

    private boolean matches(SiteSearchCorpus.Document document, String query) {
        String needle = query.toLowerCase(Locale.ROOT);
        return contains(document.title(), needle) || contains(document.body(), needle);
    }

    private boolean contains(String text, String needle) {
        return text != null && text.toLowerCase(Locale.ROOT).contains(needle);
    }

    private SearchHitDTO toHit(BlogPost post, String query) {
        return new SearchHitDTO(
                "post",
                post.getId(),
                post.getTitle(),
                snippet(post.getTagline(), post.getContent(), post.getTitle(), query),
                "/blog/" + post.getId()
        );
    }

    private SearchHitDTO toHit(SiteSearchCorpus.Document document, String query) {
        return new SearchHitDTO(
                document.kind(),
                document.id(),
                document.title(),
                snippet(document.body(), null, document.title(), query),
                document.href()
        );
    }

    private String snippet(String primary, String secondary, String fallback, String query) {
        String fromPrimary = excerpt(primary, query);
        if (fromPrimary != null) {
            return fromPrimary;
        }
        String fromSecondary = excerpt(secondary, query);
        if (fromSecondary != null) {
            return fromSecondary;
        }
        String fromFallback = excerpt(fallback, query);
        if (fromFallback != null) {
            return fromFallback;
        }
        if (primary != null && !primary.isBlank()) {
            return primary;
        }
        return fallback == null ? "" : fallback;
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
