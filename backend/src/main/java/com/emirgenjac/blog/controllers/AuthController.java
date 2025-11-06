package com.emirgenjac.blog.controllers;

import com.emirgenjac.blog.model.AuthRequest;
import com.emirgenjac.blog.model.AuthResponse;
import com.emirgenjac.blog.services.AdminService;
import com.emirgenjac.blog.services.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        System.out.println("Login request received: " + request.getEmail());

        boolean authenticated = adminService.authenticate(request.getEmail(), request.getPassword());
        System.out.println("Authenticated: " + authenticated);
        if (!authenticated) {
            System.out.println("Login failed: wrong credentials");

            return ResponseEntity.status(401).build();
        }

        String token = jwtService.generateToken(request.getEmail());
        System.out.println("Token generated: " + token);

        return ResponseEntity.ok(new AuthResponse(token));
    }
}
