package com.emirgenjac.blog.controllers;

import com.emirgenjac.blog.entity.Admin;
import com.emirgenjac.blog.entity.BlogPost;
import com.emirgenjac.blog.repository.AdminRepository;
import com.emirgenjac.blog.repository.BlogPostRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BlogPostAdminSecurityTest {

    private static final String ADMIN_EMAIL = "admin@example.com";
    private static final String ADMIN_PASSWORD = "secret123";

    private static final String VALID_POST_JSON = """
            {
              "title": "Test title",
              "tagline": "Test tagline",
              "content": "Test content",
              "coverImageUrl": "https://example.com/cover.jpg"
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void seedAdmin() {
        adminRepository.deleteAll();
        Admin admin = new Admin();
        admin.setEmail(ADMIN_EMAIL);
        admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
        adminRepository.save(admin);
    }

    @Test
    void createPostWithoutJwtReturns401() throws Exception {
        TestCsrf.perform(mockMvc, post("/blog/admin/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_POST_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updatePostWithoutJwtReturns401() throws Exception {
        TestCsrf.perform(mockMvc, put("/blog/admin/posts/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_POST_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deletePostWithoutJwtReturns401() throws Exception {
        TestCsrf.perform(mockMvc, delete("/blog/admin/posts/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createPostWithJwtButInvalidDtoReturns400ErrorResponse() throws Exception {
        Cookie jwt = loginAndGetJwtCookie();

        TestCsrf.perform(mockMvc, post("/blog/admin/posts")
                        .cookie(jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"","tagline":"","content":"","coverImageUrl":""}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value(containsString("required")))
                .andExpect(jsonPath("$.path").value("/blog/admin/posts"));
    }

    @Test
    @Transactional
    void createPostAttachesJwtAdminNotTheFirstRow() throws Exception {
        adminRepository.deleteAll();
        blogPostRepository.deleteAll();

        Admin decoy = new Admin();
        decoy.setEmail("other@example.com");
        decoy.setPassword(passwordEncoder.encode("not-used"));
        adminRepository.save(decoy);

        Admin loggedIn = new Admin();
        loggedIn.setEmail(ADMIN_EMAIL);
        loggedIn.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
        adminRepository.save(loggedIn);

        Cookie jwt = loginAndGetJwtCookie();
        TestCsrf.perform(mockMvc, post("/blog/admin/posts")
                        .cookie(jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_POST_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test title"))
                .andExpect(jsonPath("$.tagline").value("Test tagline"))
                .andExpect(jsonPath("$.author").value("Emir Genjac"))
                .andExpect(jsonPath("$.admin").doesNotExist());

        List<BlogPost> posts = blogPostRepository.findAll();
        assertFalse(posts.isEmpty());
        assertEquals(ADMIN_EMAIL, posts.get(0).getAdmin().getEmail());
        assertEquals("Emir Genjac", posts.get(0).getAuthor());
    }

    private Cookie loginAndGetJwtCookie() throws Exception {
        MvcResult login = TestCsrf.perform(mockMvc, post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(ADMIN_EMAIL, ADMIN_PASSWORD)))
                .andExpect(status().isOk())
                .andReturn();

        return login.getResponse().getCookie("jwt");
    }
}
