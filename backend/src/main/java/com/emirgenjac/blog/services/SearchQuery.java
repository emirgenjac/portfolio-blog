package com.emirgenjac.blog.services;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

final class SearchQuery {

    static final int MAX_LENGTH = 100;

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
