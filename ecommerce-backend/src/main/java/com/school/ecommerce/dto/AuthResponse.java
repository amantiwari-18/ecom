package com.school.ecommerce.dto;

public class AuthResponse {
    private String message;
    private String userId;
    private String role;

    public AuthResponse() {}
    public AuthResponse(String message, String userId, String role) {
        this.message = message; this.userId = userId; this.role = role;
    }

    public String getMessage() { return message; }
    public String getUserId() { return userId; }
    public String getRole() { return role; }
    public void setMessage(String message) { this.message = message; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setRole(String role) { this.role = role; }
}

