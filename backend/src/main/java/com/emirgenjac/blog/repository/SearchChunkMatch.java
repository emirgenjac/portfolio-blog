package com.emirgenjac.blog.repository;

public record SearchChunkMatch(
        int blogPostId,
        String title,
        String content
) {
}
