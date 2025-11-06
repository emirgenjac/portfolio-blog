package com.emirgenjac.blog.services;

import com.emirgenjac.blog.entity.Admin;
import com.emirgenjac.blog.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public boolean authenticate(String email, String password) {
        Admin admin = adminRepository.findByEmail(email);
        System.out.println("Trying to authenticate email: " + email);

        if (admin == null){
            System.out.println("Admin not found");
            return false;
        }

        System.out.println("Admin found: " + admin.getEmail());
        System.out.println("Raw password: " + password);
        System.out.println("Hashed password in DB: " + admin.getPassword());

        boolean matches = passwordEncoder.matches(password, admin.getPassword());
        System.out.println("Password matches: " + matches);
        return matches;
    }
}