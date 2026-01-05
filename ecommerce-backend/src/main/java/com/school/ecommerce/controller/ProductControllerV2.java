package com.school.ecommerce.controller;

import com.school.ecommerce.dto.ProductDTO;
import com.school.ecommerce.dto.ProductFilterDTO;
import com.school.ecommerce.dto.PaginatedResponseDTO;
import com.school.ecommerce.model.ExternalLink;
import com.school.ecommerce.service.ProductServiceV2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v2/products")
@CrossOrigin(origins = "*")
public class ProductControllerV2 {

    private final ProductServiceV2 productService;

    public ProductControllerV2(ProductServiceV2 productService) {
        this.productService = productService;
    }

    // ==================== SEARCH & FILTER ENDPOINTS ====================

    @GetMapping("/search")
    public ResponseEntity<PaginatedResponseDTO<ProductDTO>> searchProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(required = false) List<String> platforms,
            @RequestParam(required = false) Boolean hasExternalLinks,
            @RequestParam(required = false) Boolean isNew,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit,
            @RequestParam(defaultValue = "false") boolean includeHits) {

        // Use builder pattern instead
        ProductFilterDTO filter = ProductFilterDTO.builder()
                .search(search)
                .category(category)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .inStock(inStock)
                .platforms(platforms)
                .hasExternalLinks(hasExternalLinks)
                .isNew(isNew)
                .sortBy(sortBy)
                .page(page)
                .limit(limit)
                .includeHits(includeHits)
                .build();

        PaginatedResponseDTO<ProductDTO> response = productService.searchProducts(filter);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search/suggestions")
    public ResponseEntity<?> searchSuggestions(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(productService.getSearchSuggestions(q, limit));
    }

    // ==================== SPECIAL COLLECTION ENDPOINTS ====================

    @GetMapping("/featured")
    public ResponseEntity<List<ProductDTO>> getFeaturedProducts(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(productService.getFeaturedProducts(limit));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<ProductDTO>> getTrendingProducts(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(productService.getTrendingProducts(limit));
    }

    @GetMapping("/new")
    public ResponseEntity<List<ProductDTO>> getNewArrivals(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(productService.getNewArrivals(limit));
    }

    @GetMapping("/sale")
    public ResponseEntity<List<ProductDTO>> getProductsOnSale(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(productService.getProductsOnSale(limit));
    }

    // ==================== PRODUCT DETAILS ENDPOINTS ====================

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(
            @PathVariable String id,
            @RequestParam(defaultValue = "false") boolean track) {

        if (track) {
            productService.incrementProductHits(id);
        }

        ProductDTO product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/{id}/similar")
    public ResponseEntity<List<ProductDTO>> getSimilarProducts(
            @PathVariable String id,
            @RequestParam(defaultValue = "4") int limit) {
        return ResponseEntity.ok(productService.getSimilarProducts(id, limit));
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<?> getProductAnalytics(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProductAnalytics(id));
    }

    @PostMapping("/{id}/hit")
    public ResponseEntity<Void> trackProductView(@PathVariable String id) {
        productService.incrementProductHits(id);
        return ResponseEntity.ok().build();
    }

    // ==================== BATCH OPERATIONS ====================

    @PostMapping("/batch")
    public ResponseEntity<List<ProductDTO>> getProductsByIds(@RequestBody List<String> ids) {
        return ResponseEntity.ok(productService.getProductsByIds(ids));
    }

    // ==================== CRUD ENDPOINTS ====================

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

    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> update(
            @PathVariable String id,
            @RequestBody ProductDTO dto) {
        return ResponseEntity.ok(productService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== EXTERNAL LINKS & PLATFORMS ====================

    @PutMapping("/{id}/external-links")
    public ResponseEntity<ProductDTO> updateExternalLinks(
            @PathVariable String id,
            @RequestBody List<ExternalLink> externalLinks) {
        return ResponseEntity.ok(productService.updateExternalLinks(id, externalLinks));
    }

    @PutMapping("/{id}/platforms")
    public ResponseEntity<ProductDTO> updatePlatforms(
            @PathVariable String id,
            @RequestBody List<String> platforms) {
        return ResponseEntity.ok(productService.updatePlatforms(id, platforms));
    }

    @PutMapping("/{id}/images")
    public ResponseEntity<ProductDTO> updateImages(
            @PathVariable String id,
            @RequestParam List<MultipartFile> images) {
        return ResponseEntity.ok(productService.updateImages(id, images));
    }
}