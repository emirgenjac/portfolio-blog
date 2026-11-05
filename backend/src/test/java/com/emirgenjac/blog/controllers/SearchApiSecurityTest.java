package com.emirgenjac.blog.controllers;

import com.emirgenjac.blog.entity.BlogPost;
import com.emirgenjac.blog.repository.BlogPostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SearchApiSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BlogPostRepository blogPostRepository;

    private BlogPost jwtPost;
    private BlogPost decoyPost;

    @BeforeEach
    void seedPosts() {
        blogPostRepository.deleteAll();

        jwtPost = new BlogPost();
        jwtPost.setTitle("HttpOnly JWT cookies");
        jwtPost.setTagline("Tokens live in a cookie");
        jwtPost.setContent("The login token is stored in an HttpOnly cookie, not localStorage.");
        jwtPost.setCoverImageUrl("https://example.com/jwt.jpg");
        jwtPost.setAuthor("Emir Genjac");
        jwtPost = blogPostRepository.save(jwtPost);

        decoyPost = new BlogPost();
        decoyPost.setTitle("Unrelated decoy post");
        decoyPost.setTagline("Nothing to see");
        decoyPost.setContent("This post must not leak through injected SQL or LIKE wildcards.");
        decoyPost.setCoverImageUrl("https://example.com/decoy.jpg");
        decoyPost.setAuthor("Emir Genjac");
        decoyPost = blogPostRepository.save(decoyPost);
    }

    @Test
    void missingAndBlankQueryReturn400() throws Exception {
        mockMvc.perform(get("/search"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.path").value("/search"));

        mockMvc.perform(get("/search").param("q", "   "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void overlongQueryReturns400() throws Exception {
        mockMvc.perform(get("/search").param("q", "a".repeat(101)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Query is too long"));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "' OR 1=1 --",
            "\" OR \"\"=\"",
            "1; DROP TABLE blog_post;--",
            "%",
            "_",
            "%' OR 1=1 --",
            "&|!:()*",
            ":* & !"
    })
    void injectionAndWildcardPayloadsDoNotErrorOrLeakOtherRows(String payload) throws Exception {
        mockMvc.perform(get("/search").param("q", payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0))
                .andExpect(jsonPath("$[*].id", not(hasItem(decoyPost.getId()))))
                .andExpect(jsonPath("$[*].id", not(hasItem(jwtPost.getId()))));
    }

    @Test
    void unicodeQueryReturns200Not500() throws Exception {
        mockMvc.perform(get("/search").param("q", "你好"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void legitimateQueryFindsMatchingPostWithoutAuth() throws Exception {
        mockMvc.perform(get("/search").param("q", "jwt"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].kind").value("post"))
                .andExpect(jsonPath("$[0].id").value(jwtPost.getId()))
                .andExpect(jsonPath("$[0].href").value("/blog/" + jwtPost.getId()))
                .andExpect(jsonPath("$[*].id", not(hasItem(decoyPost.getId()))))
                .andExpect(jsonPath("$[0].admin").doesNotExist());
    }

    @Test
    void projectBlurbIsSearchable() throws Exception {
        mockMvc.perform(get("/search").param("q", "FAZUOI"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].kind").value("project"))
                .andExpect(jsonPath("$[0].title").value("Digital Seized Assets Catalogue"))
                .andExpect(jsonPath("$[0].href").value("https://katalog.fazuoi.gov.ba/"))
                .andExpect(jsonPath("$[0].snippet").exists());
    }

    @Test
    void aboutThisSiteIsSearchable() throws Exception {
        mockMvc.perform(get("/search").param("q", "emirgenjac.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].kind").value("about"))
                .andExpect(jsonPath("$[0].title").value("About this site"))
                .andExpect(jsonPath("$[0].href").value("/blog"));
    }
}
