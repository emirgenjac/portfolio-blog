package com.emirgenjac.blog.services;

import com.emirgenjac.blog.repository.AdminRepository;
import com.emirgenjac.blog.entity.Admin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public boolean login(String email, String password) {
        Admin admin = adminRepository.findByEmail(email);
        return admin != null && passwordEncoder.matches(password, admin.getPassword());
    }

    public void updatePassword(int adminId, String newPassword) {
        Admin admin = adminRepository.findById(adminId).orElseThrow();
        admin.setPassword(passwordEncoder.encode(newPassword));
        adminRepository.save(admin);
    }
}

