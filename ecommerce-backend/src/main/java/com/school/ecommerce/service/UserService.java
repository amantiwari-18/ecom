package com.school.ecommerce.service;

import com.school.ecommerce.dto.AuthRequest;
import com.school.ecommerce.dto.AuthResponse;
import com.school.ecommerce.dto.UserDTO;
import com.school.ecommerce.model.User;

import java.util.List;

public interface UserService {
    UserDTO register(User user);
    AuthResponse login(AuthRequest request);
    List<UserDTO> findAll();
    UserDTO findById(String id);
    UserDTO update(String id, User user);
    void delete(String id);
}

