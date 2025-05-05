package com.emirgenjac.blog.controllers;

import com.emirgenjac.blog.dto.AdminLoginDTO;
import com.emirgenjac.blog.entity.Admin;
import com.emirgenjac.blog.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody AdminLoginDTO loginDto) {
            String response;

        // 1. Retrieve the user from the database using the provided email.
        Admin admin = adminRepository.findByEmail(loginDto.getEmail()); // Assuming you have this repository

        if (admin != null) {
            // 2. Check if the provided password matches the stored password.
            //    You should use a PasswordEncoder (like BCryptPasswordEncoder) to compare passwords.
            if (passwordEncoder.matches(loginDto.getPassword(), admin.getPassword())) {
                response = "success, email: " + admin.getEmail() + " , password: " + admin.getPassword();
                return new ResponseEntity<>(response, HttpStatus.OK);

            } else {
                // 4. If the password doesn't match, return an error.
                response = "Invalid password";
                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
            }
        } else {
            // 5. If the user with the given email is not found, return an error.
            response = "Invalid email";
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
    }}
