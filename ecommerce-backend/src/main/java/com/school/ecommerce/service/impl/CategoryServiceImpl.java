package com.school.ecommerce.service.impl;

import com.school.ecommerce.dto.CategoryDTO;
import com.school.ecommerce.exception.ResourceNotFoundException;
import com.school.ecommerce.model.Category;
import com.school.ecommerce.repository.CategoryRepository;
import com.school.ecommerce.service.CategoryService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    public CategoryServiceImpl(CategoryRepository categoryRepository) { this.categoryRepository = categoryRepository; }

    private CategoryDTO toDTO(Category c) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setDescription(c.getDescription());
        return dto;
    }

    private Category fromDTO(CategoryDTO dto) {
        Category c = new Category();
        c.setId(dto.getId());
        c.setName(dto.getName());
        c.setDescription(dto.getDescription());
        return c;
    }

    @Override
    public CategoryDTO create(CategoryDTO dto) {
        Category saved = categoryRepository.save(fromDTO(dto));
        return toDTO(saved);
    }

    @Override
    public CategoryDTO getById(String id) {
        Category c = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return toDTO(c);
    }

    @Override
    public List<CategoryDTO> getAll() {
        return categoryRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public CategoryDTO update(String id, CategoryDTO dto) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (dto.getName() != null) existing.setName(dto.getName());
        if (dto.getDescription() != null) existing.setDescription(dto.getDescription());
        Category saved = categoryRepository.save(existing);
        return toDTO(saved);
    }

    @Override
    public void delete(String id) {
        Category c = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        categoryRepository.delete(c);
    }
}

