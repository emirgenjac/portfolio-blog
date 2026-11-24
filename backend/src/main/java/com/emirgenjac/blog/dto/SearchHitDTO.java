package com.emirgenjac.blog.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

public record SearchHitDTO(
        String kind,
        int id,
        String title,
        String snippet,
        String href,
        @JsonInclude(JsonInclude.Include.NON_NULL) String matchedBy
) {
}
