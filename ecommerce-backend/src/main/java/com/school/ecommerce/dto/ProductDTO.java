package com.school.ecommerce.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import com.school.ecommerce.model.ExternalLink;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductDTO {
    private String id;
    private String name;
    private String description;
    private double price;
    private String categoryId;
    private String categoryName;
    private List<String> images;
    private List<String> availablePlatforms;
    private List<ExternalLink> externalLinks;
    private boolean localSale;
    private MultipartFile image;
    private int hits;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}