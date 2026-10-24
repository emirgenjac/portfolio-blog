package com.emirgenjac.blog.dto;

import com.emirgenjac.blog.entity.BlogPost;

import java.time.LocalDateTime;

public record BlogPostResponseDTO(
        int id,
        String title,
        String tagline,
        String content,
        String coverImageUrl,
        String author,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static BlogPostResponseDTO from(BlogPost post) {
        return new BlogPostResponseDTO(
                post.getId(),
                post.getTitle(),
                post.getTagline(),
                post.getContent(),
                post.getCoverImageUrl(),
                post.getAuthor(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
