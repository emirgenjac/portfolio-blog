package com.emirgenjac.blog.dto;

public record SearchHitDTO(
        String kind,
        int id,
        String title,
        String snippet,
        String href
) {
}
