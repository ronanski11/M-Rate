package com.ronanski11.mrate.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ronanski11.mrate.model.dto.UserDTO;
import com.ronanski11.mrate.security.AuthenticationService;
import com.ronanski11.mrate.security.RequireAdmin;
import com.ronanski11.mrate.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService service;
    
    @Autowired
    private AuthenticationService auth;
    
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        return ResponseEntity.ok(service.getUserById(auth.getId()));
    }
    
    @PutMapping("/me/password")
    public ResponseEntity<?> updatePassword(
            @RequestParam String currentPassword, 
            @RequestParam String newPassword) {
        service.updatePassword(auth.getId(), auth.getUsername(), currentPassword, newPassword);
        return ResponseEntity.ok().build();
    }
    
    // @PutMapping("/me/profile-pic")
    public ResponseEntity<UserDTO> updateProfilePic(@RequestParam String profilePicId) {
    	// TODO
        return null;
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(service.getUserById(id));
    }
    
    @GetMapping("/username/{username}")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(service.getUserByUsername(username));
    }
    
    @GetMapping
    @RequireAdmin
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(service.getAllUsers());
    }
    
    @PutMapping("/{id}/role")
    @RequireAdmin
    public ResponseEntity<UserDTO> updateUserRole(
            @PathVariable String id, 
            @RequestParam String role) {
        return ResponseEntity.ok(service.updateUserRole(id, role));
    }
    
    @DeleteMapping("/{id}")
    @RequireAdmin
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        service.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}