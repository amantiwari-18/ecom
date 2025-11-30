package com.school.ecommerce.dto;

import java.util.List;

public class ProductDTO {
    private String id;
    private String name;
    private String description;
    private double price;
    private String categoryId;
    private List<String> images;
    private List<String> availablePlatforms;
    private boolean localSale;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
    public List<String> getAvailablePlatforms() { return availablePlatforms; }
    public void setAvailablePlatforms(List<String> availablePlatforms) { this.availablePlatforms = availablePlatforms; }
    public boolean isLocalSale() { return localSale; }
    public void setLocalSale(boolean localSale) { this.localSale = localSale; }
}

