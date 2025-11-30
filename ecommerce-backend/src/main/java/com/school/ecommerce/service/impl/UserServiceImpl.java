package com.school.ecommerce.service.impl;

import com.school.ecommerce.dto.AuthRequest;
import com.school.ecommerce.dto.AuthResponse;
import com.school.ecommerce.dto.UserDTO;
import com.school.ecommerce.exception.BadRequestException;
import com.school.ecommerce.exception.ResourceNotFoundException;
import com.school.ecommerce.model.User;
import com.school.ecommerce.repository.UserRepository;
import com.school.ecommerce.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository; this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDTO register(User user) {
        if (user.getEmail() == null || user.getPassword() == null) {
            throw new BadRequestException("Email and password are required");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null) user.setRole(User.Role.CUSTOMER);
        User saved = userRepository.save(user);
        return UserDTO.fromEntity(saved);
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid credentials"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid credentials");
        }
        // For now return a simple response (JWT can be added later)
        return new AuthResponse("Login successful", user.getId(), user.getRole().name());
    }

    @Override
    public List<UserDTO> findAll() {
        return userRepository.findAll().stream().map(UserDTO::fromEntity).collect(Collectors.toList());
    }

    @Override
    public UserDTO findById(String id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserDTO.fromEntity(user);
    }

    @Override
    public UserDTO update(String id, User updated) {
        User existing = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (updated.getName() != null) existing.setName(updated.getName());
        if (updated.getEmail() != null) existing.setEmail(updated.getEmail());
        if (updated.getPassword() != null) existing.setPassword(passwordEncoder.encode(updated.getPassword()));
        if (updated.getRole() != null) existing.setRole(updated.getRole());
        User saved = userRepository.save(existing);
        return UserDTO.fromEntity(saved);
    }

    @Override
    public void delete(String id) {
        if (!userRepository.existsById(id)) throw new ResourceNotFoundException("User not found");
        userRepository.deleteById(id);
    }
}

