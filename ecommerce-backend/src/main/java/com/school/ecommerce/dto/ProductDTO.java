package com.school.ecommerce.dto;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public class ProductDTO {
    private String id;
    private String name;
    private String description;
    private double price;
    private String categoryId;
    private List<String> images; // Base64 encoded images
    private List<String> availablePlatforms;
    private boolean isLocalSale;
    private MultipartFile image; // for upload requests

    public ProductDTO() {
    }

    public ProductDTO(String id, String name, String description, double price, String categoryId,
            List<String> images, List<String> availablePlatforms, boolean isLocalSale) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.categoryId = categoryId;
        this.images = images;
        this.availablePlatforms = availablePlatforms;
        this.isLocalSale = isLocalSale;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public List<String> getAvailablePlatforms() {
        return availablePlatforms;
    }

    public void setAvailablePlatforms(List<String> availablePlatforms) {
        this.availablePlatforms = availablePlatforms;
    }

    public boolean isLocalSale() {
        return isLocalSale;
    }

    public void setLocalSale(boolean localSale) {
        this.isLocalSale = localSale;
    }

    public MultipartFile getImage() {
        return image;
    }

    public void setImage(MultipartFile image) {
        this.image = image;
    }
}
