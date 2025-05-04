package com.emirgenjac.blog.repository;

import com.emirgenjac.blog.entity.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogPostRepository extends JpaRepository<BlogPost, Integer> {
}
