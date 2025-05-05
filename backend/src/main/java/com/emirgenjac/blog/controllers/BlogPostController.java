package com.emirgenjac.blog.controllers;

import com.emirgenjac.blog.dto.BlogPostDTO;
import com.emirgenjac.blog.entity.Admin;
import com.emirgenjac.blog.entity.BlogPost;
import com.emirgenjac.blog.repository.AdminRepository;
import com.emirgenjac.blog.services.BlogPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/blog")
public class BlogPostController {
    @Autowired
    private BlogPostService blogPostService;
    @Autowired
    private AdminRepository adminRepository;

    @GetMapping("")
    public List<BlogPost> getAllPosts() {
        List<BlogPost> posts = blogPostService.getAllPosts();
        if (posts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, " No posts found");
        }

        return posts;
    }

    @GetMapping("/{id}")
    public BlogPost getPostById(@PathVariable int id) {
        BlogPost post = blogPostService.getPostById(id);
        if (post == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, " Post not found");
        }
        return post;
    }

    @PutMapping("/posts/{id}/like")
    public ResponseEntity<String> likePost(@PathVariable int id) {
        BlogPost post = blogPostService.getPostById(id);
        if (post == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }

        post.setLikes(post.getLikes() + 1);
        blogPostService.updatePost(id, post);

        return ResponseEntity.ok("Liked post with id " + id + ". Total likes: " + post.getLikes());
    }

    @PostMapping("/admin/posts")
    public BlogPost createPost(@RequestBody BlogPostDTO postDto) {
        try {
            Admin admin = adminRepository.findById(1).orElseThrow(() -> new RuntimeException("Admin not found"));
            BlogPost post = new BlogPost();
            post.setTitle(postDto.getTitle());
            post.setContent(postDto.getContent());
            post.setCoverImageUrl(postDto.getCoverImageUrl());
            post.setAuthor("Emir Genjac");
            post.setAdmin(admin);
            return blogPostService.createPost(post);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, " Post creation failed");
        }

    }

    @PutMapping("/admin/posts/{id}")
    public BlogPost updatePost(@PathVariable int id, @RequestBody BlogPostDTO postDto) {
        BlogPost post = new BlogPost();
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setCoverImageUrl(postDto.getCoverImageUrl());
        post.setAuthor("Emir Genjac");
        return blogPostService.updatePost(id, post);
    }

    @DeleteMapping("/admin/posts/{id}")
    public ResponseEntity<String> deletePost(@PathVariable int id) {
        BlogPost post = blogPostService.getPostById(id);
        if (post == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }

        blogPostService.deletePost(id);
        return ResponseEntity.ok("Deleted post with id " + id);
    }
}
