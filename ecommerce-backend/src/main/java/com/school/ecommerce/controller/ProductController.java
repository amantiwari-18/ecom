package com.school.ecommerce.controller;

import com.school.ecommerce.dto.ProductDTO;
import com.school.ecommerce.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ProductDTO> create(@RequestBody ProductDTO dto) {
        return ResponseEntity.ok(productService.create(dto));
    }

    @PostMapping("/upload")
    public ResponseEntity<ProductDTO> createWithImage(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam double price,
            @RequestParam String categoryId,
            @RequestParam(required = false) MultipartFile image) {
        ProductDTO dto = new ProductDTO();
        dto.setName(name);
        dto.setDescription(description);
        dto.setPrice(price);
        dto.setCategoryId(categoryId);
        dto.setImage(image);
        return ResponseEntity.ok(productService.createWithImage(dto));
    }

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAll() {
        return ResponseEntity.ok(productService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductDTO>> getByCategory(@PathVariable String categoryId) {
        return ResponseEntity.ok(productService.getByCategory(categoryId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> update(@PathVariable String id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Double price,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) MultipartFile image) {
        ProductDTO dto = new ProductDTO();
        if (name != null)
            dto.setName(name);
        if (description != null)
            dto.setDescription(description);
        if (price != null)
            dto.setPrice(price);
        if (categoryId != null)
            dto.setCategoryId(categoryId);
        if (image != null)
            dto.setImage(image);
        return ResponseEntity.ok(productService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
