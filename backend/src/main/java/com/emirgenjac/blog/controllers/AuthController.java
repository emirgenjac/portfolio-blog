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


        Admin admin = adminRepository.findByEmail(loginDto.getEmail());

        if (admin != null) {
            if (passwordEncoder.matches(loginDto.getPassword(), admin.getPassword())) {
                response = "success, email: " + admin.getEmail() + " , password: " + admin.getPassword();
                return new ResponseEntity<>(response, HttpStatus.OK);

            } else {
                response = "Invalid password";
                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
            }
        } else {
            response = "Invalid email";
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
    }}
