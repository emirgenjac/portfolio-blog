package com.emirgenjac.blog.controllers;

import com.emirgenjac.blog.dto.SearchHitDTO;
import com.emirgenjac.blog.services.SearchRateLimitService;
import com.emirgenjac.blog.services.SearchService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
public class SearchController {

    private final SearchService searchService;
    private final SearchRateLimitService searchRateLimitService;

    public SearchController(SearchService searchService, SearchRateLimitService searchRateLimitService) {
        this.searchService = searchService;
        this.searchRateLimitService = searchRateLimitService;
    }

    @GetMapping("/search")
    public List<SearchHitDTO> search(
            @RequestParam(value = "q", required = false) String query,
            HttpServletRequest request) {
        String clientKey = resolveClientKey(request);
        if (!searchRateLimitService.allowAttempt(clientKey)) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many search requests. Please try again later.");
        }
        return searchService.searchPosts(query);
    }

    private String resolveClientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
