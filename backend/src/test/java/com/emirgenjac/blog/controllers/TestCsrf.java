package com.emirgenjac.blog.controllers;

import com.jayway.jsonpath.JsonPath;
import jakarta.servlet.http.Cookie;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

final class TestCsrf {

    private TestCsrf() {
    }

    static ResultActions perform(MockMvc mockMvc, MockHttpServletRequestBuilder request) throws Exception {
        MvcResult csrf = mockMvc.perform(get("/auth/csrf"))
                .andExpect(status().isOk())
                .andReturn();

        String token = JsonPath.read(csrf.getResponse().getContentAsString(), "$.token");
        String headerName = JsonPath.read(csrf.getResponse().getContentAsString(), "$.headerName");
        Cookie cookie = csrf.getResponse().getCookie("XSRF-TOKEN");

        request.header(headerName, token).header("X-XSRF-TOKEN", token);
        if (cookie != null) {
            request.cookie(cookie);
        }
        return mockMvc.perform(request);
    }
}
