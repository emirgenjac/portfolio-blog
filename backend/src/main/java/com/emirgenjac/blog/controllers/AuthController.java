package com.emirgenjac.blog.controllers;

import com.emirgenjac.blog.model.AuthRequest;
import com.emirgenjac.blog.services.AdminService;
import com.emirgenjac.blog.services.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
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
    public ResponseEntity<?> login(@RequestBody AuthRequest request, HttpServletResponse response) {
        System.out.println("Login request received: " + request.getEmail());

        boolean authenticated = adminService.authenticate(request.getEmail(), request.getPassword());
        System.out.println("Authenticated: " + authenticated);
        if (!authenticated) {
            System.out.println("Login failed: wrong credentials");

            return ResponseEntity.status(401).build();
        }

        String token = jwtService.generateToken(request.getEmail());
        System.out.println("Token generated: " + token);

        Cookie cookie = new Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);

        response.addCookie(cookie);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);

        response.addCookie(cookie);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/me")
    public ResponseEntity<?> me() {
        return ResponseEntity.ok().build();
    }
}
