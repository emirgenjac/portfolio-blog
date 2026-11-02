package com.emirgenjac.blog.services;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SearchQueryTest {

    @Test
    void trimsAndCollapsesWhitespace() {
        assertEquals("jwt cookie", SearchQuery.requireValid("  jwt   cookie  "));
    }

    @Test
    void rejectsNullBlankAndControlOnlyInput() {
        assertBadRequest(null);
        assertBadRequest("");
        assertBadRequest("   ");
        assertBadRequest("\n\t");
        assertBadRequest("\u0000\u0000");
    }

    @Test
    void rejectsQueriesOverMaxLength() {
        String tooLong = "a".repeat(SearchQuery.MAX_LENGTH + 1);
        assertBadRequest(tooLong);
        assertEquals("a".repeat(SearchQuery.MAX_LENGTH), SearchQuery.requireValid("a".repeat(SearchQuery.MAX_LENGTH)));
    }

    @Test
    void stripsNullBytesThenValidates() {
        assertEquals("jwt", SearchQuery.requireValid("jwt\u0000"));
    }

    @Test
    void likePatternBindsWildcardsAsLiterals() {
        assertEquals("%jwt%", SearchQuery.likePattern("jwt"));
        assertEquals("%\\%%", SearchQuery.likePattern("%"));
        assertEquals("%\\_%", SearchQuery.likePattern("_"));
        assertEquals("%foo\\%bar%", SearchQuery.likePattern("foo%bar"));
        assertEquals("%\\\\%", SearchQuery.likePattern("\\"));
    }

    @Test
    void ftsOperatorCharactersStayLiteralText() {
        String operators = "' OR 1=1 -- &|!:()*";
        assertEquals(operators, SearchQuery.requireValid(operators));
        assertTrue(SearchQuery.likePattern(operators).startsWith("%"));
        assertTrue(SearchQuery.likePattern(operators).endsWith("%"));
        assertTrue(SearchQuery.likePattern(operators).contains("OR 1=1"));
    }

    private void assertBadRequest(String raw) {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> SearchQuery.requireValid(raw));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }
}
