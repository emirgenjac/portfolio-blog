package com.emirgenjac.blog.controllers;

import com.emirgenjac.blog.entity.Admin;
import com.emirgenjac.blog.entity.BlogPost;
import com.emirgenjac.blog.repository.AdminRepository;
import com.emirgenjac.blog.repository.BlogPostRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

    @Value("${jwt.secret}")
    private String jwtSecret;

    @BeforeEach
    void seedAdmin() {
        blogPostRepository.deleteAll();
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

    @Test
    void createPostWithJwtButNoCsrfReturns403() throws Exception {
        Cookie jwt = loginAndGetJwtCookie();

        mockMvc.perform(post("/blog/admin/posts")
                        .cookie(jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_POST_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @Transactional
    void updateAndDeletePostWithJwtSucceeds() throws Exception {
        Cookie jwt = loginAndGetJwtCookie();
        MvcResult created = TestCsrf.perform(mockMvc, post("/blog/admin/posts")
                        .cookie(jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_POST_JSON))
                .andExpect(status().isOk())
                .andReturn();

        int id = com.jayway.jsonpath.JsonPath.read(created.getResponse().getContentAsString(), "$.id");

        TestCsrf.perform(mockMvc, put("/blog/admin/posts/" + id)
                        .cookie(jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Updated title",
                                  "tagline": "Updated tagline",
                                  "content": "Updated content",
                                  "coverImageUrl": "https://example.com/updated.jpg"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.title").value("Updated title"))
                .andExpect(jsonPath("$.tagline").value("Updated tagline"))
                .andExpect(jsonPath("$.content").value("Updated content"))
                .andExpect(jsonPath("$.coverImageUrl").value("https://example.com/updated.jpg"))
                .andExpect(jsonPath("$.author").value("Emir Genjac"))
                .andExpect(jsonPath("$.admin").doesNotExist());

        mockMvc.perform(get("/blog/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated title"));

        TestCsrf.perform(mockMvc, delete("/blog/admin/posts/" + id).cookie(jwt))
                .andExpect(status().isOk());

        mockMvc.perform(get("/blog/" + id))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateAndDeleteMissingPostReturn404() throws Exception {
        Cookie jwt = loginAndGetJwtCookie();

        TestCsrf.perform(mockMvc, put("/blog/admin/posts/999999")
                        .cookie(jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_POST_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Post not found"));

        TestCsrf.perform(mockMvc, delete("/blog/admin/posts/999999").cookie(jwt))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Post not found"));
    }

    @Test
    void createPostWithInvalidJwtReturns401() throws Exception {
        TestCsrf.perform(mockMvc, post("/blog/admin/posts")
                        .cookie(new Cookie("jwt", "not-a-jwt"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_POST_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createPostWithExpiredJwtReturns401() throws Exception {
        String expired = Jwts.builder()
                .setSubject(ADMIN_EMAIL)
                .setIssuedAt(new Date(System.currentTimeMillis() - 10_000))
                .setExpiration(new Date(System.currentTimeMillis() - 1_000))
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                .compact();

        TestCsrf.perform(mockMvc, post("/blog/admin/posts")
                        .cookie(new Cookie("jwt", expired))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_POST_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createPostWithJwtButOversizedTitleReturns400() throws Exception {
        Cookie jwt = loginAndGetJwtCookie();
        String tooLongTitle = "a".repeat(201);

        TestCsrf.perform(mockMvc, post("/blog/admin/posts")
                        .cookie(jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "%s",
                                  "tagline": "Test tagline",
                                  "content": "Test content",
                                  "coverImageUrl": "https://example.com/cover.jpg"
                                }
                                """.formatted(tooLongTitle)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value(containsString("Title must be at most 200 characters")));
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
