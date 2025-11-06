package com.emirgenjac.blog.model;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
}