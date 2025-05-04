package com.emirgenjac.blog.controllers;

import com.emirgenjac.blog.dto.BlogPostDTO;
import com.emirgenjac.blog.entity.BlogPost;
import com.emirgenjac.blog.services.BlogPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BlogPostController {
    @Autowired
    private BlogPostService blogPostService;

    @GetMapping("/posts")
    public List<BlogPost> getAllPosts() {
        return blogPostService.getAllPosts();
    }

    @GetMapping("/posts/{id}")
    public BlogPost getPostById(@PathVariable int id) {
        return blogPostService.getPostById(id);
    }

    @PostMapping("/admin/posts")
    @PreAuthorize("hasRole('ADMIN')")
    public BlogPost createPost(@RequestBody BlogPostDTO postDto) {
        BlogPost post = new BlogPost();
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setCoverImageUrl(postDto.getCoverImageUrl());
        post.setAuthor(postDto.getAuthor());
        return blogPostService.createPost(post);
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public BlogPost updatePost(@PathVariable int id, @RequestBody BlogPostDTO postDto) {
        BlogPost post = new BlogPost();
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setCoverImageUrl(postDto.getCoverImageUrl());
        post.setAuthor(postDto.getAuthor());
        return blogPostService.updatePost(id, post);
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deletePost(@PathVariable int id) {
        blogPostService.deletePost(id);
    }
}
