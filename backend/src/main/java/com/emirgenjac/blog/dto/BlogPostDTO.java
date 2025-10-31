package com.emirgenjac.blog.dto;

import lombok.Data;

@Data
public class BlogPostDTO {
    private String title;
    private String tagline;
    private String content;
    private String coverImageUrl;
}
