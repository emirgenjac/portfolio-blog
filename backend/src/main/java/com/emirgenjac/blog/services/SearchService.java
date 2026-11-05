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
    private final EmbeddingService embeddingService;

    public SearchService(BlogPostRepository blogPostRepository, EmbeddingService embeddingService) {
        this.blogPostRepository = blogPostRepository;
        this.embeddingService = embeddingService;
    }

    public List<SearchHitDTO> search(String rawQuery) {
        String query = SearchQuery.requireValid(rawQuery);
        embeddingService.embedQuery(query);
        return wordSearch(query);
    }

    private List<SearchHitDTO> wordSearch(String query) {
        List<String> terms = SearchQuery.terms(query);
        List<SearchHitDTO> hits = new ArrayList<>();

        List<BlogPost> posts = matchingPosts(terms);
        for (BlogPost post : posts) {
            hits.add(toHit(post, terms));
        }

        if (hits.size() < MAX_HITS) {
            int remaining = MAX_HITS - hits.size();
            SiteSearchCorpus.documents().stream()
                    .filter(document -> matches(document, terms))
                    .limit(remaining)
                    .map(document -> toHit(document, terms))
                    .forEach(hits::add);
        }

        return List.copyOf(hits);
    }

    private List<BlogPost> matchingPosts(List<String> terms) {
        String pattern = SearchQuery.likePattern(terms.get(0));
        List<BlogPost> candidates = blogPostRepository.searchByTerm(pattern, PageRequest.of(0, 50));
        if (terms.size() == 1) {
            return candidates.size() <= MAX_HITS ? candidates : candidates.subList(0, MAX_HITS);
        }
        List<BlogPost> matches = new ArrayList<>();
        for (BlogPost post : candidates) {
            if (containsAll(haystack(post.getTitle(), post.getTagline(), post.getContent()), terms)) {
                matches.add(post);
                if (matches.size() == MAX_HITS) {
                    break;
                }
            }
        }
        return matches;
    }

    private boolean matches(SiteSearchCorpus.Document document, List<String> terms) {
        return containsAll(haystack(document.title(), document.body()), terms);
    }

    private boolean containsAll(String haystack, List<String> terms) {
        for (String term : terms) {
            if (!haystack.contains(term)) {
                return false;
            }
        }
        return true;
    }

    private String haystack(String... parts) {
        StringBuilder text = new StringBuilder();
        for (String part : parts) {
            if (part != null) {
                text.append(part.toLowerCase(Locale.ROOT)).append('\n');
            }
        }
        return text.toString();
    }

    private SearchHitDTO toHit(BlogPost post, List<String> terms) {
        return new SearchHitDTO(
                "post",
                post.getId(),
                post.getTitle(),
                snippet(post.getTagline(), post.getContent(), post.getTitle(), terms),
                "/blog/" + post.getId()
        );
    }

    private SearchHitDTO toHit(SiteSearchCorpus.Document document, List<String> terms) {
        return new SearchHitDTO(
                document.kind(),
                document.id(),
                document.title(),
                snippet(document.body(), null, document.title(), terms),
                hrefFor(document)
        );
    }

    private String hrefFor(SiteSearchCorpus.Document document) {
        if (!"about".equals(document.kind())) {
            return document.href();
        }
        List<BlogPost> posts = blogPostRepository.searchByTerm(
                SearchQuery.likePattern("ovaj sajt"),
                PageRequest.of(0, 1)
        );
        if (!posts.isEmpty()) {
            return "/blog/" + posts.get(0).getId();
        }
        return "/blog";
    }

    private String snippet(String primary, String secondary, String fallback, List<String> terms) {
        for (String term : terms) {
            String fromPrimary = excerpt(primary, term);
            if (fromPrimary != null) {
                return fromPrimary;
            }
            String fromSecondary = excerpt(secondary, term);
            if (fromSecondary != null) {
                return fromSecondary;
            }
            String fromFallback = excerpt(fallback, term);
            if (fromFallback != null) {
                return fromFallback;
            }
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
