package com.school.ecommerce.service;

import com.school.ecommerce.dto.CategoryDTO;

import java.util.List;

public interface CategoryService {
    CategoryDTO create(CategoryDTO dto);
    CategoryDTO getById(String id);
    List<CategoryDTO> getAll();
    CategoryDTO update(String id, CategoryDTO dto);
    void delete(String id);
}

