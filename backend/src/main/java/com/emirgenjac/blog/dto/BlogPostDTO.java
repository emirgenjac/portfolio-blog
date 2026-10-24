package com.emirgenjac.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BlogPostDTO {
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be at most 200 characters")
    private String title;

    @NotBlank(message = "Tagline is required")
    @Size(max = 255, message = "Tagline must be at most 255 characters")
    private String tagline;

    @NotBlank(message = "Content is required")
    @Size(max = 50000, message = "Content must be at most 50000 characters")
    private String content;

    @NotBlank(message = "Cover image URL is required")
    @Size(max = 5_242_880, message = "Cover image URL must be at most 5MB")
    private String coverImageUrl;
}
