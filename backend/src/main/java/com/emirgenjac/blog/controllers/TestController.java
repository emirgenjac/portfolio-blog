package com.emirgenjac.blog.controllers;

import com.emirgenjac.blog.entity.Admin;
import com.emirgenjac.blog.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TestController {

    private final AdminRepository adminRepository;

    @GetMapping("/info")
    public ResponseEntity<Admin> getAdminInfo() {
        // Get the authentication object from the SecurityContextHolder
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Check if the user is authenticated
        if (authentication != null && authentication.isAuthenticated()) {
            // Get the user's email (or username) from the principal.  This assumes the email is the principal
            String email = authentication.getName();

            // Retrieve the Admin from the database using the email
            Admin admin = adminRepository.findByEmail(email);
            if (admin != null) {
                return ResponseEntity.ok(admin); // Return the Admin object
            }
            else{
                return ResponseEntity.status(404).body(null);
            }

        } else {
            return ResponseEntity.status(401).body(null); // Return 401 Unauthorized if not authenticated
        }
    }
}
