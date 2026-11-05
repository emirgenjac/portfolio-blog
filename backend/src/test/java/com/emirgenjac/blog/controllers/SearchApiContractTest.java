package com.emirgenjac.blog.controllers;

import com.emirgenjac.blog.entity.BlogPost;
import com.emirgenjac.blog.repository.BlogPostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SearchApiContractTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BlogPostRepository blogPostRepository;

    @BeforeEach
    void seedPost() {
        blogPostRepository.deleteAll();
        BlogPost post = new BlogPost();
        post.setTitle("HttpOnly JWT cookies");
        post.setTagline("Tokens live in a cookie");
        post.setContent("The login token is stored in an HttpOnly cookie, not localStorage.");
        post.setCoverImageUrl("https://example.com/jwt.jpg");
        post.setAuthor("Emir Genjac");
        blogPostRepository.save(post);
    }

    @Test
    void hitJsonIsSearchHitDtoOnly() throws Exception {
        mockMvc.perform(get("/search").param("q", "jwt"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].kind").value("post"))
                .andExpect(jsonPath("$[0].id").isNumber())
                .andExpect(jsonPath("$[0].title").exists())
                .andExpect(jsonPath("$[0].snippet").exists())
                .andExpect(jsonPath("$[0].href").exists())
                .andExpect(jsonPath("$[0].length()").value(5))
                .andExpect(jsonPath("$[0].content").doesNotExist())
                .andExpect(jsonPath("$[0].body").doesNotExist())
                .andExpect(jsonPath("$[0].tagline").doesNotExist())
                .andExpect(jsonPath("$[0].coverImageUrl").doesNotExist())
                .andExpect(jsonPath("$[0].author").doesNotExist())
                .andExpect(jsonPath("$[0].admin").doesNotExist())
                .andExpect(jsonPath("$[0].password").doesNotExist());
    }

    @Test
    void invalidQueryReturnsErrorResponse() throws Exception {
        mockMvc.perform(get("/search"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Query is required"))
                .andExpect(jsonPath("$.path").value("/search"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void questionQueryMatchesMadeWithCopy() throws Exception {
        BlogPost makingOf = new BlogPost();
        makingOf.setTitle("Kako sam pravio ovaj sajt (i šta sam stvarno naučio)");
        makingOf.setTagline("Portfolio, blog i admin panel na jednom mjestu");
        makingOf.setContent("Ovaj sajt nisam krenuo da pravim kao projekat za GitHub.");
        makingOf.setCoverImageUrl("https://example.com/site.jpg");
        makingOf.setAuthor("Emir Genjac");
        makingOf = blogPostRepository.save(makingOf);

        mockMvc.perform(get("/search").param("q", "What was this made with?"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").exists())
                .andExpect(jsonPath("$[0].snippet").exists())
                .andExpect(jsonPath("$[*].title", hasItem("About this site")))
                .andExpect(jsonPath("$[*].href", hasItem("/blog/" + makingOf.getId())));
    }

    @Test
    void hackQueryMatchesHeronn() throws Exception {
        mockMvc.perform(get("/search").param("q", "hack"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].kind").value("project"))
                .andExpect(jsonPath("$[0].title").value("Heronn.ai"));
    }

    @Test
    void siteCardIsSearchableAsDto() throws Exception {
        mockMvc.perform(get("/search").param("q", "Webflow"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].kind").value("site"))
                .andExpect(jsonPath("$[0].title").exists())
                .andExpect(jsonPath("$[0].href").exists())
                .andExpect(jsonPath("$[0].length()").value(5))
                .andExpect(jsonPath("$[0].content").doesNotExist());
    }
}
