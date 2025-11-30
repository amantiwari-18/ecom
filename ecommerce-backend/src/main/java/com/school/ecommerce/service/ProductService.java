package com.school.ecommerce.service;

import com.school.ecommerce.dto.ProductDTO;

import java.util.List;

public interface ProductService {
    ProductDTO create(ProductDTO dto);
    ProductDTO getById(String id);
    List<ProductDTO> getAll();
    List<ProductDTO> getByCategory(String categoryId);
    ProductDTO update(String id, ProductDTO dto);
    void delete(String id);
}

