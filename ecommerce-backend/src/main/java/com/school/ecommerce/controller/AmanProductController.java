package com.school.ecommerce.controller;

import com.school.ecommerce.model.Product;
import com.school.ecommerce.model.Category;
import com.school.ecommerce.model.ExternalLink;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class AmanProductController {

    private final MongoTemplate mongoTemplate;
    private final String IMAGE_UPLOAD_DIR = "uploads/products/";

    public AmanProductController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
        // Create upload directory if it doesn't exist
        new File(IMAGE_UPLOAD_DIR).mkdirs();
    }

    // AMAN API: Create Product with all details (POST)
    @PostMapping("/aman-create-product")
    public ResponseEntity<Product> amanCreateProduct(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam double price,
            @RequestParam String categoryId,
            @RequestParam(required = false) MultipartFile image,
            @RequestParam(required = false) List<MultipartFile> images,
            @RequestParam(required = false) List<String> websiteNames,
            @RequestParam(required = false) List<String> websiteUrls,
            @RequestParam(required = false) List<String> platforms) {

        try {
            // Validate category exists
            Category category = mongoTemplate.findById(categoryId, Category.class);
            if (category == null) {
                return ResponseEntity.badRequest().build();
            }

            Product product = new Product();
            product.setId(UUID.randomUUID().toString());
            product.setName(name);
            product.setDescription(description);
            product.setPrice(price);
            product.setCategoryId(categoryId);

            // Handle single image
            List<String> imageUrls = new ArrayList<>();
            if (image != null && !image.isEmpty()) {
                String imageUrl = saveImageToFile(image);
                if (imageUrl != null) {
                    imageUrls.add(imageUrl);
                }
            }

            // Handle multiple images
            if (images != null && !images.isEmpty()) {
                for (MultipartFile img : images) {
                    if (!img.isEmpty()) {
                        String imageUrl = saveImageToFile(img);
                        if (imageUrl != null) {
                            imageUrls.add(imageUrl);
                        }
                    }
                }
            }
            product.setImages(imageUrls);

            // Handle external links
            if (websiteNames != null && websiteUrls != null &&
                    websiteNames.size() == websiteUrls.size()) {
                List<ExternalLink> externalLinks = new ArrayList<>();
                for (int i = 0; i < websiteNames.size(); i++) {
                    ExternalLink link = new ExternalLink();
                    link.setWebsiteName(websiteNames.get(i));
                    link.setUrl(websiteUrls.get(i));
                    externalLinks.add(link);
                }
                product.setExternalLinks(externalLinks);
            }

            // Handle platforms
            if (platforms != null && !platforms.isEmpty()) {
                product.setAvailablePlatforms(platforms);
            }

            // Save to MongoDB
            Product savedProduct = mongoTemplate.save(product);
            return ResponseEntity.ok(savedProduct);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // AMAN API: Get All Products (GET)
    @GetMapping("/aman-get-all")
    public ResponseEntity<List<Product>> amanGetAllProducts() {
        try {
            List<Product> products = mongoTemplate.findAll(Product.class);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // AMAN API: Get Product by ID (GET)
    @GetMapping("/aman-get-by-id/{id}")
    public ResponseEntity<Product> amanGetProductById(@PathVariable String id) {
        try {
            Product product = mongoTemplate.findById(id, Product.class);
            if (product == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // AMAN API: Get Products by Category (GET)
    @GetMapping("/aman-get-by-category/{categoryId}")
    public ResponseEntity<List<Product>> amanGetProductsByCategory(@PathVariable String categoryId) {
        try {
            Query query = new Query(Criteria.where("categoryId").is(categoryId));
            List<Product> products = mongoTemplate.find(query, Product.class);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // AMAN API: Update Product (PUT)
    @PutMapping("/aman-update/{id}")
    public ResponseEntity<Product> amanUpdateProduct(
            @PathVariable String id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Double price,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) MultipartFile image,
            @RequestParam(required = false) List<MultipartFile> images,
            @RequestParam(required = false) List<String> websiteNames,
            @RequestParam(required = false) List<String> websiteUrls,
            @RequestParam(required = false) List<String> platforms) {

        try {
            Product existingProduct = mongoTemplate.findById(id, Product.class);
            if (existingProduct == null) {
                return ResponseEntity.notFound().build();
            }

            // Update fields if provided
            Update update = new Update();
            if (name != null) {
                update.set("name", name);
                existingProduct.setName(name);
            }
            if (description != null) {
                update.set("description", description);
                existingProduct.setDescription(description);
            }
            if (price != null) {
                update.set("price", price);
                existingProduct.setPrice(price);
            }
            if (categoryId != null) {
                update.set("categoryId", categoryId);
                existingProduct.setCategoryId(categoryId);
            }

            // Handle single image update
            List<String> imageUrls = existingProduct.getImages();
            if (imageUrls == null) {
                imageUrls = new ArrayList<>();
            }

            if (image != null && !image.isEmpty()) {
                String imageUrl = saveImageToFile(image);
                if (imageUrl != null) {
                    // If there are existing images, replace the first one
                    if (!imageUrls.isEmpty()) {
                        imageUrls.set(0, imageUrl);
                    } else {
                        imageUrls.add(imageUrl);
                    }
                }
            }

            // Handle multiple images addition
            if (images != null && !images.isEmpty()) {
                for (MultipartFile img : images) {
                    if (!img.isEmpty()) {
                        String imageUrl = saveImageToFile(img);
                        if (imageUrl != null) {
                            imageUrls.add(imageUrl);
                        }
                    }
                }
            }

            if (!imageUrls.isEmpty()) {
                update.set("images", imageUrls);
                existingProduct.setImages(imageUrls);
            }

            // Handle external links update
            if (websiteNames != null && websiteUrls != null &&
                    websiteNames.size() == websiteUrls.size()) {
                List<ExternalLink> externalLinks = new ArrayList<>();
                for (int i = 0; i < websiteNames.size(); i++) {
                    ExternalLink link = new ExternalLink();
                    link.setWebsiteName(websiteNames.get(i));
                    link.setUrl(websiteUrls.get(i));
                    externalLinks.add(link);
                }
                update.set("externalLinks", externalLinks);
                existingProduct.setExternalLinks(externalLinks);
            }

            // Handle platforms update
            if (platforms != null) {
                update.set("availablePlatforms", platforms);
                existingProduct.setAvailablePlatforms(platforms);
            }

            // Update in MongoDB
            Query query = new Query(Criteria.where("_id").is(id));
            mongoTemplate.updateFirst(query, update, Product.class);

            // Get updated product
            Product updatedProduct = mongoTemplate.findById(id, Product.class);
            return ResponseEntity.ok(updatedProduct);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // AMAN API: Delete Product (DELETE)
    @DeleteMapping("/aman-delete/{id}")
    public ResponseEntity<Void> amanDeleteProduct(@PathVariable String id) {
        try {
            Product product = mongoTemplate.findById(id, Product.class);
            if (product == null) {
                return ResponseEntity.notFound().build();
            }

            // Delete associated images from filesystem
            if (product.getImages() != null) {
                for (String imageUrl : product.getImages()) {
                    String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
                    Path imagePath = Paths.get(IMAGE_UPLOAD_DIR + filename);
                    Files.deleteIfExists(imagePath);
                }
            }

            // Delete from MongoDB
            Query query = new Query(Criteria.where("_id").is(id));
            mongoTemplate.remove(query, Product.class);

            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // AMAN API: Search Products by Name (GET)
    @GetMapping("/aman-search/{name}")
    public ResponseEntity<List<Product>> amanSearchProducts(@PathVariable String name) {
        try {
            Query query = new Query(Criteria.where("name").regex(name, "i"));
            List<Product> products = mongoTemplate.find(query, Product.class);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Helper method to save image to file system
    private String saveImageToFile(MultipartFile image) {
        try {
            if (image.isEmpty()) {
                return null;
            }

            // Generate unique filename
            String originalFilename = image.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String filename = UUID.randomUUID().toString() + fileExtension;
            Path filePath = Paths.get(IMAGE_UPLOAD_DIR + filename);

            // Save file
            Files.copy(image.getInputStream(), filePath);

            // Return accessible URL
            return "/uploads/products/" + filename;

        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}