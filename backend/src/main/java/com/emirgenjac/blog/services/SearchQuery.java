package com.emirgenjac.blog.services;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

final class SearchQuery {

    static final int MAX_LENGTH = 100;

    private static final Set<String> STOPWORDS = Set.of(
            "a", "an", "the", "and", "or", "of", "to", "in", "on", "for", "is", "was",
            "were", "be", "this", "that", "what", "who", "how", "why", "where", "when",
            "with", "from", "it", "its", "you", "your", "we", "our", "are", "been",
            "being", "do", "does", "did", "can", "could", "would", "should", "at",
            "by", "as", "if", "but", "not", "no", "so", "than", "then", "into",
            "over", "after", "before", "about"
    );

    private SearchQuery() {
    }

    static String requireValid(String raw) {
        if (raw == null) {
            throw invalid("Query is required");
        }

        StringBuilder cleaned = new StringBuilder(raw.length());
        for (int i = 0; i < raw.length(); ) {
            int codePoint = raw.codePointAt(i);
            i += Character.charCount(codePoint);
            if (Character.isISOControl(codePoint) && !Character.isWhitespace(codePoint)) {
                continue;
            }
            cleaned.appendCodePoint(codePoint);
        }

        String query = cleaned.toString().strip().replaceAll("\\s+", " ");
        if (query.isEmpty()) {
            throw invalid("Query is required");
        }
        if (query.length() > MAX_LENGTH) {
            throw invalid("Query is too long");
        }
        return query;
    }

    static List<String> terms(String query) {
        String[] parts = query.toLowerCase(Locale.ROOT).split("[^\\p{L}\\p{N}]+");
        List<String> terms = new ArrayList<>();
        for (String part : parts) {
            if (part.length() >= 2 && !STOPWORDS.contains(part)) {
                terms.add(part);
            }
        }
        if (terms.isEmpty()) {
            return List.of(query.toLowerCase(Locale.ROOT));
        }
        return List.copyOf(terms);
    }

    static String likePattern(String query) {
        String escaped = query
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        return "%" + escaped + "%";
    }

    private static ResponseStatusException invalid(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
