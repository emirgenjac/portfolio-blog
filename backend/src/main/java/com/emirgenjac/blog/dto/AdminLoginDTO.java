package com.emirgenjac.blog.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminLoginDTO {
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 254)
    private String email;

    @NotBlank(message = "Password is required")
    // No min length on login — reject only empty/oversized payloads; auth decides match/fail
    @Size(max = 128, message = "Password is too long")
    private String password;
}
