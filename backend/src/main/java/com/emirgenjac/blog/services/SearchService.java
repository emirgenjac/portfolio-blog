package com.emirgenjac.blog.services;

import com.emirgenjac.blog.dto.SearchHitDTO;
import com.emirgenjac.blog.entity.BlogPost;
import com.emirgenjac.blog.repository.BlogPostRepository;
import com.emirgenjac.blog.repository.SearchChunkMatch;
import com.emirgenjac.blog.repository.SearchChunkRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
public class SearchService {

    private static final int MAX_HITS = 10;
    private static final int CANDIDATE_LIMIT = 50;
    private static final int RRF_K = 10;
    private static final int TITLE_SCORE = 3;
    private static final int TAGLINE_SCORE = 2;
    private static final int BODY_SCORE = 1;
    private static final String MATCH_WORD = "word";
    private static final String MATCH_MEANING = "meaning";
    private static final String MATCH_BOTH = "both";
    private static final int SNIPPET_LENGTH = 180;

    private final BlogPostRepository blogPostRepository;
    private final SearchChunkRepository searchChunkRepository;
    private final EmbeddingClient embeddingClient;

    public SearchService(
            BlogPostRepository blogPostRepository,
            SearchChunkRepository searchChunkRepository,
            EmbeddingClient embeddingClient) {
        this.blogPostRepository = blogPostRepository;
        this.searchChunkRepository = searchChunkRepository;
        this.embeddingClient = embeddingClient;
    }

    public List<SearchHitDTO> search(String rawQuery) {
        String query = SearchQuery.requireValid(rawQuery);
        List<SearchHitDTO> wordHits = wordSearch(query);

        Optional<float[]> embedding = embeddingClient.embedQuery(query);
        if (embedding.isEmpty()) {
            return topHits(wordHits);
        }

        List<SearchChunkMatch> nearest = searchChunkRepository.findNearest(embedding.get(), MAX_HITS);
        if (nearest.isEmpty()) {
            return topHits(wordHits);
        }
        return fuse(nearest, wordHits);
    }

    private List<SearchHitDTO> fuse(List<SearchChunkMatch> nearest, List<SearchHitDTO> wordHits) {
        Map<String, FusionCandidate> candidates = new LinkedHashMap<>();

        int wordRank = 1;
        for (SearchHitDTO hit : wordHits) {
            String key = hitKey(hit);
            if (candidates.containsKey(key)) {
                continue;
            }
            candidates.put(key, new FusionCandidate(hit, wordRank, null));
            wordRank++;
        }

        int vectorRank = 1;
        for (SearchChunkMatch match : nearest) {
            String key = "post:" + match.blogPostId();
            FusionCandidate existing = candidates.get(key);
            if (existing != null && existing.vectorRank() != null) {
                continue;
            }
            if (existing == null) {
                candidates.put(key, new FusionCandidate(toHit(match), null, vectorRank));
            } else {
                candidates.put(key, new FusionCandidate(existing.hit(), existing.wordRank(), vectorRank));
            }
            vectorRank++;
        }

        List<FusionCandidate> ranked = new ArrayList<>(candidates.values());
        ranked.sort((left, right) -> {
            double leftScore = rrfScore(left);
            double rightScore = rrfScore(right);
            if (Math.abs(leftScore - rightScore) > 1.0e-12) {
                return Double.compare(rightScore, leftScore);
            }
            int byWord = compareRank(left.wordRank(), right.wordRank());
            if (byWord != 0) {
                return byWord;
            }
            return compareRank(left.vectorRank(), right.vectorRank());
        });

        List<SearchHitDTO> hits = new ArrayList<>();
        int limit = Math.min(MAX_HITS, ranked.size());
        for (int i = 0; i < limit; i++) {
            hits.add(labelMatch(ranked.get(i)));
        }
        return List.copyOf(hits);
    }

    private SearchHitDTO labelMatch(FusionCandidate candidate) {
        SearchHitDTO hit = candidate.hit();
        if (!"post".equals(hit.kind())) {
            return hit;
        }
        if (candidate.wordRank() != null && candidate.vectorRank() != null) {
            return withMatchedBy(hit, MATCH_BOTH);
        }
        if (candidate.vectorRank() != null) {
            return withMatchedBy(hit, MATCH_MEANING);
        }
        return withMatchedBy(hit, MATCH_WORD);
    }

    private SearchHitDTO withMatchedBy(SearchHitDTO hit, String matchedBy) {
        if (matchedBy.equals(hit.matchedBy())) {
            return hit;
        }
        return new SearchHitDTO(hit.kind(), hit.id(), hit.title(), hit.snippet(), hit.href(), matchedBy);
    }

    private static double rrfScore(FusionCandidate candidate) {
        double score = 0.0;
        if (candidate.wordRank() != null) {
            score += 1.0 / (RRF_K + candidate.wordRank());
        }
        if (candidate.vectorRank() != null) {
            score += 1.0 / (RRF_K + candidate.vectorRank());
        }
        return score;
    }

    private static int compareRank(Integer left, Integer right) {
        if (left == null && right == null) {
            return 0;
        }
        if (left == null) {
            return 1;
        }
        if (right == null) {
            return -1;
        }
        return Integer.compare(left, right);
    }

    private static String hitKey(SearchHitDTO hit) {
        return hit.kind() + ":" + hit.id();
    }

    private List<SearchHitDTO> topHits(List<SearchHitDTO> hits) {
        if (hits.size() <= MAX_HITS) {
            return hits;
        }
        return List.copyOf(hits.subList(0, MAX_HITS));
    }

    private List<SearchHitDTO> wordSearch(String query) {
        List<String> terms = SearchQuery.terms(query);
        List<ScoredHit> scored = new ArrayList<>();

        for (BlogPost post : matchingPosts(terms)) {
            int score = weakestFieldScore(post.getTitle(), post.getTagline(), post.getContent(), terms, true);
            if (score == 0) {
                continue;
            }
            scored.add(new ScoredHit(score, post.getCreatedAt(), toHit(post, terms)));
        }

        for (SiteSearchCorpus.Document document : SiteSearchCorpus.documents()) {
            if (!matches(document, terms)) {
                continue;
            }
            int score = weakestFieldScore(document.title(), null, document.body(), terms, false);
            if (score == 0) {
                continue;
            }
            scored.add(new ScoredHit(score, null, toHit(document, terms)));
        }

        scored.sort(Comparator
                .comparingInt(ScoredHit::score).reversed()
                .thenComparing(ScoredHit::createdAt, Comparator.nullsLast(Comparator.reverseOrder())));

        List<SearchHitDTO> hits = new ArrayList<>(scored.size());
        for (ScoredHit item : scored) {
            hits.add(item.hit());
        }
        return List.copyOf(hits);
    }

    private List<BlogPost> matchingPosts(List<String> terms) {
        String pattern = SearchQuery.likePattern(terms.get(0));
        List<BlogPost> candidates = blogPostRepository.searchByTerm(pattern, PageRequest.of(0, CANDIDATE_LIMIT));
        if (terms.size() == 1) {
            return candidates;
        }
        List<BlogPost> matches = new ArrayList<>();
        for (BlogPost post : candidates) {
            if (containsAll(haystack(post.getTitle(), post.getTagline(), post.getContent()), terms)) {
                matches.add(post);
            }
        }
        return matches;
    }

    private int weakestFieldScore(
            String title,
            String tagline,
            String body,
            List<String> terms,
            boolean taglineTier) {
        int weakest = Integer.MAX_VALUE;
        for (String term : terms) {
            int score = termFieldScore(title, tagline, body, term, taglineTier);
            if (score == 0) {
                return 0;
            }
            if (score < weakest) {
                weakest = score;
            }
        }
        return weakest == Integer.MAX_VALUE ? 0 : weakest;
    }

    private int termFieldScore(String title, String tagline, String body, String term, boolean taglineTier) {
        if (containsTerm(title, term)) {
            return TITLE_SCORE;
        }
        if (taglineTier && containsTerm(tagline, term)) {
            return TAGLINE_SCORE;
        }
        if (containsTerm(body, term)) {
            return BODY_SCORE;
        }
        return 0;
    }

    private boolean containsTerm(String text, String term) {
        return text != null && text.toLowerCase(Locale.ROOT).contains(term);
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

    private SearchHitDTO toHit(SearchChunkMatch match) {
        return new SearchHitDTO(
                "post",
                match.blogPostId(),
                match.title(),
                quoteSnippet(match.content()),
                "/blog/" + match.blogPostId(),
                MATCH_MEANING
        );
    }

    private SearchHitDTO toHit(BlogPost post, List<String> terms) {
        return new SearchHitDTO(
                "post",
                post.getId(),
                post.getTitle(),
                snippet(post.getTagline(), post.getContent(), post.getTitle(), terms),
                "/blog/" + post.getId(),
                MATCH_WORD
        );
    }

    private SearchHitDTO toHit(SiteSearchCorpus.Document document, List<String> terms) {
        return new SearchHitDTO(
                document.kind(),
                document.id(),
                document.title(),
                snippet(document.body(), null, document.title(), terms),
                hrefFor(document),
                null
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

    private String quoteSnippet(String content) {
        if (content == null || content.isBlank()) {
            return "";
        }
        String trimmed = content.strip();
        if (trimmed.length() <= SNIPPET_LENGTH) {
            return trimmed;
        }
        return trimmed.substring(0, SNIPPET_LENGTH).strip() + "…";
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

    private record ScoredHit(int score, LocalDateTime createdAt, SearchHitDTO hit) {
    }

    private record FusionCandidate(SearchHitDTO hit, Integer wordRank, Integer vectorRank) {
    }
}
