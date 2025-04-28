package com.ronanski11.mrate.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ronanski11.mrate.model.Role;
import com.ronanski11.mrate.model.User;
import com.ronanski11.mrate.model.dto.UserDTO;
import com.ronanski11.mrate.repository.UserRepository;
import com.ronanski11.mrate.security.AuthenticationService;

@Service
public class UserService {
    
    @Autowired
    private UserRepository repository;
    
    @Autowired
    private AuthenticationService authService;
    
    public List<UserDTO> getAllUsers() {
        return repository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public UserDTO getUserById(String id) {
        User user = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        return convertToDTO(user);
    }
    
    public UserDTO getUserByUsername(String username) {
        User user = repository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        return convertToDTO(user);
    }
    
    public UserDTO updateUserRole(String id, String role) {
        User user = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        try {
            Role newRole = Role.valueOf(role.toUpperCase());
            user.setRole(newRole);
            User updatedUser = repository.save(user);
            return convertToDTO(updatedUser);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + role);
        }
    }
    
    public void updatePassword(String id, String username, String currentPassword, String newPassword) {
        User user = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Verify current password
        try {
            authService.authenticatePassword(username, currentPassword);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }
        
        // Update password
        user.setPassword(authService.encodePassword(newPassword));
        repository.save(user);
    }
    
    public UserDTO updateProfilePic(String id, String profilePicId) {
        User user = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        user.setProfilePicId(profilePicId);
        User updatedUser = repository.save(user);
        
        return convertToDTO(updatedUser);
    }
    
    public void deleteUser(String id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        
        repository.deleteById(id);
    }
    
    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .sharedWatchlists(user.getSharedWatchlists())
                .profilePicId(user.getProfilePicId())
                .joined(user.getJoined())
                .build();
    }
}