package com.emirgenjac.blog.controllers;

import com.emirgenjac.blog.entity.BlogPost;
import com.emirgenjac.blog.repository.BlogPostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class BlogPostPublicReadTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BlogPostRepository blogPostRepository;

    private BlogPost saved;

    @BeforeEach
    void seedPost() {
        blogPostRepository.deleteAll();
        BlogPost post = new BlogPost();
        post.setTitle("Public title");
        post.setTagline("Public tagline");
        post.setContent("Public content");
        post.setCoverImageUrl("https://example.com/cover.jpg");
        post.setAuthor("Emir Genjac");
        saved = blogPostRepository.save(post);
    }

    @Test
    void getAllPostsReturnsResponseDtoWithoutAdmin() throws Exception {
        mockMvc.perform(get("/blog"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(saved.getId()))
                .andExpect(jsonPath("$[0].title").value("Public title"))
                .andExpect(jsonPath("$[0].tagline").value("Public tagline"))
                .andExpect(jsonPath("$[0].content").value("Public content"))
                .andExpect(jsonPath("$[0].coverImageUrl").value("https://example.com/cover.jpg"))
                .andExpect(jsonPath("$[0].author").value("Emir Genjac"))
                .andExpect(jsonPath("$[0].createdAt").exists())
                .andExpect(jsonPath("$[0].updatedAt").exists())
                .andExpect(jsonPath("$[0].admin").doesNotExist())
                .andExpect(jsonPath("$[0].password").doesNotExist());
    }

    @Test
    void getPostByIdReturnsResponseDtoWithoutAdmin() throws Exception {
        mockMvc.perform(get("/blog/" + saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(saved.getId()))
                .andExpect(jsonPath("$.title").value("Public title"))
                .andExpect(jsonPath("$.admin").doesNotExist());
    }

    @Test
    void getPostByIdReturns404WhenMissing() throws Exception {
        mockMvc.perform(get("/blog/999999"))
                .andExpect(status().isNotFound());
    }
}
