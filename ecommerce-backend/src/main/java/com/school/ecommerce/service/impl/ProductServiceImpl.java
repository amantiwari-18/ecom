package com.school.ecommerce.service.impl;

import com.school.ecommerce.dto.ProductDTO;
import com.school.ecommerce.exception.ResourceNotFoundException;
import com.school.ecommerce.model.Product;
import com.school.ecommerce.repository.ProductRepository;
import com.school.ecommerce.service.ProductService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    public ProductServiceImpl(ProductRepository productRepository) { this.productRepository = productRepository; }

    private ProductDTO toDTO(Product p) {
        ProductDTO dto = new ProductDTO();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription());
        dto.setPrice(p.getPrice());
        dto.setCategoryId(p.getCategoryId());
        dto.setImages(p.getImages());
        dto.setAvailablePlatforms(p.getAvailablePlatforms());
        dto.setLocalSale(p.isLocalSale());
        return dto;
    }

    private Product fromDTO(ProductDTO dto) {
        Product p = new Product();
        p.setId(dto.getId());
        p.setName(dto.getName());
        p.setDescription(dto.getDescription());
        p.setPrice(dto.getPrice());
        p.setCategoryId(dto.getCategoryId());
        p.setImages(dto.getImages());
        p.setAvailablePlatforms(dto.getAvailablePlatforms());
        p.setLocalSale(dto.isLocalSale());
        return p;
    }

    @Override
    public ProductDTO create(ProductDTO dto) {
        Product saved = productRepository.save(fromDTO(dto));
        return toDTO(saved);
    }

    @Override
    public ProductDTO getById(String id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return toDTO(p);
    }

    @Override
    public List<ProductDTO> getAll() {
        return productRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<ProductDTO> getByCategory(String categoryId) {
        return productRepository.findByCategoryId(categoryId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public ProductDTO update(String id, ProductDTO dto) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        if (dto.getName() != null) existing.setName(dto.getName());
        if (dto.getDescription() != null) existing.setDescription(dto.getDescription());
        if (dto.getPrice() != 0) existing.setPrice(dto.getPrice());
        if (dto.getCategoryId() != null) existing.setCategoryId(dto.getCategoryId());
        if (dto.getImages() != null) existing.setImages(dto.getImages());
        if (dto.getAvailablePlatforms() != null) existing.setAvailablePlatforms(dto.getAvailablePlatforms());
        existing.setLocalSale(dto.isLocalSale());
        Product saved = productRepository.save(existing);
        return toDTO(saved);
    }

    @Override
    public void delete(String id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        productRepository.delete(p);
    }
}

