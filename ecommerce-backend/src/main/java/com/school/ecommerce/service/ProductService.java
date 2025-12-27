package com.school.ecommerce.service;

import com.school.ecommerce.dto.ProductDTO;
import com.school.ecommerce.model.ExternalLink;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {

    /* ===================== CREATE ===================== */

    // Create product using JSON body
    ProductDTO create(ProductDTO dto);

    // Create product with image upload
    ProductDTO createWithImage(ProductDTO dto);

    /* ===================== READ ===================== */

    ProductDTO getById(String id);

    List<ProductDTO> getAll();

    List<ProductDTO> getByCategory(String categoryId);

    /* ===================== UPDATE (BASIC FIELDS) ===================== */

    // Update name, description, price, category (safe partial update)
    ProductDTO update(String id, ProductDTO dto);

    /* ===================== UPDATE (ADVANCED FIELDS) ===================== */

    // Update / replace external links
    ProductDTO updateExternalLinks(String productId, List<ExternalLink> externalLinks);

    // Update / replace available platforms
    ProductDTO updatePlatforms(String productId, List<String> platforms);

    // Update / replace images
    ProductDTO updateImages(String productId, List<MultipartFile> images);

    /* ===================== DELETE ===================== */

    void delete(String id);
}
