package com.emirgenjac.blog.controllers;

import com.emirgenjac.blog.dto.BlogPostDTO;
import com.emirgenjac.blog.dto.BlogPostResponseDTO;
import com.emirgenjac.blog.entity.Admin;
import com.emirgenjac.blog.entity.BlogPost;
import com.emirgenjac.blog.repository.AdminRepository;
import com.emirgenjac.blog.services.BlogPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/blog")
public class BlogPostController {
    private static final String AUTHOR_DISPLAY_NAME = "Emir Genjac";

    @Autowired
    private BlogPostService blogPostService;
    @Autowired
    private AdminRepository adminRepository;

    @GetMapping
    public List<BlogPostResponseDTO> getAllPosts() {
        return blogPostService.getAllPosts().stream()
                .map(BlogPostResponseDTO::from)
                .toList();
    }

    @GetMapping("/{id}")
    public BlogPostResponseDTO getPostById(@PathVariable int id) {
        return BlogPostResponseDTO.from(blogPostService.getPostById(id));
    }

    @PostMapping("/admin/posts")
    public BlogPostResponseDTO createPost(
            @jakarta.validation.Valid @RequestBody BlogPostDTO postDto,
            Authentication authentication) {
        Admin admin = requireAdmin(authentication);
        BlogPost post = new BlogPost();
        post.setTitle(postDto.getTitle());
        post.setTagline(postDto.getTagline());
        post.setContent(postDto.getContent());
        post.setCoverImageUrl(postDto.getCoverImageUrl());
        post.setAuthor(AUTHOR_DISPLAY_NAME);
        post.setAdmin(admin);
        return BlogPostResponseDTO.from(blogPostService.createPost(post));
    }

    @PutMapping("/admin/posts/{id}")
    public BlogPostResponseDTO updatePost(
            @PathVariable int id,
            @jakarta.validation.Valid @RequestBody BlogPostDTO postDto,
            Authentication authentication) {
        requireAdmin(authentication);
        BlogPost post = blogPostService.getPostById(id);
        post.setTitle(postDto.getTitle());
        post.setTagline(postDto.getTagline());
        post.setContent(postDto.getContent());
        post.setCoverImageUrl(postDto.getCoverImageUrl());
        post.setAuthor(AUTHOR_DISPLAY_NAME);
        return BlogPostResponseDTO.from(blogPostService.updatePost(id, post));
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

    private Admin requireAdmin(Authentication authentication) {
        if (authentication == null
                || authentication instanceof AnonymousAuthenticationToken
                || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        Admin admin = adminRepository.findByEmail(authentication.getName());
        if (admin == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return admin;
    }
}
