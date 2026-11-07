package com.emirgenjac.blog.repository;

import com.emirgenjac.blog.entity.BlogPost;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BlogPostRepository extends JpaRepository<BlogPost, Integer> {
    List<BlogPost> findAllByOrderByCreatedAtDesc();

    @Query("""
            SELECT p FROM BlogPost p
            WHERE LOWER(p.title) LIKE LOWER(:pattern) ESCAPE '\\'
               OR LOWER(p.tagline) LIKE LOWER(:pattern) ESCAPE '\\'
               OR LOWER(p.content) LIKE LOWER(:pattern) ESCAPE '\\'
            ORDER BY p.createdAt DESC
            """)
    List<BlogPost> searchByTerm(@Param("pattern") String pattern, Pageable pageable);
}

