package com.emirgenjac.blog.repository;

import com.emirgenjac.blog.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;


public interface AdminRepository extends JpaRepository<Admin, Integer> {
    Admin findByEmail(String email);
}
