package com.school.ecommerce.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "products")
public class Product {
    @Id
    private String id;
    private String name;
    private String description;
    private double price;
    private String categoryId;
    private List<String> images;
    private List<ExternalLink> externalLinks;

    private List<String> availablePlatforms;

    public Product() {
    }

    public Product(String id, String name, String description, double price, String categoryId,
            List<String> images, List<String> availablePlatforms) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.categoryId = categoryId;
        this.images = images;
        this.availablePlatforms = availablePlatforms;

    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<ExternalLink> getExternalLinks() {
        return externalLinks;
    }

    public void setExternalLinks(List<ExternalLink> externalLinks) {
        this.externalLinks = externalLinks;
    }

    public String getImage() {
        return (images != null && !images.isEmpty()) ? images.get(0) : null;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // Add this method to get all images
    public List<String> getImageUrls() {
        return images;
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
}
