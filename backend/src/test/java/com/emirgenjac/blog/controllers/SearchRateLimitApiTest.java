package com.emirgenjac.blog.controllers;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "app.rate-limit.search.max-attempts=3",
        "app.rate-limit.search.window-seconds=60"
})
class SearchRateLimitApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void fourthSearchFromSameClientReturns429() throws Exception {
        String client = "203.0.113.80";

        for (int i = 0; i < 3; i++) {
            mockMvc.perform(get("/search").param("q", "jwt").header("X-Forwarded-For", client))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(get("/search").param("q", "jwt").header("X-Forwarded-For", client))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.path").value("/search"));
    }
}
