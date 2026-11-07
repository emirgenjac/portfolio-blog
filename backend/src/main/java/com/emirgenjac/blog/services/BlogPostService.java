package com.emirgenjac.blog.services;

import com.emirgenjac.blog.entity.BlogPost;
import com.emirgenjac.blog.repository.BlogPostRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BlogPostService {

    private final BlogPostRepository blogPostRepository;
    private final SearchIndexService searchIndexService;

    public BlogPostService(BlogPostRepository blogPostRepository, SearchIndexService searchIndexService) {
        this.blogPostRepository = blogPostRepository;
        this.searchIndexService = searchIndexService;
    }

    public List<BlogPost> getAllPosts() {
        return blogPostRepository.findAllByOrderByCreatedAtDesc();
    }

    public BlogPost getPostById(int id) {
        return blogPostRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    @Transactional
    public BlogPost createPost(BlogPost post) {
        BlogPost saved = blogPostRepository.save(post);
        searchIndexService.reindex(saved);
        return saved;
    }

    @Transactional
    public BlogPost updatePost(int id, BlogPost updatedPost) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        post.setTitle(updatedPost.getTitle());
        post.setTagline(updatedPost.getTagline());
        post.setContent(updatedPost.getContent());
        post.setCoverImageUrl(updatedPost.getCoverImageUrl());
        post.setAuthor(updatedPost.getAuthor());
        BlogPost saved = blogPostRepository.save(post);
        searchIndexService.reindex(saved);
        return saved;
    }

    @Transactional
    public void deletePost(int id) {
        if (!blogPostRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
        searchIndexService.remove(id);
        blogPostRepository.deleteById(id);
    }
}
