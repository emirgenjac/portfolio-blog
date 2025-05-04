package com.emirgenjac.blog.services;

import com.emirgenjac.blog.repository.BlogPostRepository;
import com.emirgenjac.blog.entity.BlogPost;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BlogPostService {
    @Autowired
    private BlogPostRepository blogPostRepository;

    //GET /api/posts
    public List<BlogPost> getAllPosts() {
        return blogPostRepository.findAll();
    }

    //GET /api/posts/{id}
    public BlogPost getPostById(int id) {
        return blogPostRepository.findById(id).orElseThrow();
    }

    // POST /api/admin/posts
    public BlogPost createPost(BlogPost post) {
        return blogPostRepository.save(post);
    }

    // PUT /api/admin/posts/{id}
    public BlogPost updatePost(int id, BlogPost updatedPost) {
        BlogPost post = blogPostRepository.findById(id).orElseThrow();
        post.setTitle(updatedPost.getTitle());
        post.setContent(updatedPost.getContent());
        post.setCoverImageUrl(updatedPost.getCoverImageUrl());
        return blogPostRepository.save(post);
    }

    // DELETE /api/admin/posts/{id}
    public void deletePost(int id) {
        blogPostRepository.deleteById(id);
    }
}
