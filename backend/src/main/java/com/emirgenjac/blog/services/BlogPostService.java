package com.emirgenjac.blog.services;

import com.emirgenjac.blog.repository.BlogPostRepository;
import com.emirgenjac.blog.entity.BlogPost;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
        return blogPostRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    // POST /api/admin/posts
    public BlogPost createPost(BlogPost post) {
        return blogPostRepository.save(post);
    }

    // PUT /api/admin/posts/{id}
    public BlogPost updatePost(int id, BlogPost updatedPost) {
        BlogPost post = blogPostRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        post.setTitle(updatedPost.getTitle());
        post.setContent(updatedPost.getContent());
        post.setCoverImageUrl(updatedPost.getCoverImageUrl());
        post.setLikes(updatedPost.getLikes());
        return blogPostRepository.save(post);
    }

    // DELETE /api/admin/posts/{id}
    public void deletePost(int id) {
            blogPostRepository.deleteById(id);
    }
}
