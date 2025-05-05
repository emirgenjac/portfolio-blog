package com.emirgenjac.blog.controllers;

import com.emirgenjac.blog.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AuthService authService;

    @PutMapping("/password")
    @PreAuthorize("hasRole('ADMIN')")
    public void updatePassword(@RequestBody String newPassword) {
        authService.updatePassword(1, newPassword);
    }
}
